from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Dict
from .auth import get_current_user
from ..services.sroi_engine import calculate_sroi, get_proxy_catalog

router = APIRouter(prefix="/sroi", tags=["sroi"])


class SROIRequest(BaseModel):
    investment_eur: float
    inputs: Dict[str, float]  # { "employee_training": 120, "local_hiring": 45, ... }


@router.get("/catalog")
async def sroi_catalog():
    """Proxy değer kataloğu — public."""
    return {"catalog": get_proxy_catalog()}


@router.post("/calculate")
async def sroi_calculate(
    data: SROIRequest,
    current_user=Depends(get_current_user),
):
    result = calculate_sroi(data.investment_eur, data.inputs)
    return {
        "sroi_ratio": result.sroi_ratio,
        "sroi_label": result.sroi_label,
        "total_investment_eur": result.total_investment_eur,
        "total_social_value_eur": result.total_social_value_eur,
        "summary": result.summary,
        "line_items": [
            {
                "label": li.label,
                "quantity": li.quantity,
                "unit": li.unit,
                "proxy_eur": li.proxy_eur,
                "total_value_eur": li.total_value_eur,
                "sdg": li.sdg,
            }
            for li in result.line_items
        ],
        "breakdown_pct": result.breakdown_pct,
        "un_sdgs": result.un_sdgs,
    }


@router.post("/demo")
async def sroi_demo():
    """Demo hesaplama — auth gerektirmez."""
    demo_inputs = {
        "employee_training": 250,
        "local_hiring": 80,
        "gender_diversity": 12,
        "community_investment": 3,
        "renewable_energy_kwh": 1200,
        "waste_recycled_ton": 45,
        "carbon_prevented_tco2e": 320,
    }
    result = calculate_sroi(850000, demo_inputs)
    return {
        "sroi_ratio": result.sroi_ratio,
        "sroi_label": result.sroi_label,
        "total_investment_eur": result.total_investment_eur,
        "total_social_value_eur": result.total_social_value_eur,
        "summary": result.summary,
        "line_items": [
            {
                "label": li.label,
                "quantity": li.quantity,
                "unit": li.unit,
                "proxy_eur": li.proxy_eur,
                "total_value_eur": li.total_value_eur,
                "sdg": li.sdg,
            }
            for li in result.line_items
        ],
        "breakdown_pct": result.breakdown_pct,
        "un_sdgs": result.un_sdgs,
    }
