"""
GAR Bank Intelligence API — Sprint 24
PCAF Financed Emissions + EU Taxonomy Portfolio Classification
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dataclasses import asdict

from ..services.pcaf_engine import (
    BorrowerInput,
    calculate_portfolio,
    TURKISH_BANK_DEMO_BDDK,
    TURKISH_BANK_DEMO_TRNC,
)

router = APIRouter(prefix="/gar", tags=["GAR Bank Intelligence"])


class BorrowerPayload(BaseModel):
    name: str
    sector_key: str
    nace_code: str
    outstanding_eur: float
    evic_eur: float
    revenue_eur: float
    reported_emissions_tco2e: float | None = None
    data_quality: int = 3


class PortfolioRequest(BaseModel):
    borrowers: list[BorrowerPayload]
    jurisdiction: str = "bddk"
    currency: str = "EUR"


@router.get("/demo")
async def gar_demo(jurisdiction: str = "bddk"):
    """
    Turkish Bank demo portfolio — PCAF + GAR calculation.
    jurisdiction: bddk | trnc | consolidated
    """
    if jurisdiction == "trnc":
        borrowers = TURKISH_BANK_DEMO_TRNC
        curr = "EUR"
    elif jurisdiction == "consolidated":
        borrowers = TURKISH_BANK_DEMO_BDDK + TURKISH_BANK_DEMO_TRNC
        curr = "EUR"
    else:
        borrowers = TURKISH_BANK_DEMO_BDDK
        curr = "TRY"

    result = calculate_portfolio(borrowers, jurisdiction=jurisdiction, currency=curr)

    return {
        "portfolio": {
            "jurisdiction": result.jurisdiction,
            "currency": result.currency,
            "total_outstanding_eur": result.total_outstanding_eur,
            "gar_ratio_pct": result.gar_ratio_pct,
            "green_eur": result.green_eur,
            "transition_eur": result.transition_eur,
            "brown_eur": result.brown_eur,
            "taxonomy_breakdown_pct": {
                "green": round(result.green_eur / result.total_outstanding_eur * 100, 1),
                "transition": round(result.transition_eur / result.total_outstanding_eur * 100, 1),
                "brown": round(result.brown_eur / result.total_outstanding_eur * 100, 1),
            },
        },
        "pcaf": {
            "scope3_cat15_tco2e": result.scope3_cat15_tco2e,
            "total_financed_emissions_tco2e": result.total_financed_emissions_tco2e,
            "data_quality_avg": result.pcaf_data_quality_avg,
            "standard": "PCAF Standard v2 (2022)",
            "methodology": "Attribution Factor = Outstanding Amount / EVIC",
        },
        "borrowers": [
            {
                "name": b.name,
                "sector": b.sector,
                "nace_code": b.nace_code,
                "taxonomy_status": b.taxonomy_status,
                "outstanding_eur": b.outstanding_eur,
                "attribution_factor_pct": b.attribution_factor_pct,
                "financed_emissions_tco2e": b.financed_emissions_tco2e,
                "data_quality": b.data_quality,
                "esg_score": b.esg_score,
                "esg_grade": b.esg_grade,
                "emission_intensity": b.emission_intensity,
            }
            for b in result.borrowers
        ],
        "stress_test": {
            "iea_nz_2050": {
                "scenario": "IEA Net Zero 2050",
                "portfolio_at_risk_pct": round(result.brown_eur / result.total_outstanding_eur * 100, 1),
                "stranded_asset_risk_eur": round(result.brown_eur * 0.35, 0),
                "transition_cost_eur": round(result.transition_eur * 0.12, 0),
            },
            "ngfs_delayed": {
                "scenario": "NGFS Delayed Transition",
                "portfolio_at_risk_pct": round((result.brown_eur + result.transition_eur * 0.4) / result.total_outstanding_eur * 100, 1),
                "stranded_asset_risk_eur": round(result.brown_eur * 0.55, 0),
                "transition_cost_eur": round(result.transition_eur * 0.22, 0),
            },
        },
        "compliance": {
            "bddk_sustainable_banking": "BDDK Sürdürülebilir Bankacılık Rehberi 2023",
            "eu_taxonomy_alignment": f"{round(result.green_eur / result.total_outstanding_eur * 100, 1)}%",
            "pcaf_commitment": "PCAF Standard v2 Uyumlu",
            "tcfd_alignment": "TCFD / ISSB IFRS S2 Uyumlu",
            "uk_srs_note": "UK operasyonları FCA SDR + UK SRS kapsamında ayrı raporlanır",
        },
    }


@router.post("/calculate")
async def gar_calculate(payload: PortfolioRequest):
    """Custom portfolio PCAF + GAR calculation."""
    if not payload.borrowers:
        raise HTTPException(status_code=422, detail="En az 1 borçlu gerekli")
    if len(payload.borrowers) > 500:
        raise HTTPException(status_code=422, detail="Maksimum 500 borçlu")

    borrowers = [
        BorrowerInput(
            name=b.name,
            sector_key=b.sector_key,
            nace_code=b.nace_code,
            outstanding_eur=b.outstanding_eur,
            evic_eur=b.evic_eur,
            revenue_eur=b.revenue_eur,
            reported_emissions_tco2e=b.reported_emissions_tco2e,
            data_quality=b.data_quality,
        )
        for b in payload.borrowers
    ]

    result = calculate_portfolio(borrowers, payload.jurisdiction, payload.currency)

    return {
        "gar_ratio_pct": result.gar_ratio_pct,
        "scope3_cat15_tco2e": result.scope3_cat15_tco2e,
        "total_outstanding_eur": result.total_outstanding_eur,
        "taxonomy_breakdown_pct": {
            "green": round(result.green_eur / result.total_outstanding_eur * 100, 1),
            "transition": round(result.transition_eur / result.total_outstanding_eur * 100, 1),
            "brown": round(result.brown_eur / result.total_outstanding_eur * 100, 1),
        },
        "pcaf_data_quality_avg": result.pcaf_data_quality_avg,
        "borrowers": [asdict(b) for b in result.borrowers],
    }


@router.get("/taxonomy/sectors")
async def taxonomy_sectors():
    """EU Taxonomy sektör-NACE eşleştirme tablosu."""
    from ..services.pcaf_engine import NACE_TAXONOMY, SECTOR_INTENSITY
    return {
        "nace_taxonomy": NACE_TAXONOMY,
        "sector_intensity_tco2e_per_eur_m": SECTOR_INTENSITY,
        "source": "EU Taxonomy Regulation 2020/852 + PCAF Standard v2",
    }
