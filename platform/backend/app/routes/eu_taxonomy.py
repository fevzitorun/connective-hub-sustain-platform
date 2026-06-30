from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from ..services.eu_taxonomy_engine import (
    calculate_taxonomy_alignment, EU_TAXONOMY_OBJECTIVES, NACE_CRITERIA, DEMO_RESULT,
)

router = APIRouter(prefix="/api/eu-taxonomy", tags=["EU Taxonomy 2020/852"])


class TaxonomyAlignRequest(BaseModel):
    nace_code: str = "C13"
    emissions_intensity: Optional[float] = None
    renewable_pct: float = 0.0
    recycling_rate: float = 0.0
    water_intensity: Optional[float] = None
    has_biodiversity_plan: bool = False
    has_pollution_controls: bool = False
    climate_adaptation_plan: bool = False
    dnsh_answers: Optional[dict[str, bool]] = None


@router.post("/assess")
async def assess_taxonomy(body: TaxonomyAlignRequest):
    return calculate_taxonomy_alignment(
        nace_code=body.nace_code,
        emissions_intensity=body.emissions_intensity,
        renewable_pct=body.renewable_pct,
        recycling_rate=body.recycling_rate,
        water_intensity=body.water_intensity,
        has_biodiversity_plan=body.has_biodiversity_plan,
        has_pollution_controls=body.has_pollution_controls,
        climate_adaptation_plan=body.climate_adaptation_plan,
        dnsh_answers=body.dnsh_answers,
    )


@router.get("/demo")
async def get_demo():
    return DEMO_RESULT


@router.get("/objectives")
async def get_objectives():
    return {"objectives": list(EU_TAXONOMY_OBJECTIVES.values())}


@router.get("/nace-sectors")
async def get_nace_sectors():
    return {
        "sectors": [
            {"nace": v["nace"], "label": v["label"], "sector": v["sector"],
             "objectives_covered": [k for k in EU_TAXONOMY_OBJECTIVES if k in v]}
            for k, v in NACE_CRITERIA.items()
        ]
    }
