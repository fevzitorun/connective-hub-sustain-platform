"""
University Gateway API — THE Impact Rankings + UI GreenMetric hesaplama.
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from .auth import get_current_user
from ..services.ranking_engine import calculate_greenmetric_score, calculate_the_impact_score

router = APIRouter(prefix="/university", tags=["university"])


class CampusData(BaseModel):
    ev_fleet_percentage: float = 10.0
    renewable_energy_percentage: float = 15.0
    recycling_rate: Optional[float] = None
    water_recycling_pct: Optional[float] = None


@router.get("/ranking")
async def get_ranking_info():
    """Desteklenen sıralama sistemleri ve kategori ağırlıkları."""
    return {
        "systems": [
            {
                "name": "UI GreenMetric",
                "max_score": 10000,
                "categories": {
                    "Setting & Infrastructure": "15%",
                    "Energy & Climate Change": "21%",
                    "Waste": "18%",
                    "Water": "10%",
                    "Transportation": "18%",
                    "Education & Research": "18%",
                },
            },
            {
                "name": "THE Impact Rankings",
                "focus": "SDG 13 (Climate Action) + SDG 17 (Partnerships)",
            },
        ]
    }


@router.post("/calculate")
async def calculate_ranking(
    data: CampusData,
    current_user=Depends(get_current_user),
):
    """Kampüs verisinden UI GreenMetric + THE Impact puanı hesapla."""
    campus_dict = data.model_dump()
    greenmetric = calculate_greenmetric_score(campus_dict)
    the_impact = calculate_the_impact_score(campus_dict)
    return {
        "greenmetric": greenmetric,
        "the_impact": the_impact,
    }


@router.get("/demo")
async def demo_ranking():
    """Kimlik doğrulama gerektirmeyen demo hesaplama."""
    demo_data = {"ev_fleet_percentage": 25.0, "renewable_energy_percentage": 30.0}
    return {
        "greenmetric": calculate_greenmetric_score(demo_data),
        "the_impact": calculate_the_impact_score(demo_data),
    }
