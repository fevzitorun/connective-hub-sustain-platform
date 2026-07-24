"""
Analysis API — Holding Konsolidasyonu (Sprint 3).

Not: Bu dosya önceden yanlışlıkla `.github/workflows/analysis.py` içinde
duruyordu, hiç `include_router` edilmemişti ve README'nin "✅ Sprint 3"
dediği özellik production'da yoktu. Orijinal dosyada 4 endpoint vardı;
ikisi (tsrs-readiness, generate-report) `app/routes/tsrs.py` ve
`app/routes/reports.py` tarafından zaten auth'lu şekilde karşılanıyordu —
bu ikisi tekrar olduğu için buraya taşınmadı. Kalan iki endpoint (gelir
bazlı emisyon tahmini + holding SBTi hedefi) hiçbir yerde karşılığı
olmayan, gerçekten benzersiz "Holding Consolidation" özelliği — burada
auth guard'ıyla (orijinalinde hiç auth yoktu) doğru yerine taşındı.
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from typing import Any, List, Dict

from ..services import target_engine
from ..services.target_engine import SBTiTargetResult
from ..services.tsrs_engine import estimate_emissions_by_revenue
from ..services.rbac import require_role

router = APIRouter(
    prefix="/analysis",
    tags=["Analysis & Reporting Engine"],
    responses={404: {"description": "Not found"}},
)


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


@router.post("/estimate-emissions-by-revenue", summary="Gelir Bazlı Emisyon Tahmini (EEIO)")
async def estimate_emissions(
    request: HoldingEmissionEstimateRequest,
    _user=Depends(require_role("editor")),
):
    """
    Verisi olmayan iştirakler için gelir bazlı emisyon tahmini yapar.
    (tsrs_engine.estimate_emissions_by_revenue)
    """
    return estimate_emissions_by_revenue(subsidiaries=request.subsidiaries)


@router.post("/calculate-holding-target", summary="Holding Geneli SBTi Hedefi Hesapla", response_model=SBTiTargetResult)
async def calculate_holding_target(
    request: HoldingTargetRequest,
    _user=Depends(require_role("editor")),
):
    """
    İştirak verilerini konsolide ederek holding geneli bilimsel temelli hedef (SBTi) hesaplar.
    (target_engine.calculate_holding_sbti_target)
    """
    return target_engine.calculate_holding_sbti_target(
        subsidiaries=request.subsidiaries,
        holding_base_year=request.holding_base_year,
    )
