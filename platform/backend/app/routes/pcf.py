from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from typing import Dict, Optional
from .auth import get_current_user
from ..services.iso14067_engine import (
    PCFInput, calculate_pcf, calculate_pcf_from_demo,
    SECTOR_BENCHMARKS, LIFECYCLE_STAGES, DEMO_PRODUCTS, EF,
)

router = APIRouter(prefix="/api/pcf", tags=["ISO 14067 Product Carbon Footprint"])


class PCFStageInput(BaseModel):
    """Aşama bazlı girdi: {ef_anahtarı: miktar}"""
    inputs: Dict[str, float] = {}


class PCFRequest(BaseModel):
    product_name: str = Field(default="Ürün")
    functional_unit: str = Field(default="1 kg")
    functional_unit_quantity: float = Field(default=1.0, gt=0)
    system_boundary: str = Field(default="cradle-to-gate")
    sector: Optional[str] = None
    annual_production_units: Optional[float] = None
    cbam_product_category: Optional[str] = None
    stages: Dict[str, Dict[str, float]] = {}


@router.post("/calculate")
async def calculate_product_carbon_footprint(
    req: PCFRequest,
    current_user=Depends(get_current_user),
):
    """ISO 14067:2018 ürün karbon ayak izi hesaplama."""
    inp = PCFInput(
        product_name=req.product_name,
        functional_unit=req.functional_unit,
        functional_unit_quantity=req.functional_unit_quantity,
        system_boundary=req.system_boundary,
        sector=req.sector,
        annual_production_units=req.annual_production_units,
        cbam_product_category=req.cbam_product_category,
        stages=req.stages,
    )
    result = calculate_pcf(inp)
    return {"status": "success", "result": result}


@router.get("/demo/{product_key}")
async def get_demo(product_key: str):
    """Demo hesaplama: tekstil | aluminyum | celik"""
    if product_key not in DEMO_PRODUCTS:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=f"Demo ürün bulunamadı. Mevcut: {list(DEMO_PRODUCTS.keys())}")
    result = calculate_pcf_from_demo(product_key)
    return {"status": "demo", "product_key": product_key, "result": result}


@router.get("/emission-factors")
async def get_emission_factors(current_user=Depends(get_current_user)):
    """Kullanılan emisyon faktörleri (DEFRA 2022, ETKB 2022, Ecoinvent 3.9)."""
    return {"emission_factors": EF, "sources": ["DEFRA 2022", "ETKB 2022", "IPCC 2006 AR5", "Ecoinvent 3.9"]}


@router.get("/lifecycle-stages")
async def get_lifecycle_stages():
    """EN 15978 / ISO 14044 yaşam döngüsü aşamaları."""
    return {"stages": LIFECYCLE_STAGES}


@router.get("/benchmarks")
async def get_benchmarks(current_user=Depends(get_current_user)):
    """Sektör PCF referans değerleri."""
    return {"benchmarks": SECTOR_BENCHMARKS}
