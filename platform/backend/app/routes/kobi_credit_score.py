from fastapi import APIRouter
from pydantic import BaseModel
from typing import Any

from ..services.kobi_credit_score_engine import (
    calculate_kobi_credit_score,
    ESG_QUESTIONS,
    BANK_CATEGORIES,
    RATING_THRESHOLDS,
    SECTOR_BENCHMARKS,
    KNOCK_OUT_QUESTIONS,
    DEMO_RESULT,
    DEMO_RESULT_KNOCKOUT,
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


@router.get("/demo-knockout")
async def kobi_knockout_demo() -> dict[str, Any]:
    """Demo: RBA v9.0 Sıfır Tolerans knock-out (S11=0 human rights violation)"""
    return DEMO_RESULT_KNOCKOUT


@router.get("/knock-out-rules")
async def list_knock_out_rules() -> dict[str, Any]:
    """Zero-tolerance knock-out questions per RBA v9.0 + Ziraat Bank ÇSEYP"""
    return {
        "knock_out_questions": KNOCK_OUT_QUESTIONS,
        "policy_source": "RBA v9.0 §A1.1 + Ziraat Bankası ÇSEYP §4.2",
        "consequence": "Otomatik D Rating + C Kategori. Kredi süreci dondurulur.",
        "remediation_path": (
            "KOBİ bağımsız denetim mekanizması kurduğunu ve ihlali giderdiğini "
            "belgeleyen resmi kanıt sunduğunda yeniden değerlendirme yapılır."
        ),
    }
