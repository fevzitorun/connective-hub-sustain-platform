"""
DPP (Dijital Ürün Pasaportu) API.

AB ESPR (Tüzük 2024/1781) dayanaklı. Auth'lu şirket API'si + kamuya
açık QR görüntüleyici endpoint'i.

Public endpoint (/public/passport/{id}) auth istemez — QR kodun hedefi.
"""
from fastapi import APIRouter, Depends, HTTPException, Response, Query, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime, timezone, date
import csv
import io
import secrets

from ..database import get_db
from ..models import (
    User, Product, ProductPassport,
    PassportMaterial, PassportDocument, PassportEvent,
    PassportSupplier,
)
from ..models.product import PRODUCT_CATEGORIES, ENERGY_CLASSES
from ..models.product_passport import PASSPORT_STATUS, EVENT_TYPES, DOCUMENT_TYPES
from ..services import dpp_service
from ..services.green_score_service import compute_green_score
from ..services.dpp_ai_service import ask_passport_assistant
from ..services.dpp_templates import validate_passport, get_template
from ..services.dpp_pdf_service import generate_pdf
from ..services import dpp_i18n
from .auth import get_current_user

router = APIRouter(prefix="/dpp", tags=["dpp"])
public_router = APIRouter(prefix="/public/passport", tags=["dpp-public"])


# ─────────────────── Schemas ───────────────────

class ProductCreate(BaseModel):
    sku: str = Field(min_length=1, max_length=100)
    gtin: Optional[str] = Field(default=None, max_length=14)
    name_tr: str = Field(min_length=1, max_length=255)
    name_en: Optional[str] = None
    name_de: Optional[str] = None
    name_fr: Optional[str] = None
    description_tr: Optional[str] = None
    description_en: Optional[str] = None
    category: str = "textile"
    subcategory: Optional[str] = None
    batch_number: Optional[str] = Field(default=None, max_length=50)
    serial_number: Optional[str] = Field(default=None, max_length=100)
    weight_kg: Optional[float] = Field(default=None, ge=0)
    dimensions: Optional[dict] = None
    ce_marked: bool = False
    energy_class: Optional[str] = None
    warranty_months: Optional[int] = Field(default=None, ge=0, le=600)
    manufacturing_site: Optional[str] = None
    manufacturing_country: Optional[str] = Field(default=None, max_length=2)
    manufactured_at: Optional[date] = None

    @field_validator("category")
    @classmethod
    def _validate_category(cls, v: str) -> str:
        if v not in PRODUCT_CATEGORIES:
            raise ValueError(f"category '{v}' izinli değil. İzinliler: {list(PRODUCT_CATEGORIES)}")
        return v

    @field_validator("energy_class")
    @classmethod
    def _validate_energy(cls, v: Optional[str]) -> Optional[str]:
        if v and v.upper() not in ENERGY_CLASSES:
            raise ValueError(f"energy_class '{v}' geçersiz. İzinliler: {list(ENERGY_CLASSES)}")
        return v.upper() if v else None

    @field_validator("gtin")
    @classmethod
    def _validate_gtin(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            return v
        s = v.strip().replace("-", "").replace(" ", "")
        if not s.isdigit() or len(s) not in (8, 12, 13, 14):
            raise ValueError("GTIN 8/12/13/14 haneli sayısal olmalı")
        return s


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
    recycling_instructions: Optional[str] = Field(default=None, max_length=2000)


class PassportPatch(BaseModel):
    carbon_footprint_kgco2e: Optional[float] = Field(default=None, ge=0)
    recycled_content_pct: Optional[float] = Field(default=None, ge=0, le=100)
    repairability_score: Optional[float] = Field(default=None, ge=0, le=10)
    recycling_instructions: Optional[str] = Field(default=None, max_length=2000)


class SupplierIn(BaseModel):
    tier: int = Field(default=1, ge=1, le=5)
    name: str = Field(min_length=1, max_length=255)
    country: Optional[str] = Field(default=None, max_length=2)
    role: Optional[str] = Field(default=None, max_length=100)
    material_or_component: Optional[str] = None
    certifications: Optional[list[str]] = None
    contact_email: Optional[str] = None


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
    product = Product(company_id=user.company_id, **body.model_dump())
    db.add(product)
    await db.flush()
    return ProductRead(
        id=product.id, company_id=product.company_id,
        created_at=product.created_at, **body.model_dump(),
    )


@router.patch("/products/{product_id}", response_model=ProductRead)
async def update_product(
    product_id: str,
    body: ProductCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    product = await _get_product_or_403(db, product_id, user)
    for field, value in body.model_dump().items():
        setattr(product, field, value)
    await db.flush()
    return ProductRead(
        id=product.id, company_id=product.company_id,
        created_at=product.created_at, **body.model_dump(),
    )


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
        recycling_instructions=body.recycling_instructions,
        created_by=user.id,
    )
    db.add(passport)
    await db.flush()
    passport.gs1_digital_link = dpp_service.build_gs1_digital_link(product.gtin, passport.id)
    db.add(_log_event(passport.id, "created", user.email))
    return {"id": passport.id, "version": passport.version, "status": passport.status}


@router.patch("/passports/{passport_id}")
async def patch_passport(
    passport_id: str,
    body: PassportPatch,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Draft alanları güncelle. Issued/revoked donmuştur."""
    passport = await _get_passport_or_403(db, passport_id, user)
    if passport.status != "draft":
        raise HTTPException(400, f"Sadece draft güncellenebilir. Mevcut: {passport.status}")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(passport, field, value)
    db.add(_log_event(passport.id, "updated", user.email))
    return {"id": passport.id, "status": passport.status}


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
        "product": {"id": product.id, "sku": product.sku, "name_tr": product.name_tr,
                     "category": product.category},
        "carbon_footprint_kgco2e": passport.carbon_footprint_kgco2e,
        "recycled_content_pct": passport.recycled_content_pct,
        "repairability_score": passport.repairability_score,
        "recycling_instructions": passport.recycling_instructions,
        "green_score": passport.green_score,
        "green_score_breakdown": passport.green_score_breakdown,
        "completeness_pct": passport.completeness_pct,
        "gs1_digital_link": passport.gs1_digital_link,
        "public_url": dpp_service.build_public_url(passport.id),
        "issued_at": passport.issued_at.isoformat() if passport.issued_at else None,
        "revoked_at": passport.revoked_at.isoformat() if passport.revoked_at else None,
        "scan_count": passport.scan_count,
        "ai_query_count": passport.ai_query_count,
        "return_request_count": passport.return_request_count,
        "materials": [
            {"id": m.id, "material_name": m.material_name,
             "percentage_by_weight": m.percentage_by_weight,
             "source_country": m.source_country,
             "recycled_content_pct": m.recycled_content_pct,
             "is_hazardous": m.is_hazardous}
            for m in (passport.materials or [])
        ],
        "suppliers": [
            {"id": s.id, "tier": s.tier, "name": s.name,
             "country": s.country, "role": s.role,
             "material_or_component": s.material_or_component,
             "certifications": s.certifications or [],
             "verified": s.verified}
            for s in (passport.suppliers or [])
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


@router.post("/passports/{passport_id}/suppliers", status_code=201)
async def add_supplier(
    passport_id: str,
    body: SupplierIn,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Tedarik zinciri Tier 1 (V2'de tier 2/3 + davet akışı)."""
    passport = await _get_passport_or_403(db, passport_id, user)
    if passport.status != "draft":
        raise HTTPException(400, "Tedarikçi sadece draft'a eklenebilir.")
    s = PassportSupplier(passport_id=passport.id, **body.model_dump())
    db.add(s)
    db.add(_log_event(passport.id, "updated", user.email,
                       {"supplier_added": body.name, "tier": body.tier}))
    await db.flush()
    return {"id": s.id, "name": s.name, "tier": s.tier}


# ─────────────────── Validation (şablona göre tamamlanma) ───────────────────

@router.get("/passports/{passport_id}/validate")
async def validate_completeness(
    passport_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Sektör şablonuna göre pasaportun ne kadar tam olduğunu döner.
    `ready_to_issue: true` ise `POST /issue` güvenle çağrılabilir.
    """
    passport = await _get_passport_or_403(db, passport_id, user)
    product = await db.get(Product, passport.product_id)
    report = validate_passport(passport, product)
    passport.completeness_pct = report["completeness_pct"]
    return report


@router.get("/templates/{category}")
async def get_sector_template(
    category: str,
    user: User = Depends(get_current_user),
):
    """Bir sektörün zorunlu/tavsiye alanları + skor ağırlıkları."""
    if category not in PRODUCT_CATEGORIES:
        raise HTTPException(400, "Geçersiz kategori")
    t = get_template(category)
    return {
        "category": category,
        "required_fields": sorted(t["required_fields"]),
        "recommended_fields": sorted(t["recommended_fields"]),
        "required_documents": sorted(t.get("required_documents") or []),
        "alt_documents": sorted(t.get("alt_documents") or []),
        "min_materials": t["min_materials"],
        "min_suppliers_tier1": t["min_suppliers_tier1"],
        "green_weights": t["green_weights"],
    }


# ─────────────────── PDF export (baskı) ───────────────────

@router.get("/passports/{passport_id}/pdf")
async def export_pdf(
    passport_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """A4 baskıya hazır PDF; WeasyPrint yoksa HTML fallback."""
    passport = await _get_passport_or_403(db, passport_id, user)
    product = await db.get(Product, passport.product_id)
    content, media = generate_pdf(passport, product)
    ext = "pdf" if media == "application/pdf" else "html"
    filename = f"DPP-{product.sku}-v{passport.version}.{ext}"
    return Response(
        content=content, media_type=media,
        headers={"Content-Disposition": f'inline; filename="{filename}"'},
    )


# ─────────────────── Compare (versiyon diff) ───────────────────

@router.get("/passports/{passport_id}/compare/{other_id}")
async def compare_passports(
    passport_id: str,
    other_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """İki pasaport arasında sürdürülebilirlik metriklerinin farkı."""
    a = await _get_passport_or_403(db, passport_id, user)
    b = await _get_passport_or_403(db, other_id, user)

    def delta(x, y):
        if x is None or y is None:
            return None
        return round(y - x, 2)

    return {
        "a": {"id": a.id, "version": a.version, "status": a.status},
        "b": {"id": b.id, "version": b.version, "status": b.status},
        "carbon_delta_kgco2e": delta(a.carbon_footprint_kgco2e, b.carbon_footprint_kgco2e),
        "green_score_delta": delta(a.green_score, b.green_score),
        "recycled_content_delta_pct": delta(a.recycled_content_pct, b.recycled_content_pct),
        "repairability_delta": delta(a.repairability_score, b.repairability_score),
        "materials_added": len(b.materials or []) - len(a.materials or []),
        "documents_added": len(b.documents or []) - len(a.documents or []),
        "suppliers_added": len(b.suppliers or []) - len(a.suppliers or []),
    }


# ─────────────────── Analytics (şirket dashboard) ───────────────────

@router.get("/analytics")
async def dpp_analytics(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Şirketin DPP portföyü için üst düzey metrikler."""
    q_products = select(func.count(Product.id)).where(Product.company_id == user.company_id)
    total_products = (await db.execute(q_products)).scalar_one()

    q_passports = (
        select(ProductPassport.status, func.count(ProductPassport.id))
        .join(Product, Product.id == ProductPassport.product_id)
        .where(Product.company_id == user.company_id)
        .group_by(ProductPassport.status)
    )
    by_status = dict((await db.execute(q_passports)).all())

    q_agg = (
        select(
            func.avg(ProductPassport.green_score),
            func.sum(ProductPassport.scan_count),
            func.sum(ProductPassport.ai_query_count),
            func.sum(ProductPassport.return_request_count),
        )
        .join(Product, Product.id == ProductPassport.product_id)
        .where(Product.company_id == user.company_id)
    )
    avg_score, total_scans, total_ai, total_returns = (await db.execute(q_agg)).one()

    q_top = (
        select(ProductPassport)
        .join(Product, Product.id == ProductPassport.product_id)
        .where(Product.company_id == user.company_id)
        .order_by(ProductPassport.scan_count.desc())
        .limit(5)
    )
    top_scanned = [
        {"passport_id": p.id, "scans": p.scan_count, "green_score": p.green_score}
        for p in (await db.execute(q_top)).scalars().all()
    ]

    return {
        "products": total_products,
        "passports_by_status": by_status,
        "avg_green_score": round(avg_score, 1) if avg_score else None,
        "total_scans": total_scans or 0,
        "total_ai_queries": total_ai or 0,
        "total_return_requests": total_returns or 0,
        "top_scanned": top_scanned,
    }


# ─────────────────── Bulk import (CSV) ───────────────────

@router.get("/products/bulk-template")
async def bulk_import_template(user: User = Depends(get_current_user)):
    """Toplu içe aktarma için CSV başlıkları + örnek satır."""
    headers = [
        "sku", "gtin", "name_tr", "name_en", "category", "subcategory",
        "batch_number", "serial_number", "weight_kg",
        "ce_marked", "energy_class", "warranty_months",
        "manufacturing_site", "manufacturing_country", "manufactured_at",
    ]
    example = [
        "TR-TEX-001", "8690123456789", "Organik Pamuk Tişört", "Organic Cotton T-Shirt",
        "textile", "erkek-tişört",
        "B-2027-01", "", "0.18",
        "false", "", "24",
        "İstanbul-Çorlu", "TR", "2027-01-15",
    ]
    output = io.StringIO()
    w = csv.writer(output)
    w.writerow(headers)
    w.writerow(example)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="dpp-bulk-template.csv"'},
    )


@router.post("/products/bulk-import")
async def bulk_import(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """CSV ile toplu ürün oluştur. Hataları satır bazlı raporla."""
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(400, "CSV dosyası yükleyin")
    raw = (await file.read()).decode("utf-8-sig", errors="replace")
    reader = csv.DictReader(io.StringIO(raw))

    created, errors = [], []
    for idx, row in enumerate(reader, start=2):  # 1 = header row
        try:
            row["ce_marked"] = str(row.get("ce_marked", "")).strip().lower() in ("true", "1", "evet", "yes")
            if row.get("weight_kg"):
                row["weight_kg"] = float(row["weight_kg"])
            if row.get("warranty_months"):
                row["warranty_months"] = int(row["warranty_months"])
            if row.get("manufactured_at"):
                row["manufactured_at"] = date.fromisoformat(row["manufactured_at"])
            row = {k: (v if v not in ("", None) else None) for k, v in row.items()}
            body = ProductCreate(**{k: v for k, v in row.items() if k in ProductCreate.model_fields})
            product = Product(company_id=user.company_id, **body.model_dump())
            db.add(product)
            await db.flush()
            created.append({"row": idx, "id": product.id, "sku": product.sku})
        except Exception as e:
            errors.append({"row": idx, "sku": row.get("sku"), "error": str(e)[:200]})
    return {"created": len(created), "failed": len(errors), "results": created, "errors": errors}


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
    passport.ai_query_count = (passport.ai_query_count or 0) + 1
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
async def public_passport(
    passport_id: str,
    lang: str = Query(default="tr", description="Görüntüleyici dili: tr | en | de | fr"),
    db: AsyncSession = Depends(get_db),
):
    """
    QR kodun hedefi. Yalnızca yayınlanmış (issued/revoked) pasaportlar.
    Her başarılı istekte `scan_count` artar (analitik için).
    """
    passport, product = await _fetch_public_passport(db, passport_id)
    passport.scan_count = (passport.scan_count or 0) + 1
    snapshot = dpp_service.make_public_snapshot(passport, product, lang=lang)
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
    passport.ai_query_count = (passport.ai_query_count or 0) + 1
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
    passport.return_request_count = (passport.return_request_count or 0) + 1
    db.add(_log_event(passport.id, "return_requested", "public", meta))
    return {
        "passport_id": passport.id,
        "coupon_code": coupon,
        "discount_pct": 10,
        "message": "İade talebiniz alındı. Aşağıdaki kupon kodunu üreticinin geri dönüşüm noktasında gösterin.",
    }


@public_router.get("/{passport_id}/qr")
async def public_qr(passport_id: str, db: AsyncSession = Depends(get_db)):
    """Kamuya açık QR görseli — üretici ürüne basmak için kullanabilir."""
    passport, _ = await _fetch_public_passport(db, passport_id)
    url = dpp_service.build_public_url(passport.id)
    return Response(content=dpp_service.generate_qr_svg(url), media_type="image/svg+xml")
