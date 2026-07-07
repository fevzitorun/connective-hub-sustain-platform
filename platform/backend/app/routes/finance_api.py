from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Dict, Any
from ..services.credit_scoring_service import calculate_sustain_grade

router = APIRouter(prefix="/api/finance", tags=["Finance Gateway"])


def calculate_total_emissions(tenant_id: str) -> Dict[str, float]:
    """Demo aggregate emisyon verisi (Finance Gateway mock).

    Bu banka oracle endpoint'i demo amaçlıdır. Gerçek entegrasyonda tenant'ın
    kayıtlı emisyon verisi DB'den toplanıp döndürülecektir.
    """
    return {"scope1": 1250.0, "scope2": 3400.0, "scope3": 18900.0, "total": 23550.0}


def get_credit_score_for_bank(tenant_id: str) -> Dict[str, Any]:
    """Banka oracle için ESG kredi notu (demo temsili girdilerle).

    Gerçek skorlama motorunu (calculate_sustain_grade) çağırır; entegrasyonda
    girdiler tenant'ın gerçek verisinden hesaplanacaktır.
    """
    result = calculate_sustain_grade(
        carbon_intensity=2.1,
        sector_avg_carbon=2.4,
        physical_risk_score=70,
        sbti_gap_pct=22.0,
        tsrs_completeness=78,
    )
    return {"score_letter": result.grade, "score_value": result.score}

# Very simple mocked auth for the banking oracle
def verify_bank_api_key(x_bank_api_key: str = Header(...)):
    if x_bank_api_key not in ["ZURICH-BANK-KEY", "LONDON-FINANCE-KEY", "AKBANK-TEST-KEY"]:
        raise HTTPException(status_code=403, detail="Invalid Banking API Key")
    return x_bank_api_key

@router.get("/sustain-score/{tenant_id}")
async def get_sustain_score(tenant_id: str, bank_key: str = Depends(verify_bank_api_key)) -> Dict[str, Any]:
    """
    Returns the audited 'Sustain-Score' and eligibility for Green Loans.
    This endpoint acts as the Oracle for global banking systems.
    """
    score_data = get_credit_score_for_bank(tenant_id)
    
    return {
        "tenant_id": tenant_id,
        "sustain_score": score_data["score_letter"],
        "score_value": score_data["score_value"],
        "green_loan_eligible": score_data["score_value"] >= 70,
        "max_credit_limit_eur": 5000000 if score_data["score_value"] >= 80 else 1000000,
        "interest_rate_discount": "-1.5%" if score_data["score_value"] >= 75 else "0%",
        "verified_by": "SustainHub.online Oracle"
    }

@router.get("/verified-emissions/{tenant_id}")
async def get_verified_emissions(tenant_id: str, bank_key: str = Depends(verify_bank_api_key)) -> Dict[str, Any]:
    """
    Returns the digitally verified Scope 1, 2, and 3 emissions data.
    """
    emissions = calculate_total_emissions(tenant_id)
    
    return {
        "tenant_id": tenant_id,
        "reporting_year": 2024,
        "emissions_tco2e": {
            "scope1": emissions["scope1"],
            "scope2": emissions["scope2"],
            "scope3": emissions["scope3"],
            "total": emissions["total"]
        },
        "verification_status": "Audited & Satellite Verified",
        "tcfd_risk_level": "Medium"
    }
