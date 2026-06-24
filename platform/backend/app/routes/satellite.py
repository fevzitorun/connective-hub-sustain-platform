"""Uydu & İklim Risk API — NASA Power + AFAD entegrasyonu."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database import get_db
from ..models import Company, User
from ..services.satellite_service import get_satellite_risk
from .auth import get_current_user

router = APIRouter(prefix="/satellite", tags=["satellite"])


@router.get("/risk")
async def satellite_risk_by_coords(
    lat: float = Query(..., description="Enlem"),
    lng: float = Query(..., description="Boylam"),
    city: str = Query("default", description="Şehir adı (TR)"),
    year: int = Query(2024, description="Referans yılı"),
    current_user: User = Depends(get_current_user),
):
    """Koordinat bazlı iklim ve doğal afet risk analizi."""
    risk = await get_satellite_risk(lat=lat, lng=lng, city=city, year=year)
    return {
        "lat": risk.lat,
        "lng": risk.lng,
        "city": risk.city,
        "earthquake_zone": risk.earthquake_zone,
        "earthquake_risk": risk.earthquake_risk,
        "pga_g": risk.pga_g,
        "flood_risk": risk.flood_risk,
        "drought_risk": risk.drought_risk,
        "drought_score": risk.drought_score,
        "temperature_c": risk.temperature_c,
        "precipitation_mm": risk.precipitation_mm,
        "solar_radiation_kwh_m2": risk.solar_radiation_kwh_m2,
        "ndvi_proxy": risk.ndvi_proxy,
        "physical_risk_score": risk.physical_risk_score,
        "data_source": risk.data_source,
    }


@router.get("/risk/{company_id}")
async def satellite_risk_by_company(
    company_id: str,
    year: int = Query(2024),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Şirket lokasyonuna göre iklim risk analizi."""
    company = await db.get(Company, company_id)

    # Şirketin lat/lng'i varsa kullan, yoksa İstanbul default
    lat = float(company.lat) if company and company.lat else 41.015
    lng = float(company.lng) if company and company.lng else 28.979
    city = "istanbul"  # TODO: geocoding ile şehir tespiti

    risk = await get_satellite_risk(lat=lat, lng=lng, city=city, year=year)
    return {
        "company_id": company_id,
        "company_name": company.name if company else "—",
        "lat": risk.lat,
        "lng": risk.lng,
        "city": risk.city,
        "earthquake_zone": risk.earthquake_zone,
        "earthquake_risk": risk.earthquake_risk,
        "pga_g": risk.pga_g,
        "flood_risk": risk.flood_risk,
        "drought_risk": risk.drought_risk,
        "drought_score": risk.drought_score,
        "temperature_c": risk.temperature_c,
        "precipitation_mm": risk.precipitation_mm,
        "solar_radiation_kwh_m2": risk.solar_radiation_kwh_m2,
        "ndvi_proxy": risk.ndvi_proxy,
        "physical_risk_score": risk.physical_risk_score,
        "data_source": risk.data_source,
        "tcfd_categories": {
            "acute_physical": risk.flood_risk,
            "chronic_physical": risk.drought_risk,
            "seismic": risk.earthquake_risk,
        },
    }
