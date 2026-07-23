"""
API Endpoints for Analysis, Reporting, and Engine Services.
Exposes the core functionalities from tsrs_engine, target_engine, and ai_report_writer.
"""
from fastapi import APIRouter, Depends, HTTPException, Body
from pydantic import BaseModel, Field
from typing import Any, List, Dict, Optional

from ..services import tsrs_engine, target_engine, ai_report_writer
from ..services.target_engine import SBTiTargetResult

router = APIRouter(
    prefix="/analysis",
    tags=["Analysis & Reporting Engine"],
    responses={404: {"description": "Not found"}},
)

# --- Pydantic Models for Request/Response ---

class TsrsAssessmentRequest(BaseModel):
    company_name: str
    segment: str
    pillar_scores: Dict[str, float] = Field(..., example={"yonetisim": 70, "strateji": 60})
    checklist_done: List[str] = Field(..., example=["k1", "k2", "k3"])
    scope1_tco2e: float
    scope2_tco2e: float
    scope3_tco2e: float
    scenarios_count: int = 0
    has_target: bool = False

class HoldingEmissionEstimateRequest(BaseModel):
    subsidiaries: List[Dict[str, Any]] = Field(
        ...,
        example=[
            {"name": "Şirket A", "revenue_m_tl": 100, "sector": "imalat"},
            {"name": "Şirket B", "revenue_m_tl": 250, "sector": "enerji", "reported_co2e": 12000}
        ]
    )

class HoldingTargetRequest(BaseModel):
    subsidiaries: List[Dict[str, Any]] = Field(
        ...,
        example=[
            {"name": "Enerji A.Ş.", "sector": "enerji", "base_scope12": 20000, "base_scope3": 5000},
            {"name": "Finans Bank", "sector": "bankacılık", "base_scope12": 1000, "base_scope3": 30000}
        ]
    )
    holding_base_year: int = 2024


# --- API Endpoints ---

@router.post("/tsrs-readiness", summary="TSRS Hazırlık Değerlendirmesi")
def get_tsrs_readiness_assessment(request: TsrsAssessmentRequest):
    """
    Bir şirketin TSRS'e hazırlık seviyesini, eksiklerini ve emisyon özetini değerlendirir.
    (tsrs_engine.full_tsrs_assessment)
    """
    result = tsrs_engine.full_tsrs_assessment(
        company_name=request.company_name,
        segment=request.segment,
        pillar_scores=request.pillar_scores,
        checklist_done=request.checklist_done,
        scope1_tco2e=request.scope1_tco2e,
        scope2_tco2e=request.scope2_tco2e,
        scope3_tco2e=request.scope3_tco2e,
        scenarios_count=request.scenarios_count,
        has_target=request.has_target,
    )
    return result

@router.post("/estimate-emissions-by-revenue", summary="Gelir Bazlı Emisyon Tahmini (EEIO)")
def estimate_emissions(request: HoldingEmissionEstimateRequest):
    """
    Verisi olmayan iştirakler için gelir bazlı emisyon tahmini yapar.
    (tsrs_engine.estimate_emissions_by_revenue)
    """
    result = tsrs_engine.estimate_emissions_by_revenue(subsidiaries=request.subsidiaries)
    return result

@router.post("/calculate-holding-target", summary="Holding Geneli SBTi Hedefi Hesapla", response_model=SBTiTargetResult)
def calculate_holding_target(request: HoldingTargetRequest):
    """
    İştirak verilerini konsolide ederek holding geneli bilimsel temelli hedef (SBTi) hesaplar.
    (target_engine.calculate_holding_sbti_target)
    """
    result = target_engine.calculate_holding_sbti_target(
        subsidiaries=request.subsidiaries,
        holding_base_year=request.holding_base_year
    )
    return result

@router.post("/generate-report", summary="AI ile TSRS Raporu Oluştur")
async def generate_report_endpoint(request: dict = Body(...)):
    """
    Verilen şirket verileriyle AI kullanarak tam TSRS uyumlu rapor oluşturur.
    (ai_report_writer.generate_tsrs_report)
    
    Not: Bu endpoint, esneklik için ham bir dict alır. Frontend'den gelen tüm
    form verilerini doğrudan kabul eder.
    """
    try:
        # ai_report_writer.generate_tsrs_report fonksiyonu stream desteklemiyor,
        # bu yüzden normal bir fonksiyon olarak çağırıyoruz.
        # Gerçek bir senaryoda, uzun süren bu işlem için StreamingResponse kullanılabilir.
        report_text, usage_info = ai_report_writer.generate_tsrs_report(**request)
        return {"report": report_text, "usage": usage_info}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Rapor oluşturulurken bir hata oluştu: {str(e)}")