from fastapi import APIRouter
from pydantic import BaseModel
from typing import Any

from ..services.kobi_credit_score_engine import (
    calculate_kobi_credit_score,
    ESG_QUESTIONS,
    BANK_CATEGORIES,
    RATING_THRESHOLDS,
    SECTOR_BENCHMARKS,
    DEMO_RESULT,
)

router = APIRouter(prefix="/kobi-credit-score", tags=["KOBİ ESG Credit Score"])


class CreditScoreInput(BaseModel):
    company_name: str
    sector: str
    answers: dict[str, int]  # question_id -> 0 or 1


@router.get("/demo")
async def kobi_credit_score_demo() -> dict[str, Any]:
    return DEMO_RESULT


@router.post("/assess")
async def kobi_credit_score_assess(body: CreditScoreInput) -> dict[str, Any]:
    return calculate_kobi_credit_score(
        company_name=body.company_name,
        sector=body.sector,
        answers=body.answers,
    )


@router.get("/questions")
async def list_questions() -> list[dict]:
    return ESG_QUESTIONS


@router.get("/bank-categories")
async def list_bank_categories() -> list[dict]:
    return BANK_CATEGORIES


@router.get("/sectors")
async def list_sectors() -> dict[str, dict]:
    return SECTOR_BENCHMARKS


@router.get("/rating-thresholds")
async def list_rating_thresholds() -> list:
    return [
        {"min_score": t, "grade": g, "label": l}
        for t, g, l in RATING_THRESHOLDS
    ]
