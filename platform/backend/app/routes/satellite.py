"""Earth Intelligence API — NASA Power + AFAD + IPCC AR6."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_db
from ..models import Company, User
from ..services.satellite_service import get_satellite_risk, _CITY_COORDS
from .auth import get_current_user

router = APIRouter(prefix="/satellite", tags=["satellite"])


def _serialize(risk) -> dict:
    return {
        "lat": risk.lat,
        "lng": risk.lng,
        "city": risk.city,
        "earthquake_zone": risk.earthquake_zone,
        "earthquake_risk": risk.earthquake_risk,
        "pga_g": risk.pga_g,
        "flood_risk": risk.flood_risk,
        "flood_score": risk.flood_score,
        "drought_risk": risk.drought_risk,
        "drought_score": risk.drought_score,
        "heat_stress_risk": risk.heat_stress_risk,
        "heat_stress_score": risk.heat_stress_score,
        "fire_risk": risk.fire_risk,
        "fire_score": risk.fire_score,
        "water_stress_risk": risk.water_stress_risk,
        "water_stress_score": risk.water_stress_score,
        "temperature_c": risk.temperature_c,
        "precipitation_mm": risk.precipitation_mm,
        "solar_radiation_kwh_m2": risk.solar_radiation_kwh_m2,
        "ndvi_proxy": risk.ndvi_proxy,
        "physical_risk_score": risk.physical_risk_score,
        "data_source": risk.data_source,
        "projections": [
            {
                "year": p.year,
                "scenario": p.scenario,
                "temp_increase_c": p.temp_increase_c,
                "drought_multiplier": p.drought_multiplier,
                "flood_multiplier": p.flood_multiplier,
                "fire_multiplier": p.fire_multiplier,
            }
            for p in risk.projections
        ],
    }


@router.get("/risk")
async def satellite_risk_by_coords(
    lat: float = Query(...),
    lng: float = Query(...),
    city: str = Query("default"),
    year: int = Query(2024),
    current_user: User = Depends(get_current_user),
):
    risk = await get_satellite_risk(lat=lat, lng=lng, city=city, year=year)
    return _serialize(risk)


@router.get("/demo")
async def satellite_demo(city: str = Query("istanbul")):
    """Public demo — no auth required."""
    coords = _CITY_COORDS.get(city.lower(), _CITY_COORDS.get("istanbul", (41.015, 28.979)))
    risk = await get_satellite_risk(lat=coords[0], lng=coords[1], city=city)
    return _serialize(risk)


@router.get("/cities")
async def list_cities():
    """Desteklenen şehir listesi."""
    return {"cities": list(_CITY_COORDS.keys())}


@router.get("/risk/{company_id}")
async def satellite_risk_by_company(
    company_id: str,
    year: int = Query(2024),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    company = await db.get(Company, company_id)
    lat = float(company.lat) if company and company.lat else 41.015
    lng = float(company.lng) if company and company.lng else 28.979
    city = "istanbul"
    risk = await get_satellite_risk(lat=lat, lng=lng, city=city, year=year)
    result = _serialize(risk)
    result["company_id"] = company_id
    result["company_name"] = company.name if company else "—"
    result["tcfd_categories"] = {
        "acute_physical": risk.flood_risk,
        "chronic_physical": risk.drought_risk,
        "seismic": risk.earthquake_risk,
        "heat_stress": risk.heat_stress_risk,
        "wildfire": risk.fire_risk,
    }
    return result
