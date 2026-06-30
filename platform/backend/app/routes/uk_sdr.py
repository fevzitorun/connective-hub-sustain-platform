from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from ..services.auth import get_current_user
from ..services.uk_sdr_engine import full_assessment, PAI_INDICATORS, UK_TAXONOMY_OBJECTIVES, DEMO_RESULT

router = APIRouter(prefix="/api/uk-sdr", tags=["FCA SDR + EU SFDR"])


class SDRAssessmentRequest(BaseModel):
    company_name: str = Field(default="Demo Şirketi")
    maturity_score: int = Field(ge=0, le=100, description="ESG maturity score 0-100")
    scope1_co2e: float = Field(default=0, ge=0)
    scope2_co2e: float = Field(default=0, ge=0)
    scope3_co2e: float = Field(default=0, ge=0)
    uk_revenue_pct: float = Field(default=0, ge=0, le=100)
    eu_revenue_pct: float = Field(default=0, ge=0, le=100)
    taxonomy_alignment_pct: float = Field(default=0, ge=0, le=100)
    sustainable_investment_pct: float = Field(default=0, ge=0, le=100)
    has_science_targets: bool = False
    has_verified_data: bool = False
    entity_type: str = "corporate"  # corporate | fund | bank


@router.post("/assess")
async def assess_compliance(
    req: SDRAssessmentRequest,
    current_user=Depends(get_current_user),
):
    """FCA SDR + EU SFDR tam değerlendirme. Gerçek zamanlı hesaplama."""
    result = full_assessment(
        company_name=req.company_name,
        maturity_score=req.maturity_score,
        scope1_co2e=req.scope1_co2e,
        scope2_co2e=req.scope2_co2e,
        scope3_co2e=req.scope3_co2e,
        uk_revenue_pct=req.uk_revenue_pct,
        eu_revenue_pct=req.eu_revenue_pct,
        taxonomy_alignment_pct=req.taxonomy_alignment_pct,
        sustainable_investment_pct=req.sustainable_investment_pct,
        has_science_targets=req.has_science_targets,
        has_verified_data=req.has_verified_data,
        entity_type=req.entity_type,
    )
    return {"status": "success", "result": result}


@router.get("/demo")
async def get_demo():
    """Demo: Türk tekstil ihracatçısı (UK + AB pazarı). Auth gerektirmez."""
    return {"status": "demo", "result": DEMO_RESULT}


@router.get("/pai-indicators")
async def get_pai_indicators(current_user=Depends(get_current_user)):
    """14 zorunlu PAI göstergesi listesi (SFDR RTS Ek I)."""
    return {"indicators": PAI_INDICATORS, "total": len(PAI_INDICATORS)}


@router.get("/uk-taxonomy-objectives")
async def get_uk_taxonomy_objectives(current_user=Depends(get_current_user)):
    """İngiltere Yeşil Taksonomi 6 hedefi."""
    return {"objectives": UK_TAXONOMY_OBJECTIVES}
