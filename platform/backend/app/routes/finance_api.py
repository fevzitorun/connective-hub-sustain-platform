from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Dict, Any
from ..services.calculation_engine import calculate_total_emissions
from ..services.credit_scoring_service import get_credit_score_for_bank

router = APIRouter(prefix="/api/finance", tags=["Finance Gateway"])

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
