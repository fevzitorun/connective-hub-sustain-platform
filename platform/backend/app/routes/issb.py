from fastapi import APIRouter
from pydantic import BaseModel
from typing import Any

from ..services.issb_engine import (
    full_issb_assessment,
    S1_PILLARS,
    S2_PILLARS,
    S2_CROSS_INDUSTRY_METRICS,
    TCFD_ISSB_CROSSWALK,
    SCENARIO_BANDS,
    UK_SRS_AMENDMENTS,
    ISSB_ADOPTION_MAP,
    DEMO_RESULT,
)

router = APIRouter(prefix="/issb", tags=["ISSB"])


class ISSBAssessInput(BaseModel):
    company_name: str
    sector: str
    scope1_tco2e: float
    scope2_tco2e: float
    scope3_tco2e: float
    pillar_scores: dict[str, float] | None = None
    scenarios_analysed: list[str] | None = None
    has_sbti_target: bool = False
    internal_carbon_price: float | None = None
    exec_pay_linked: bool = False


@router.get("/demo")
async def issb_demo() -> dict[str, Any]:
    return DEMO_RESULT


@router.post("/assess")
async def issb_assess(body: ISSBAssessInput) -> dict[str, Any]:
    return full_issb_assessment(
        company_name=body.company_name,
        sector=body.sector,
        scope1_tco2e=body.scope1_tco2e,
        scope2_tco2e=body.scope2_tco2e,
        scope3_tco2e=body.scope3_tco2e,
        pillar_scores=body.pillar_scores,
        scenarios_analysed=body.scenarios_analysed,
        has_sbti_target=body.has_sbti_target,
        internal_carbon_price=body.internal_carbon_price,
        exec_pay_linked=body.exec_pay_linked,
    )


@router.get("/standards")
async def issb_standards() -> dict[str, Any]:
    return {
        "s1_pillars": S1_PILLARS,
        "s2_pillars": S2_PILLARS,
        "cross_industry_metrics": S2_CROSS_INDUSTRY_METRICS,
        "scenario_bands": SCENARIO_BANDS,
    }


@router.get("/tcfd-crosswalk")
async def issb_tcfd_crosswalk() -> list[dict]:
    return TCFD_ISSB_CROSSWALK


@router.get("/uk-srs-amendments")
async def issb_uk_srs_amendments() -> list[dict]:
    """UK SRS 6 amendments vs IFRS S1/S2 (FRC, August 2024)"""
    return UK_SRS_AMENDMENTS


@router.get("/adoption-map")
async def issb_adoption_map() -> list[dict]:
    """Jurisdiction-level IFRS S1/S2 adoption tracker"""
    return ISSB_ADOPTION_MAP
