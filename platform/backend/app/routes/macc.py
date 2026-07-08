from fastapi import APIRouter, Depends
from pydantic import BaseModel
from ..services.macc_service import calculate_macc, MACCResult
from ..services.rbac import require_role

router = APIRouter(prefix="/macc", tags=["macc"])


class MACCRequest(BaseModel):
    company_id: str
    sector: str
    total_emissions: float = 0.0
    sbti_gap_2030: float = 0.0
    budget_limit_tl: float | None = None


def _result_to_dict(r: MACCResult) -> dict:
    return {
        "company_id": r.company_id,
        "sector": r.sector,
        "total_abatement_potential": r.total_abatement_potential,
        "negative_cost_abatement": r.negative_cost_abatement,
        "total_investment_tl": r.total_investment_tl,
        "average_cost_per_tco2": r.average_cost_per_tco2,
        "sbti_gap_covered_pct": r.sbti_gap_covered_pct,
        "measures": [
            {
                "id": m.id,
                "name": m.name,
                "category": m.category,
                "abatement_tco2": m.abatement_tco2,
                "cost_per_tco2": m.cost_per_tco2,
                "capex_tl": m.capex_tl,
                "payback_years": m.payback_years,
                "scope": m.scope,
            }
            for m in r.measures
        ],
    }


@router.post("/calculate")
async def calculate(
    body: MACCRequest,
    _: dict = Depends(require_role("viewer")),
):
    """MACC hesapla — sektöre göre maliyet-etkinlik sıralı önlemler."""
    result = calculate_macc(
        company_id=body.company_id,
        sector=body.sector,
        total_emissions=body.total_emissions,
        sbti_gap_2030=body.sbti_gap_2030,
        budget_limit_tl=body.budget_limit_tl,
    )
    return _result_to_dict(result)


@router.get("/demo/{sector}")
async def demo(sector: str):
    """Demo MACC verisi — kimlik doğrulama gerektirmez."""
    result = calculate_macc(
        company_id="demo",
        sector=sector,
        total_emissions=5000.0,
        sbti_gap_2030=1500.0,
    )
    return _result_to_dict(result)
