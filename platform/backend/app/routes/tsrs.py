from fastapi import APIRouter
from pydantic import BaseModel
from typing import Any

from ..services.tsrs_engine import (
    full_tsrs_assessment,
    TSRS1_PILLARS, TSRS2_PILLARS, KGK_CHECKLIST,
    TSRS_DEADLINES,
    TURKISH_COMPANY_NET_ZERO_BENCHMARKS,
    FINANCIAL_MATERIALITY_THRESHOLDS,
    TSRS_TRANSITION_RELIEFS,
    DEMO_RESULT,
)

router = APIRouter(prefix="/tsrs", tags=["TSRS"])


class TSRSAssessInput(BaseModel):
    company_name: str
    segment: str
    pillar_scores: dict[str, float]
    checklist_done: list[str]
    scope1_tco2e: float
    scope2_tco2e: float
    scope3_tco2e: float
    scenarios_count: int = 0
    has_target: bool = False


@router.get("/demo")
async def tsrs_demo() -> dict[str, Any]:
    return DEMO_RESULT


@router.post("/assess")
async def tsrs_assess(body: TSRSAssessInput) -> dict[str, Any]:
    return full_tsrs_assessment(
        company_name=body.company_name,
        segment=body.segment,
        pillar_scores=body.pillar_scores,
        checklist_done=body.checklist_done,
        scope1_tco2e=body.scope1_tco2e,
        scope2_tco2e=body.scope2_tco2e,
        scope3_tco2e=body.scope3_tco2e,
        scenarios_count=body.scenarios_count,
        has_target=body.has_target,
    )


@router.get("/standards")
async def tsrs_standards() -> dict[str, Any]:
    return {
        "tsrs1_pillars": TSRS1_PILLARS,
        "tsrs2_pillars": TSRS2_PILLARS,
        "kgk_checklist": KGK_CHECKLIST,
        "deadlines": TSRS_DEADLINES,
        "transition_reliefs": TSRS_TRANSITION_RELIEFS,
    }


@router.get("/net-zero-benchmarks")
async def tsrs_net_zero_benchmarks() -> list[dict]:
    """Türk şirketlerinin Net Zero hedefleri (Arçelik, Akbank, Tüpraş, Migros, Ziraat)"""
    return TURKISH_COMPANY_NET_ZERO_BENCHMARKS


@router.get("/materiality-thresholds")
async def tsrs_materiality_thresholds() -> list[dict]:
    """Sektörel TSRS finansal önemlilik eşikleri (TSRS 1 Md.22 + TSRS 2 Md.7)"""
    return FINANCIAL_MATERIALITY_THRESHOLDS
