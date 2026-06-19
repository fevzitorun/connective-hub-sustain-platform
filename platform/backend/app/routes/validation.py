"""EMİR 6: Akıllı veri doğrulama ve anomaly detection."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
from ..database import get_db
from ..models import User, Company, EmissionRecord
from ..services.validation_engine import validate_emission_data
from .auth import get_current_user

router = APIRouter(prefix="/validate", tags=["validation"])


class ValidateRequest(BaseModel):
    electricity_kwh: Optional[float] = None
    natural_gas_m3: Optional[float] = None
    diesel_liters: Optional[float] = None
    coal_tons: Optional[float] = None
    waste_tons: Optional[float] = None
    business_travel_flight_km: Optional[float] = None
    employee_commute_km: Optional[float] = None
    sector: Optional[str] = None
    employee_count: Optional[int] = None


@router.post("/emissions")
async def validate_emissions(
    body: ValidateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """EMİR 6: Veri girişinde gerçek zamanlı anomaly kontrolü."""
    sector = body.sector
    employee_count = body.employee_count

    if not sector or not employee_count:
        co_result = await db.execute(select(Company).where(Company.id == current_user.company_id))
        company = co_result.scalar_one_or_none()
        if company:
            sector = sector or company.sector or "manufacturing"
            employee_count = employee_count or company.employee_count

    data = {
        "electricity_kwh": body.electricity_kwh or 0,
        "natural_gas_m3": body.natural_gas_m3 or 0,
        "diesel_liters": body.diesel_liters or 0,
        "coal_tons": body.coal_tons or 0,
        "waste_tons": body.waste_tons or 0,
        "business_travel_flight_km": body.business_travel_flight_km or 0,
        "employee_commute_km": body.employee_commute_km or 0,
    }

    warnings = validate_emission_data(data, sector=sector or "manufacturing", employee_count=employee_count)
    return {
        "sector": sector,
        "warnings": [
            {
                "field": w.field,
                "value": w.value,
                "unit": w.unit,
                "message": w.message,
                "severity": w.severity,
            }
            for w in warnings
        ],
        "has_errors": any(w.severity == "error" for w in warnings),
        "has_warnings": len(warnings) > 0,
    }


@router.get("/emissions/{emission_id}")
async def validate_existing_emission(
    emission_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mevcut emisyon kaydını sektör referanslarına göre doğrula."""
    em_result = await db.execute(
        select(EmissionRecord).where(
            EmissionRecord.id == emission_id,
            EmissionRecord.company_id == current_user.company_id,
        )
    )
    emission = em_result.scalar_one_or_none()
    if not emission:
        raise HTTPException(404, "Emisyon verisi bulunamadı")

    co_result = await db.execute(select(Company).where(Company.id == current_user.company_id))
    company = co_result.scalar_one_or_none()

    data = {
        "electricity_kwh": float(emission.electricity_kwh or 0),
        "natural_gas_m3": float(emission.natural_gas_m3 or 0),
        "diesel_liters": float(emission.diesel_liters or 0),
        "coal_tons": float(emission.coal_tons or 0),
        "waste_tons": float(emission.waste_tons or 0),
        "business_travel_flight_km": float(emission.business_travel_flight_km or 0),
    }

    sector = company.sector if company else "manufacturing"
    employee_count = company.employee_count if company else None
    warnings = validate_emission_data(data, sector=sector or "manufacturing", employee_count=employee_count)

    return {
        "emission_id": emission_id,
        "year": emission.year,
        "sector": sector,
        "warnings": [
            {"field": w.field, "value": w.value, "unit": w.unit, "message": w.message, "severity": w.severity}
            for w in warnings
        ],
        "is_clean": len(warnings) == 0,
    }
