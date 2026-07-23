"""
DPP (Dijital Ürün Pasaportu) API.

AB ESPR (Tüzük 2024/1781) dayanaklı. Auth'lu şirket API'si + kamuya
açık QR görüntüleyici endpoint'i.

Public endpoint (/public/passport/{id}) auth istemez — QR kodun hedefi.
"""
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime, timezone, date

from ..database import get_db
from ..models import (
    User, Product, ProductPassport,
    PassportMaterial, PassportDocument, PassportEvent,
)
from ..models.product import PRODUCT_CATEGORIES
from ..models.product_passport import PASSPORT_STATUS, EVENT_TYPES, DOCUMENT_TYPES
from ..services import dpp_service
from ..services.green_score_service import compute_green_score
from ..services.dpp_ai_service import ask_passport_assistant
from .auth import get_current_user
import secrets

router = APIRouter(prefix="/dpp", tags=["dpp"])
public_router = APIRouter(prefix="/public/passport", tags=["dpp-public"])


# ─────────────────── Schemas ───────────────────

class ProductCreate(BaseModel):
    sku: str = Field(min_length=1, max_length=100)
    gtin: Optional[str] = Field(default=None, max_length=14)
    name_tr: str = Field(min_length=1, max_length=255)
    name_en: Optional[str] = None
    category: str = "textile"
    subcategory: Optional[str] = None
    manufacturing_site: Optional[str] = None
    manufacturing_country: Optional[str] = Field(default=None, max_length=2)
    manufactured_at: Optional[date] = None

    @field_validator("category")
    @classmethod
    def _validate_category(cls, v: str) -> str:
        if v not in PRODUCT_CATEGORIES:
            raise ValueError(f"category '{v}' izinli değil. İzinliler: {list(PRODUCT_CATEGORIES)}")
        return v


class ProductRead(ProductCreate):
    id: str
    company_id: str
    created_at: datetime


class MaterialIn(BaseModel):
    material_name: str
    percentage_by_weight: Optional[float] = Field(default=None, ge=0, le=100)
    source_country: Optional[str] = Field(default=None, max_length=2)
    recycled_content_pct: Optional[float] = Field(default=None, ge=0, le=100)
    is_hazardous: bool = False
    hazardous_details: Optional[dict] = None


class DocumentIn(BaseModel):
    doc_type: str
    title: str
    file_url: str
    issued_by: Optional[str] = None
    issued_at: Optional[date] = None
    valid_until: Optional[date] = None


class PassportCreate(BaseModel):
    carbon_footprint_kgco2e: Optional[float] = Field(default=None, ge=0)
    recycled_content_pct: Optional[float] = Field(default=None, ge=0, le=100)
    repairability_score: Optional[float] = Field(default=None, ge=0, le=10)


class RevokeRequest(BaseModel):
    reason: str = Field(min_length=1, max_length=500)


class AskRequest(BaseModel):
    question: str = Field(min_length=3, max_length=500)


class ReturnRequest(BaseModel):
    requestor_email: Optional[str] = None
    requestor_name: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = Field(default=None, max_length=500)


# ─────────────────── Helpers ───────────────────

async def _get_product_or_403(db: AsyncSession, product_id: str, user: User) -> Product:
    product = await db.get(Product, product_id)
    if not product:
        raise HTTPException(404, "Ürün bulunamadı")
    if product.company_id != user.company_id:
        raise HTTPException(403, "Bu ürüne erişim yetkiniz yok")
    return product


async def _get_passport_or_403(db: AsyncSession, passport_id: str, user: User) -> ProductPassport:
    passport = await db.get(ProductPassport, passport_id)
    if not passport:
        raise HTTPException(404, "Pasaport bulunamadı")
    product = await db.get(Product, passport.product_id)
    if not product or product.company_id != user.company_id:
        raise HTTPException(403, "Bu pasaporta erişim yetkiniz yok")
    return passport


def _log_event(passport_id: str, event_type: str, actor: Optional[str], meta: Optional[dict] = None) -> PassportEvent:
    if event_type not in EVENT_TYPES:
        event_type = "updated"
    return PassportEvent(
        passport_id=passport_id,
        event_type=event_type,
        actor=actor,
        event_metadata=meta or {},
    )


# ─────────────────── Product CRUD ───────────────────

@router.post("/products", response_model=ProductRead, status_code=201)
async def create_product(
    body: ProductCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    product = Product(
        company_id=user.company_id,
        sku=body.sku,
        gtin=body.gtin,
        name_tr=body.name_tr,
        name_en=body.name_en,
        category=body.category,
        subcategory=body.subcategory,
        manufacturing_site=body.manufacturing_site,
        manufacturing_country=body.manufacturing_country,
        manufactured_at=body.manufactured_at,
    )
    db.add(product)
    await db.flush()
    return ProductRead(id=product.id, company_id=product.company_id, created_at=product.created_at, **body.model_dump())


@router.get("/products")
async def list_products(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    q = select(Product).where(Product.company_id == user.company_id).order_by(Product.created_at.desc())
    rows = (await db.execute(q)).scalars().all()
    return {
        "count": len(rows),
        "products": [
            {
                "id": p.id, "sku": p.sku, "gtin": p.gtin,
                "name_tr": p.name_tr, "category": p.category,
                "subcategory": p.subcategory,
                "manufactured_at": p.manufactured_at.isoformat() if p.manufactured_at else None,
                "passport_count": len(p.passports or []),
                "latest_passport_status": (p.passports[0].status if p.passports else None),
            }
            for p in rows
        ],
    }


@router.get("/products/{product_id}")
async def get_product(
    product_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    p = await _get_product_or_403(db, product_id, user)
    return {
        "id": p.id, "sku": p.sku, "gtin": p.gtin,
        "name_tr": p.name_tr, "name_en": p.name_en,
        "category": p.category, "subcategory": p.subcategory,
        "manufacturing_site": p.manufacturing_site,
        "manufacturing_country": p.manufacturing_country,
        "manufactured_at": p.manufactured_at.isoformat() if p.manufactured_at else None,
        "passports": [
            {"id": pp.id, "version": pp.version, "status": pp.status,
             "issued_at": pp.issued_at.isoformat() if pp.issued_at else None}
            for pp in (p.passports or [])
        ],
    }


# ─────────────────── Passport lifecycle ───────────────────

@router.post("/products/{product_id}/passport", status_code=201)
async def create_passport(
    product_id: str,
    body: PassportCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Ürün için yeni draft pasaport. Version otomatik artar."""
    product = await _get_product_or_403(db, product_id, user)
    latest_version = max((pp.version for pp in (product.passports or [])), default=0)

    passport = ProductPassport(
        product_id=product.id,
        version=latest_version + 1,
        status="draft",
        carbon_footprint_kgco2e=body.carbon_footprint_kgco2e,
        recycled_content_pct=body.recycled_content_pct,
        repairability_score=body.repairability_score,
        gs1_digital_link=dpp_service.build_gs1_digital_link(product.gtin, ""),
        created_by=user.id,
    )
    db.add(passport)
    await db.flush()
    passport.gs1_digital_link = dpp_service.build_gs1_digital_link(product.gtin, passport.id)
    db.add(_log_event(passport.id, "created", user.email))
    return {"id": passport.id, "version": passport.version, "status": passport.status}


@router.post("/passports/{passport_id}/issue")
async def issue_passport(
    passport_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Draft pasaportu yayınla. Snapshot alınır, artık değiştirilemez alanlar donar."""
    passport = await _get_passport_or_403(db, passport_id, user)
    if passport.status != "draft":
        raise HTTPException(400, f"Sadece draft yayınlanabilir. Mevcut durum: {passport.status}")

    product = await db.get(Product, passport.product_id)
    passport.data_json = dpp_service.to_jsonld(passport, product)
    passport.status = "issued"
    passport.issued_at = datetime.now(timezone.utc)

    # Eski issued sürümleri superseded'e çek
    old_q = select(ProductPassport).where(
        ProductPassport.product_id == passport.product_id,
        ProductPassport.status == "issued",
        ProductPassport.id != passport.id,
    )
    for old in (await db.execute(old_q)).scalars():
        old.status = "superseded"
        db.add(_log_event(old.id, "updated", user.email, {"reason": f"superseded_by:{passport.id}"}))

    db.add(_log_event(passport.id, "issued", user.email))
    return {
        "id": passport.id, "status": passport.status,
        "issued_at": passport.issued_at.isoformat(),
        "public_url": dpp_service.build_public_url(passport.id),
    }


@router.post("/passports/{passport_id}/revoke")
async def revoke_passport(
    passport_id: str,
    body: RevokeRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    passport = await _get_passport_or_403(db, passport_id, user)
    if passport.status != "issued":
        raise HTTPException(400, "Sadece yayınlanmış pasaport geri çekilebilir.")
    passport.status = "revoked"
    passport.revoked_at = datetime.now(timezone.utc)
    passport.revoke_reason = body.reason
    db.add(_log_event(passport.id, "revoked", user.email, {"reason": body.reason}))
    return {"id": passport.id, "status": "revoked", "revoked_at": passport.revoked_at.isoformat()}


@router.get("/passports/{passport_id}")
async def get_passport(
    passport_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    passport = await _get_passport_or_403(db, passport_id, user)
    product = await db.get(Product, passport.product_id)
    return {
        "id": passport.id, "version": passport.version, "status": passport.status,
        "product": {"id": product.id, "sku": product.sku, "name_tr": product.name_tr},
        "carbon_footprint_kgco2e": passport.carbon_footprint_kgco2e,
        "recycled_content_pct": passport.recycled_content_pct,
        "repairability_score": passport.repairability_score,
        "gs1_digital_link": passport.gs1_digital_link,
        "public_url": dpp_service.build_public_url(passport.id),
        "issued_at": passport.issued_at.isoformat() if passport.issued_at else None,
        "materials": [
            {"id": m.id, "material_name": m.material_name,
             "percentage_by_weight": m.percentage_by_weight,
             "source_country": m.source_country,
             "recycled_content_pct": m.recycled_content_pct,
             "is_hazardous": m.is_hazardous}
            for m in (passport.materials or [])
        ],
        "documents": [
            {"id": d.id, "doc_type": d.doc_type, "title": d.title,
             "file_url": d.file_url, "issued_by": d.issued_by,
             "valid_until": d.valid_until.isoformat() if d.valid_until else None}
            for d in (passport.documents or [])
        ],
        "events": [
            {"id": e.id, "event_type": e.event_type, "actor": e.actor,
             "timestamp": e.timestamp.isoformat()}
            for e in (passport.events or [])
        ],
    }


# ─────────────────── Materials & Documents ───────────────────

@router.post("/passports/{passport_id}/materials", status_code=201)
async def add_material(
    passport_id: str,
    body: MaterialIn,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    passport = await _get_passport_or_403(db, passport_id, user)
    if passport.status != "draft":
        raise HTTPException(400, "Malzeme sadece draft pasaporta eklenebilir.")
    m = PassportMaterial(passport_id=passport.id, **body.model_dump())
    db.add(m)
    db.add(_log_event(passport.id, "material_added", user.email, {"name": body.material_name}))
    await db.flush()
    return {"id": m.id, "material_name": m.material_name}


@router.post("/passports/{passport_id}/documents", status_code=201)
async def add_document(
    passport_id: str,
    body: DocumentIn,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    passport = await _get_passport_or_403(db, passport_id, user)
    if body.doc_type not in DOCUMENT_TYPES:
        raise HTTPException(400, f"Geçersiz belge tipi. İzin verilenler: {list(DOCUMENT_TYPES)}")
    d = PassportDocument(passport_id=passport.id, **body.model_dump())
    db.add(d)
    db.add(_log_event(passport.id, "document_added", user.email, {"type": body.doc_type, "title": body.title}))
    await db.flush()
    return {"id": d.id, "doc_type": d.doc_type, "title": d.title}


# ─────────────────── Exports ───────────────────

@router.get("/passports/{passport_id}/qr")
async def qr_code(
    passport_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    passport = await _get_passport_or_403(db, passport_id, user)
    url = dpp_service.build_public_url(passport.id)
    svg = dpp_service.generate_qr_svg(url)
    return Response(content=svg, media_type="image/svg+xml")


# ─────────────────── Green Score (Gemini önerisi) ───────────────────

@router.post("/passports/{passport_id}/score")
async def compute_and_save_score(
    passport_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Yeşil Skor'u yeniden hesapla ve pasaporta kaydet."""
    passport = await _get_passport_or_403(db, passport_id, user)
    product = await db.get(Product, passport.product_id)

    materials_dict = [
        {
            "material_name": m.material_name,
            "percentage_by_weight": m.percentage_by_weight,
            "recycled_content_pct": m.recycled_content_pct,
            "is_hazardous": m.is_hazardous,
        }
        for m in (passport.materials or [])
    ]
    documents_dict = [{"doc_type": d.doc_type} for d in (passport.documents or [])]

    result = compute_green_score(
        materials=materials_dict,
        carbon_kgco2e=passport.carbon_footprint_kgco2e,
        category=product.category,
        documents=documents_dict,
        repairability=passport.repairability_score,
    )
    passport.green_score = result.total
    passport.green_score_breakdown = {
        "grade": result.grade,
        "formula_version": result.formula_version,
        **result.breakdown,
    }
    db.add(_log_event(passport.id, "score_computed", user.email,
                       {"score": result.total, "grade": result.grade}))
    return {
        "passport_id": passport.id,
        "green_score": result.total,
        "grade": result.grade,
        "breakdown": result.breakdown,
    }


# ─────────────────── AI Q&A (Gemini önerisi) ───────────────────

@router.post("/passports/{passport_id}/ask")
async def ask_ai_authenticated(
    passport_id: str,
    body: AskRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Kimliği doğrulanmış kullanıcı için pasaport bağlamında Q&A."""
    passport = await _get_passport_or_403(db, passport_id, user)
    product = await db.get(Product, passport.product_id)
    context = dpp_service.make_public_snapshot(passport, product)
    result = await ask_passport_assistant(body.question, passport.id, context)
    db.add(_log_event(passport.id, "ai_query", user.email,
                       {"question": body.question[:100], "source": result["source"]}))
    return result


@router.get("/passports/{passport_id}/jsonld")
async def jsonld_export(
    passport_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    passport = await _get_passport_or_403(db, passport_id, user)
    if passport.status == "issued" and passport.data_json:
        return passport.data_json
    product = await db.get(Product, passport.product_id)
    return dpp_service.to_jsonld(passport, product)


# ─────────────────── Public (no auth) ───────────────────

async def _fetch_public_passport(db: AsyncSession, passport_id: str) -> tuple[ProductPassport, Product]:
    passport = await db.get(ProductPassport, passport_id)
    if not passport:
        raise HTTPException(404, "Pasaport bulunamadı")
    if passport.status not in ("issued", "revoked"):
        raise HTTPException(404, "Pasaport yayınlanmamış")
    product = await db.get(Product, passport.product_id)
    if not product:
        raise HTTPException(404, "Ürün bulunamadı")
    return passport, product


@public_router.get("/{passport_id}")
async def public_passport(passport_id: str, db: AsyncSession = Depends(get_db)):
    """QR kodun hedefi. Yalnızca yayınlanmış (issued/revoked) pasaportlar."""
    passport, product = await _fetch_public_passport(db, passport_id)
    snapshot = dpp_service.make_public_snapshot(passport, product)
    if passport.status == "revoked":
        snapshot["revoked"] = True
        snapshot["revoked_at"] = passport.revoked_at.isoformat() if passport.revoked_at else None
    return snapshot


@public_router.post("/{passport_id}/ask")
async def public_ask_ai(
    passport_id: str,
    body: AskRequest,
    db: AsyncSession = Depends(get_db),
):
    """Kamuya açık Q&A — QR'den gelen tüketici için. Cache + fallback korumalı."""
    passport, product = await _fetch_public_passport(db, passport_id)
    context = dpp_service.make_public_snapshot(passport, product)
    result = await ask_passport_assistant(body.question, passport.id, context)
    db.add(_log_event(passport.id, "ai_query", "public",
                       {"question": body.question[:100], "source": result["source"]}))
    return result


@public_router.post("/{passport_id}/return-request", status_code=201)
async def public_return_request(
    passport_id: str,
    body: ReturnRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    İade / geri dönüşüm talebi (Gemini önerisi — döngüsel ekonomi).
    Kupon kodu üretilir; PassportEvent'e yazılır. Kuponu geri alma akışı V2.
    """
    passport, _ = await _fetch_public_passport(db, passport_id)
    coupon = f"DPP-{secrets.token_hex(4).upper()}"
    meta = {
        "coupon_code": coupon,
        "discount_pct": 10,
        "requestor_email": body.requestor_email,
        "requestor_name": body.requestor_name,
        "location": body.location,
        "notes": body.notes,
    }
    db.add(_log_event(passport.id, "return_requested", "public", meta))
    return {
        "passport_id": passport.id,
        "coupon_code": coupon,
        "discount_pct": 10,
        "message": "İade talebiniz alındı. Aşağıdaki kupon kodunu üreticinin geri dönüşüm noktasında gösterin.",
    }
