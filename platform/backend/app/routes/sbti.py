from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from ..services.sbti_engine import (
    full_sbti_assessment, calculate_temperature_alignment,
    DEMO_RESULT, SECTOR_PATHWAYS, COMMITMENT_STAGES, FLAG_SECTORS,
)

router = APIRouter(prefix="/api/sbti", tags=["SBTi Science Based Targets"])


class SBTiAssessRequest(BaseModel):
    company_name: str = "Şirketim"
    sector: str = "tekstil"
    base_year: int = 2021
    total_emissions_tco2e: float = 10000.0
    current_annual_reduction_pct: float = 2.0
    commitment_stage: str = "committed"
    has_flag: bool = False


class TempAlignRequest(BaseModel):
    current_emissions_tco2e: float
    reduction_rate_pct_per_year: float


@router.post("/assess")
async def assess(body: SBTiAssessRequest):
    return full_sbti_assessment(
        company_name=body.company_name,
        sector=body.sector,
        base_year=body.base_year,
        total_emissions_tco2e=body.total_emissions_tco2e,
        current_annual_reduction_pct=body.current_annual_reduction_pct,
        commitment_stage=body.commitment_stage,
        has_flag=body.has_flag,
    )


@router.post("/temperature-alignment")
async def temp_alignment(body: TempAlignRequest):
    return calculate_temperature_alignment(
        body.current_emissions_tco2e,
        body.reduction_rate_pct_per_year,
    )


@router.get("/demo")
async def get_demo():
    return DEMO_RESULT


@router.get("/sectors")
async def get_sectors():
    return {"sectors": list(SECTOR_PATHWAYS.values()), "flag_sectors": FLAG_SECTORS}


@router.get("/commitment-stages")
async def get_stages():
    return {"stages": COMMITMENT_STAGES}
