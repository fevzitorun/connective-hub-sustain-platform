"""
EUDR Tedarik Zinciri API — AB Ormansızlaşma Tüzüğü.
Tüzük (AB) 2023/1115 · Aralık 2026 zorunlu.
8 emtia grubu: sığır eti, kakao, kahve, palmiye yağı, soya, odun, kağıt/karton, kauçuk.
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from .auth import get_current_user
from ..services.rbac import require_role

router = APIRouter(prefix="/eudr", tags=["eudr"])

# EUDR kapsamındaki emtialar (Ek I)
EUDR_COMMODITIES = [
    "sığır eti", "kakao", "kahve", "palmiye yağı",
    "soya", "odun", "kağıt/karton", "kauçuk",
]

# Yüksek ormansızlaşma riski taşıyan ülkeler (kısmi liste)
HIGH_RISK_COUNTRIES = [
    "Brezilya", "Endonezya", "Malezya", "Kongo DR",
    "Arjantin", "Fildişi Sahili", "Gana", "Nijerya",
    "Papua Yeni Gine", "Kamboçya",
]


class SupplierCreate(BaseModel):
    name: str
    country: str
    product: str
    geo_lat: float = Field(ge=-90, le=90)
    geo_lon: float = Field(ge=-180, le=180)
    annual_volume_tons: float = Field(gt=0)
    certification: Optional[str] = None  # FSC, RSPO, vb.


class SupplierRiskResponse(BaseModel):
    supplier_name: str
    country: str
    product: str
    deforestation_risk: str  # düşük | orta | yüksek
    geo_coordinates: str
    verification_required: bool
    risk_factors: list[str]
    recommended_action: str


@router.get("/commodities")
async def get_commodities():
    """EUDR kapsamındaki 8 emtia grubu."""
    return {
        "commodities": EUDR_COMMODITIES,
        "regulation": "Tüzük (AB) 2023/1115",
        "mandatory_from": "2026-12-01",
        "scope": "AB'ye ihraç edilen veya AB pazarına sunulan ürünler",
    }


@router.get("/high-risk-countries")
async def get_high_risk_countries():
    """Yüksek ormansızlaşma riski taşıyan ülkeler."""
    return {"countries": HIGH_RISK_COUNTRIES}


@router.post("/suppliers/assess", response_model=SupplierRiskResponse)
async def assess_supplier(
    supplier: SupplierCreate,
    current_user=Depends(get_current_user),
):
    """Tedarikçi ormansızlaşma riski değerlendirmesi."""
    if supplier.product.lower() not in EUDR_COMMODITIES:
        raise HTTPException(
            status_code=400,
            detail=f"'{supplier.product}' EUDR kapsamında değil. "
                   f"Kapsam: {EUDR_COMMODITIES}",
        )

    risk_factors = []
    risk_level = "düşük"

    # Ülke riski
    if supplier.country in HIGH_RISK_COUNTRIES:
        risk_factors.append(f"{supplier.country} yüksek ormansızlaşma riski kategorisinde")
        risk_level = "yüksek"

    # Sertifika yoksa risk artar
    if not supplier.certification:
        risk_factors.append("FSC / RSPO / Rainforest Alliance sertifikası yok")
        if risk_level != "yüksek":
            risk_level = "orta"

    # Tropikal emtia yüksek risk
    if supplier.product.lower() in ["kakao", "palmiye yağı", "kahve"]:
        risk_factors.append(f"{supplier.product} — tropik ormanlık alanlarda yetiştirilen yüksek riskli emtia")
        if risk_level == "düşük":
            risk_level = "orta"

    if not risk_factors:
        risk_factors.append("Bilinen risk faktörü tespit edilmedi")

    action_map = {
        "düşük": "Yıllık kontrol yeterli. Coğrafi koordinat belgesi sakla.",
        "orta": "Sertifika talebi yap. ESA Sentinel-2 uydu doğrulaması önerilir.",
        "yüksek": "İvedi doğrulama gerekli. Alternatif tedarikçi değerlendir.",
    }

    return SupplierRiskResponse(
        supplier_name=supplier.name,
        country=supplier.country,
        product=supplier.product,
        deforestation_risk=risk_level,
        geo_coordinates=f"{supplier.geo_lat:.4f}, {supplier.geo_lon:.4f}",
        verification_required=(risk_level != "düşük"),
        risk_factors=risk_factors,
        recommended_action=action_map[risk_level],
    )


@router.get("/suppliers")
async def list_suppliers(current_user=Depends(get_current_user)):
    """Şirkete kayıtlı tedarikçiler (Phase 4'te DB'den)."""
    require_role("auditor")(current_user)
    return {"suppliers": [], "message": "DB entegrasyonu Phase 4'te eklenecek."}


@router.get("/due-diligence-checklist")
async def get_checklist():
    """EUDR Tüzük Madde 8 — durum tespiti kontrol listesi."""
    return {
        "checklist": [
            "Tedarikçi ülkesi ve koordinatları kayıt altına alındı mı?",
            "Ürün EUDR Ek I kapsamında mı?",
            "31 Aralık 2020 sonrası ormansızlaşmaya yol açmadığı doğrulandı mı?",
            "İlgili ülke mevzuatına uygunluk sağlandı mı?",
            "Coğrafi koordinat bazında parsel düzeyi belge mevcut mu?",
            "Bağımsız üçüncü taraf doğrulaması yapıldı mı?",
            "Bilgi sistemi AB EUDR kaydına iletildi mi?",
        ],
        "regulation_article": "Tüzük (AB) 2023/1115 Madde 8",
    }
