"""
CBAM Beyan API — AB Sınır Karbon Düzenleme Mekanizması.
Tüzük (AB) 2023/956 · Ocak 2026 zorunlu raporlama.
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from .auth import get_current_user
from ..services.rbac import require_role

router = APIRouter(prefix="/cbam", tags=["cbam"])

# CBAM kapsamındaki sektörler ve referans ETS fiyatları
CBAM_SECTORS = {
    "çelik": {"cn_codes": ["7206", "7207", "7208"], "default_factor": 1.89},
    "alüminyum": {"cn_codes": ["7601", "7602", "7604"], "default_factor": 8.02},
    "çimento": {"cn_codes": ["2523"], "default_factor": 0.82},
    "gübre": {"cn_codes": ["3102", "3105"], "default_factor": 2.14},
    "elektrik": {"cn_codes": ["2716"], "default_factor": 0.0},
    "hidrojen": {"cn_codes": ["2804"], "default_factor": 8.9},
}

EU_ETS_PRICE_EUR = 71.0  # AB ETS spot fiyatı (güncellenebilir)


class CbamCalculationRequest(BaseModel):
    sector: str
    goods_tons: float = Field(gt=0)
    embedded_co2_factor: Optional[float] = Field(None, description="ton CO₂e/ton ürün")
    eu_ets_price: float = Field(default=EU_ETS_PRICE_EUR, gt=0)
    reporting_period: str = Field(default="Q2-2026")


class CbamCalculationResponse(BaseModel):
    sector: str
    goods_tons: float
    embedded_co2_factor: float
    embedded_co2_total: float
    eu_ets_price: float
    cbam_duty_eur: float
    reporting_period: str
    cn_codes: list[str]
    regulation: str = "Tüzük (AB) 2023/956"


class CbamDeclaration(BaseModel):
    sector: str
    goods_tons: float
    embedded_co2_factor: float
    eu_ets_price: float
    reporting_period: str
    company_name: str
    tax_id: str
    destination_country: str = "Almanya"
    notes: Optional[str] = None


@router.get("/sectors")
async def get_cbam_sectors():
    """CBAM kapsamındaki sektörler ve CN kodları."""
    return {
        "sectors": {k: v["cn_codes"] for k, v in CBAM_SECTORS.items()},
        "regulation": "Tüzük (AB) 2023/956",
        "mandatory_from": "2026-01-01",
    }


@router.get("/ets-price")
async def get_ets_price():
    """AB ETS güncel karbon fiyatı (güncelleme: Phase 4'te gerçek API)."""
    return {
        "price_eur": EU_ETS_PRICE_EUR,
        "currency": "EUR/ton CO₂e",
        "source": "EU ETS spot — ICE",
        "updated": "2026-06-19",
    }


@router.post("/calculate", response_model=CbamCalculationResponse)
async def calculate_cbam(
    req: CbamCalculationRequest,
    current_user=Depends(get_current_user),
):
    """CBAM vergi yükümlülüğünü hesapla."""
    sector_key = req.sector.lower()
    if sector_key not in CBAM_SECTORS:
        raise HTTPException(
            status_code=400,
            detail=f"CBAM kapsamı dışı sektör: {req.sector}. "
                   f"Desteklenenler: {list(CBAM_SECTORS.keys())}",
        )

    co2_factor = req.embedded_co2_factor or CBAM_SECTORS[sector_key]["default_factor"]
    embedded_total = req.goods_tons * co2_factor
    duty = embedded_total * req.eu_ets_price

    return CbamCalculationResponse(
        sector=req.sector,
        goods_tons=req.goods_tons,
        embedded_co2_factor=round(co2_factor, 3),
        embedded_co2_total=round(embedded_total, 2),
        eu_ets_price=req.eu_ets_price,
        cbam_duty_eur=round(duty, 2),
        reporting_period=req.reporting_period,
        cn_codes=CBAM_SECTORS[sector_key]["cn_codes"],
    )


@router.post("/declarations")
async def create_declaration(
    decl: CbamDeclaration,
    current_user=Depends(get_current_user),
):
    """CBAM beyanı oluştur (DB kaydı Phase 4'te eklenecek)."""
    require_role("data_entry")(current_user)
    sector_key = decl.sector.lower()
    co2_factor = decl.embedded_co2_factor
    duty = round(decl.goods_tons * co2_factor * decl.eu_ets_price, 2)

    return {
        "status": "created",
        "declaration_id": f"CBAM-{decl.reporting_period}-{decl.tax_id[-4:]}",
        "sector": decl.sector,
        "duty_eur": duty,
        "reporting_period": decl.reporting_period,
        "message": "Beyan taslak olarak oluşturuldu. Onay sonrası AB CBAM portalına iletilebilir.",
    }


@router.get("/declarations")
async def list_declarations(current_user=Depends(get_current_user)):
    """Şirkete ait CBAM beyanları (Phase 4'te DB'den çekilecek)."""
    require_role("auditor")(current_user)
    return {"declarations": [], "message": "DB entegrasyonu Phase 4'te eklenecek."}
