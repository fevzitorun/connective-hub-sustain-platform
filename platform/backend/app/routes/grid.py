"""
Sustain Grid+ Energy Management and Smart Meter Routes.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Dict, Any

from ..database import get_db
from ..models import Company, EmissionRecord, User
from .auth import get_current_user
from ..services.grid_service import (
    generate_live_meter_reading,
    calculate_energy_efficiency,
    GRID_FACTORS
)

router = APIRouter(prefix="/grid", tags=["Sustain Grid+"])

class SyncGridInput(BaseModel):
    company_id: str
    year: int
    cumulative_kwh: float

@router.get("/live-meter")
async def get_live_meter(
    company_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Akıllı sayaçtan (smart meter) gelen anlık IoT telemetri verilerini okur."""
    company = await db.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Şirket bulunamadı")
    
    reading = generate_live_meter_reading(company_id)
    return reading

@router.get("/efficiency")
async def get_efficiency_analysis(
    company_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """ISO 50001 Enerji Yönetim Sistemi uyumlu verimlilik skorlamasını döner."""
    company = await db.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Şirket bulunamadı")

    country_code = "TR"
    # Simple heuristic: if city is Zurich, it's CH, if UK SDR was run, etc.
    # In standard setup, default to TR unless Zurich/UK is mentioned
    if company.city and company.city.lower() in ["zurich", "london", "uk"]:
        country_code = "UK"

    reading = generate_live_meter_reading(company_id)
    kwh = reading["cumulative_kwh"]
    
    analysis = calculate_energy_efficiency(kwh, country_code)
    return {"analysis": analysis}

@router.post("/sync-to-emissions")
async def sync_meter_to_emissions(
    body: SyncGridInput,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Sayaçtaki toplam tüketimi CarbonSense Scope 2 emisyonlarına senkronize eder."""
    company = await db.get(Company, body.company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Şirket bulunamadı")

    country_code = "TR"
    if company.city and company.city.lower() in ["zurich", "london", "uk"]:
        country_code = "UK"

    factor = GRID_FACTORS.get(country_code.upper(), GRID_FACTORS["DEFAULT"])
    
    # Calculate Scope 2 emissions: kWh * factor / 1000 = tCO2e
    emissions_t = round((body.cumulative_kwh * factor) / 1000, 3)

    # Find or create emission record
    stmt = (
        select(EmissionRecord)
        .where(EmissionRecord.company_id == body.company_id)
        .where(EmissionRecord.year == body.year)
    )
    result = await db.execute(stmt)
    record = result.scalars().first()

    if not record:
        record = EmissionRecord(
            company_id=body.company_id,
            year=body.year,
            electricity_kwh=body.cumulative_kwh,
            scope2_location_co2e=emissions_t,
            scope1_co2e=0.0,
            scope3_co2e=0.0
        )
        db.add(record)
    else:
        record.electricity_kwh = body.cumulative_kwh
        record.scope2_location_co2e = emissions_t

    await db.commit()
    await db.refresh(record)

    return {
        "success": True,
        "electricity_kwh": record.electricity_kwh,
        "emissions_tco2e": record.scope2_location_co2e,
        "grid_factor_applied": factor,
        "record_id": record.id
    }
