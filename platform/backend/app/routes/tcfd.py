from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from .auth import get_current_user
from ..services.tcfd_engine import run_tcfd_scenarios

router = APIRouter(prefix="/tcfd", tags=["tcfd"])


class TCFDRequest(BaseModel):
    sector: str
    annual_revenue_eur: float
    total_co2e: float
    physical_risk_base: Optional[int] = 40
    goods_exported_tons: Optional[float] = 0
    eu_ets_price: Optional[float] = 71.0


@router.post("/scenarios")
async def tcfd_scenarios(data: TCFDRequest, current_user=Depends(get_current_user)):
    result = run_tcfd_scenarios(
        sector=data.sector,
        annual_revenue_eur=data.annual_revenue_eur,
        total_co2e=data.total_co2e,
        physical_risk_base=data.physical_risk_base or 40,
        goods_exported_tons=data.goods_exported_tons or 0,
        eu_ets_price=data.eu_ets_price or 71.0,
    )
    return {
        "sector": result.sector,
        "annual_revenue_eur": result.annual_revenue_eur,
        "total_co2e": result.total_co2e,
        "summary": result.summary,
        "scenarios": [
            {
                "scenario_id": s.scenario_id,
                "scenario_label": s.scenario_label,
                "temp_rise": s.temp_rise,
                "carbon_price_2030": s.carbon_price_2030,
                "carbon_price_2050": s.carbon_price_2050,
                "physical_risk_score": s.physical_risk_score,
                "transition_risk_score": s.transition_risk_score,
                "stranded_asset_risk": s.stranded_asset_risk,
                "cbam_exposure_eur": s.cbam_exposure_eur,
                "transition_capex_eur": s.transition_capex_eur,
                "physical_damage_eur": s.physical_damage_eur,
                "net_financial_impact_eur": s.net_financial_impact_eur,
                "opportunities": s.opportunities,
                "risks": s.risks,
                "recommendation": s.recommendation,
            }
            for s in result.scenarios
        ],
    }


@router.post("/demo")
async def tcfd_demo():
    """Auth gerektirmez — landing/demo için."""
    result = run_tcfd_scenarios(
        sector="çelik",
        annual_revenue_eur=500_000_000,
        total_co2e=185_000,
        physical_risk_base=55,
        goods_exported_tons=120_000,
    )
    return {
        "sector": result.sector,
        "annual_revenue_eur": result.annual_revenue_eur,
        "total_co2e": result.total_co2e,
        "summary": result.summary,
        "scenarios": [
            {
                "scenario_id": s.scenario_id,
                "scenario_label": s.scenario_label,
                "temp_rise": s.temp_rise,
                "carbon_price_2030": s.carbon_price_2030,
                "carbon_price_2050": s.carbon_price_2050,
                "physical_risk_score": s.physical_risk_score,
                "transition_risk_score": s.transition_risk_score,
                "stranded_asset_risk": s.stranded_asset_risk,
                "cbam_exposure_eur": s.cbam_exposure_eur,
                "transition_capex_eur": s.transition_capex_eur,
                "physical_damage_eur": s.physical_damage_eur,
                "net_financial_impact_eur": s.net_financial_impact_eur,
                "opportunities": s.opportunities,
                "risks": s.risks,
                "recommendation": s.recommendation,
            }
            for s in result.scenarios
        ],
    }
