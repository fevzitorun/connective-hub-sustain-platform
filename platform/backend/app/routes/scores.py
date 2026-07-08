from fastapi import APIRouter, Depends
from ..services.credit_scoring_service import calculate_sustain_grade
from .auth import get_current_user

router = APIRouter(prefix="/scores", tags=["scores"])

@router.get("/sustain-grade")
async def get_sustain_grade(
    carbon_intensity: float = 1.8,
    sector_avg_carbon: float = 2.4,
    physical_risk_score: int = 75,
    sbti_gap_pct: float = 15.0,
    tsrs_completeness: int = 85,
    current_user=Depends(get_current_user)
):
    """
    Şirketin emisyon performansını, iklim risklerini ve hedef uyumluluğunu 
    birleştirerek banka standartlarında bir ESG Kredi Notu (Grade) oluşturur.
    """
    result = calculate_sustain_grade(
        carbon_intensity=carbon_intensity,
        sector_avg_carbon=sector_avg_carbon,
        physical_risk_score=physical_risk_score,
        sbti_gap_pct=sbti_gap_pct,
        tsrs_completeness=tsrs_completeness
    )
    
    return {
        "score": result.score,
        "grade": result.grade,
        "breakdown": result.breakdown,
        "reasons": result.reasons
    }
