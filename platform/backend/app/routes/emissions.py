from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
from ..database import get_db
from ..models import EmissionRecord, User
from ..services.calculation_engine import EmissionInput, calculate_emissions, SECTOR_BENCHMARKS
from ..services.rbac import get_active_company_id
from .auth import get_current_user

router = APIRouter(prefix="/emissions", tags=["emissions"])


class EmissionDataIn(BaseModel):
    year: int = 2024
    reporting_boundary: str = "operational_control"
    sector: str = "manufacturing"
    employee_count: Optional[int] = None

    # Kapsam 1
    natural_gas_m3: Optional[float] = None
    diesel_liters: Optional[float] = None
    lpg_kg: Optional[float] = None
    coal_tons: Optional[float] = None
    company_vehicles_km: Optional[float] = None

    # Kapsam 2
    electricity_kwh: float = 0
    renewable_electricity_kwh: Optional[float] = None

    # Kapsam 3
    business_flights_shorthaul: Optional[float] = None
    business_flights_longhaul: Optional[float] = None
    employee_commute_km: Optional[float] = None
    waste_tons: Optional[float] = None

    # Bankacılık (PCAF Kapsam 3, Kat. 15)
    loan_portfolio_tl: Optional[float] = None
    financed_emissions_co2e: Optional[float] = None

    # Çimento
    clinker_tons: Optional[float] = None
    cement_tons: Optional[float] = None         # frontend field — maps to cement_production_tons in DB

    # Enerji
    electricity_generated_mwh: Optional[float] = None
    renewable_capacity_mw: Optional[float] = None


def _build_emission_input(company_id: str, body: EmissionDataIn) -> EmissionInput:
    # Combine shorthaul + longhaul flight km into single field for calculation engine
    total_flight_km = (body.business_flights_shorthaul or 0) + (body.business_flights_longhaul or 0)

    # Derive electricity source from renewable certificate presence
    electricity_source = "grid"
    if body.renewable_electricity_kwh and body.renewable_electricity_kwh > 0:
        if body.renewable_electricity_kwh >= (body.electricity_kwh or 0):
            electricity_source = "renewable_certificate"
        else:
            electricity_source = "mixed"

    return EmissionInput(
        company_id=company_id,
        year=body.year,
        reporting_boundary=body.reporting_boundary,
        sector=body.sector,
        electricity_source=electricity_source,
        natural_gas_m3=body.natural_gas_m3,
        diesel_liters=body.diesel_liters,
        lpg_kg=body.lpg_kg,
        coal_tons=body.coal_tons,
        company_vehicles_km=body.company_vehicles_km,
        electricity_kwh=body.electricity_kwh,
        business_travel_flight_km=total_flight_km or None,
        employee_commute_km=body.employee_commute_km,
        waste_tons=body.waste_tons,
        financed_emissions_co2e=body.financed_emissions_co2e,
        clinker_tons=body.clinker_tons,
        cement_production_tons=body.cement_tons,
    )


@router.post("/calculate")
async def calculate(body: EmissionDataIn, company_id: str = Depends(get_active_company_id)):
    inp = _build_emission_input(company_id, body)
    result = calculate_emissions(inp)
    return {
        "scope1": result.scope1_co2e,
        "scope2_location": result.scope2_location_co2e,
        "scope2_market": result.scope2_market_co2e,
        "scope3": result.scope3_co2e,
        "total": result.total_co2e,
        "breakdown": result.breakdown,
        "methodology_notes": result.methodology_notes,
        "sector_benchmark": SECTOR_BENCHMARKS.get(body.sector, 0),
    }


@router.post("", status_code=201)
async def save_emission(
    body: EmissionDataIn,
    company_id: str = Depends(get_active_company_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    inp = _build_emission_input(company_id, body)
    result = calculate_emissions(inp)

    # Upsert: update if record already exists for this company/year
    existing_result = await db.execute(
        select(EmissionRecord).where(
            EmissionRecord.company_id == company_id,
            EmissionRecord.year == body.year,
        )
    )
    record = existing_result.scalar_one_or_none()

    fields = dict(
        reporting_boundary=body.reporting_boundary,
        electricity_source=inp.electricity_source,
        natural_gas_m3=body.natural_gas_m3,
        diesel_liters=body.diesel_liters,
        lpg_kg=body.lpg_kg,
        coal_tons=body.coal_tons,
        company_vehicles_km=body.company_vehicles_km,
        electricity_kwh=body.electricity_kwh,
        business_travel_flight_km=inp.business_travel_flight_km,
        employee_commute_km=body.employee_commute_km,
        waste_tons=body.waste_tons,
        loan_portfolio_tl=body.loan_portfolio_tl,
        financed_emissions_co2e=body.financed_emissions_co2e,
        clinker_tons=body.clinker_tons,
        cement_production_tons=body.cement_tons,
        electricity_generated_mwh=body.electricity_generated_mwh,
        scope1_co2e=result.scope1_co2e,
        scope2_location_co2e=result.scope2_location_co2e,
        scope2_market_co2e=result.scope2_market_co2e,
        scope3_co2e=result.scope3_co2e,
    )

    if record:
        import json
        from ..services.audit_service import log_action
        old_data = {k: getattr(record, k) for k in fields.keys()}
        for k, v in fields.items():
            setattr(record, k, v)
        await log_action(
            db=db,
            user_id=current_user.id,
            user_email=current_user.email,
            user_role="user",
            action="Güncelleme",
            entity_type="emission",
            entity_id=record.id,
            entity_desc=f"Emisyon verisi güncellendi ({body.year})",
            company_id=company_id,
            table_name="emission_records",
            old_value=json.dumps(old_data, default=str),
            new_value=json.dumps(fields, default=str),
        )
    else:
        record = EmissionRecord(company_id=company_id, year=body.year, **fields)
        db.add(record)
        await db.flush()
        import json
        from ..services.audit_service import log_action
        await log_action(
            db=db,
            user_id=current_user.id,
            user_email=current_user.email,
            user_role="user",
            action="Giriş",
            entity_type="emission",
            entity_id=record.id,
            entity_desc=f"Yeni emisyon verisi eklendi ({body.year})",
            company_id=company_id,
            table_name="emission_records",
            old_value=None,
            new_value=json.dumps(fields, default=str),
        )

    await db.commit()
    await db.refresh(record)
    return {
        "id": record.id,
        "year": record.year,
        "scope1_co2e": result.scope1_co2e,
        "scope2_location_co2e": result.scope2_location_co2e,
        "scope3_co2e": result.scope3_co2e,
        "total_co2e": result.total_co2e,
    }

@router.get("/{emission_id}/history")
async def get_emission_history(
    emission_id: str,
    company_id: str = Depends(get_active_company_id),
    db: AsyncSession = Depends(get_db),
):
    from ..models.audit import AuditLog
    from sqlalchemy import desc
    result = await db.execute(
        select(AuditLog)
        .where(
            AuditLog.entity_id == emission_id,
            AuditLog.entity_type == "emission",
            AuditLog.company_id == company_id
        )
        .order_by(desc(AuditLog.timestamp))
    )
    logs = result.scalars().all()
    return [
        {
            "action": log.action,
            "user_email": log.user_email,
            "timestamp": log.timestamp.isoformat() if log.timestamp else None,
            "old_value": log.old_value,
            "new_value": log.new_value,
            "entity_desc": log.entity_desc
        }
        for log in logs
    ]


@router.get("")
async def list_emissions(
    company_id: str = Depends(get_active_company_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(EmissionRecord)
        .where(EmissionRecord.company_id == company_id)
        .order_by(EmissionRecord.year.desc())
    )
    records = result.scalars().all()
    return [
        {
            "id": r.id,
            "year": r.year,
            "scope1_co2e": float(r.scope1_co2e or 0),
            "scope2_location_co2e": float(r.scope2_location_co2e or 0),
            "scope3_co2e": float(r.scope3_co2e or 0),
            "total_co2e": float((r.scope1_co2e or 0) + (r.scope2_location_co2e or 0) + (r.scope3_co2e or 0)),
        }
        for r in records
    ]

class Scope3DataIn(BaseModel):
    year: int
    breakdown: dict
    activity_metric: Optional[dict] = None

@router.post("/scope3", status_code=201)
async def save_scope3(
    body: Scope3DataIn,
    company_id: str = Depends(get_active_company_id),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(EmissionRecord).where(
            EmissionRecord.company_id == company_id,
            EmissionRecord.year == body.year
        )
    )
    record = result.scalar_one_or_none()
    
    # Kapsam 3 toplamını breakdown değerlerinin toplamı olarak hesapla
    total_scope3 = sum(float(val) for val in body.breakdown.values() if isinstance(val, (int, float)))
    
    if not record:
        record = EmissionRecord(
            company_id=company_id,
            year=body.year,
            scope3_breakdown=body.breakdown,
            scope3_co2e=total_scope3,
            activity_metric=body.activity_metric
        )
        db.add(record)
    else:
        record.scope3_breakdown = body.breakdown
        record.scope3_co2e = total_scope3
        if body.activity_metric is not None:
            record.activity_metric = body.activity_metric
            
    await db.commit()
    return {"success": True, "year": body.year, "scope3_co2e": total_scope3}

