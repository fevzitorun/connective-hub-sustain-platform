from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..models import EmissionRecord
from .calculation_engine import EmissionInput, calculate_iso14064

async def get_iso14064_trend(db: AsyncSession, company_id: str, years: List[int]) -> Dict[str, Any]:
    """
    Belirtilen yıllar için ISO 14064 emisyonlarını hesaplar ve trend karşılaştırması sunar.
    İlk yılı 'baz yıl' olarak kabul eder.
    """
    years = sorted(years)
    
    stmt = select(EmissionRecord).where(
        EmissionRecord.company_id == company_id,
        EmissionRecord.year.in_(years)
    ).order_by(EmissionRecord.year)
    
    res = await db.execute(stmt)
    records = res.scalars().all()
    
    if not records:
        return {"trend": [], "base_year": None, "total_reduction_pct": 0.0}
        
    trend_data = []
    base_year_total = None
    base_year = None
    
    for rec in records:
        input_data = EmissionInput(
            company_id=str(company_id),
            year=rec.year,
            electricity_kwh=rec.electricity_kwh or 0.0,
            natural_gas_m3=rec.natural_gas_m3,
            diesel_liters=rec.diesel_liters,
            lpg_kg=rec.lpg_kg,
            coal_tons=rec.coal_tons,
            company_vehicles_km=rec.company_vehicles_km,
            fugitive_emissions_kg=rec.fugitive_emissions_kg,
            business_travel_flight_km=rec.business_travel_flight_km,
            employee_commute_km=rec.employee_commute_km,
            waste_tons=rec.waste_tons,
            financed_emissions_co2e=rec.financed_emissions_co2e
        )
        result = calculate_iso14064(input_data)
        
        if base_year_total is None:
            base_year_total = result.total_co2e
            base_year = rec.year
            
        change_pct = 0.0
        if base_year_total > 0 and base_year != rec.year:
            change_pct = ((result.total_co2e - base_year_total) / base_year_total) * 100
            
        trend_data.append({
            "year": rec.year,
            "scope1": result.scope1_co2e,
            "scope2": result.scope2_location_co2e,
            "scope3": result.scope3_co2e,
            "total": result.total_co2e,
            "change_from_base_pct": round(change_pct, 2)
        })
        
    latest_total = trend_data[-1]["total"]
    total_reduction = 0.0
    if base_year_total and base_year_total > 0:
        total_reduction = ((latest_total - base_year_total) / base_year_total) * 100

    return {
        "base_year": base_year,
        "base_year_total": base_year_total,
        "latest_year": trend_data[-1]["year"],
        "latest_total": latest_total,
        "total_reduction_pct": round(total_reduction, 2),
        "trend": trend_data
    }
