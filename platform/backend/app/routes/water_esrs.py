from fastapi import APIRouter
from pydantic import BaseModel
from typing import Any

from ..services.water_esrs_engine import (
    assess_water_esrs,
    ALL_ESRS_ENV, WATER_FOOTPRINT_TYPES, WATER_STRESS_ZONES, DEMO_RESULT,
)

router = APIRouter(prefix="/water-esrs", tags=["Water & ESRS E2-E5"])


class WaterAssessInput(BaseModel):
    company_name: str
    sector: str
    water_withdrawal_m3: float
    water_consumed_m3: float
    operates_in_high_stress: bool = False
    completed_disclosures: list[str] = []
    waste_generated_tonnes: float = 0
    recycled_pct: float = 0


@router.get("/demo")
async def water_esrs_demo() -> dict[str, Any]:
    return DEMO_RESULT


@router.post("/assess")
async def water_esrs_assess(body: WaterAssessInput) -> dict[str, Any]:
    return assess_water_esrs(
        company_name=body.company_name,
        sector=body.sector,
        water_withdrawal_m3=body.water_withdrawal_m3,
        water_consumed_m3=body.water_consumed_m3,
        operates_in_high_stress=body.operates_in_high_stress,
        completed_disclosures=body.completed_disclosures,
        waste_generated_tonnes=body.waste_generated_tonnes,
        recycled_pct=body.recycled_pct,
    )


@router.get("/standards")
async def water_standards() -> dict[str, Any]:
    return {
        "esrs_env": ALL_ESRS_ENV,
        "water_footprint_types": WATER_FOOTPRINT_TYPES,
        "stress_zones": WATER_STRESS_ZONES,
    }
