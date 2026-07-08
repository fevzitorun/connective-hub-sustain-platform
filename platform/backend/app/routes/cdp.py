from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from ..services.cdp_engine import (
    full_cdp_assessment, calculate_cdp_score, autofill_from_platform,
    DEMO_RESULT, CDP_SECTIONS, CDP_BANDS,
)

router = APIRouter(prefix="/api/cdp", tags=["CDP Climate Questionnaire"])


class CDPAssessRequest(BaseModel):
    company_name: str = "Şirketim"
    maturity_score: float = 50.0
    has_scope3: bool = False
    has_sbti: bool = False
    has_verification: bool = False
    has_re_target: bool = False
    sector: str = "manufacturing"
    custom_answers: Optional[dict[str, int]] = None


@router.post("/assess")
async def assess_cdp(body: CDPAssessRequest):
    if body.custom_answers:
        result = calculate_cdp_score(body.custom_answers)
        return {
            "company_name": body.company_name,
            **result,
            "questionnaire": CDP_SECTIONS,
        }
    return full_cdp_assessment(
        company_name=body.company_name,
        maturity_score=body.maturity_score,
        has_scope3=body.has_scope3,
        has_sbti=body.has_sbti,
        has_verification=body.has_verification,
        has_re_target=body.has_re_target,
        sector=body.sector,
    )


@router.get("/demo")
async def get_demo():
    return DEMO_RESULT


@router.get("/questionnaire")
async def get_questionnaire():
    return {"sections": CDP_SECTIONS, "bands": CDP_BANDS}


@router.post("/autofill")
async def autofill(
    maturity_score: float = 50.0,
    has_scope3: bool = False,
    has_sbti: bool = False,
    has_verification: bool = False,
    has_re_target: bool = False,
):
    answers = autofill_from_platform(
        maturity_score=maturity_score,
        has_scope3=has_scope3,
        has_sbti=has_sbti,
        has_verification=has_verification,
        has_re_target=has_re_target,
    )
    return {"answers": answers, "message": "SustainHub verilerinden otomatik dolduruldu"}
