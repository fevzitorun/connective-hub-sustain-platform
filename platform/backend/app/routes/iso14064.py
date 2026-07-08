from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy import select

from ..database import get_db
from ..models import User, EmissionRecord
from .auth import get_current_user
from ..services.calculation_engine import calculate_iso14064, EmissionInput

router = APIRouter(prefix="/api/iso14064", tags=["ISO 14064"])

class ISO14064CalculationRequest(BaseModel):
    year: int
    reporting_boundary: str = "operational_control"
    electricity_source: str = "grid"
    
    # Scope 1
    natural_gas_m3: Optional[float] = None
    diesel_liters: Optional[float] = None
    lpg_kg: Optional[float] = None
    coal_tons: Optional[float] = None
    company_vehicles_km: Optional[float] = None
    fugitive_emissions_kg: Optional[float] = None
    
    # Scope 2
    electricity_kwh: float = 0.0
    
    # Scope 3
    business_travel_flight_km: Optional[float] = None
    employee_commute_km: Optional[float] = None
    waste_tons: Optional[float] = None
    financed_emissions_co2e: Optional[float] = None


@router.post("/calculate")
async def calculate_iso14064_emissions(
    req: ISO14064CalculationRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    ISO 14064-1 standardına göre emisyon hesaplaması yapar. 
    Faktörler: IPCC 2006, DEFRA 2022, ETKB 2022
    """
    
    input_data = EmissionInput(
        company_id=str(current_user.company_id),
        year=req.year,
        reporting_boundary=req.reporting_boundary,
        electricity_source=req.electricity_source,
        natural_gas_m3=req.natural_gas_m3,
        diesel_liters=req.diesel_liters,
        lpg_kg=req.lpg_kg,
        coal_tons=req.coal_tons,
        company_vehicles_km=req.company_vehicles_km,
        fugitive_emissions_kg=req.fugitive_emissions_kg,
        calculation_standard="iso_14064_1",
        electricity_kwh=req.electricity_kwh,
        business_travel_flight_km=req.business_travel_flight_km,
        employee_commute_km=req.employee_commute_km,
        waste_tons=req.waste_tons,
        financed_emissions_co2e=req.financed_emissions_co2e
    )
    
    result = calculate_iso14064(input_data)
    
    return {
        "status": "success",
        "iso14064_result": result,
    }


@router.get("/report/{year}")
async def get_iso14064_report(
    year: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Şirketin belirtilen yıla ait kaydedilmiş emisyon verilerinden ISO 14064 raporu üretir.
    """
    stmt = select(EmissionRecord).where(
        EmissionRecord.company_id == current_user.company_id,
        EmissionRecord.year == year
    )
    res = await db.execute(stmt)
    record = res.scalar_one_or_none()
    
    if not record:
        raise HTTPException(status_code=404, detail=f"{year} yılı için emisyon verisi bulunamadı.")
        
    input_data = EmissionInput(
        company_id=str(current_user.company_id),
        year=record.year,
        reporting_boundary=record.reporting_boundary or "operational_control",
        electricity_source=record.electricity_source or "grid",
        natural_gas_m3=record.natural_gas_m3,
        diesel_liters=record.diesel_liters,
        lpg_kg=record.lpg_kg,
        coal_tons=record.coal_tons,
        company_vehicles_km=record.company_vehicles_km,
        fugitive_emissions_kg=record.fugitive_emissions_kg,
        electricity_kwh=record.electricity_kwh or 0.0,
        business_travel_flight_km=record.business_travel_flight_km,
        employee_commute_km=record.employee_commute_km,
        waste_tons=record.waste_tons,
        financed_emissions_co2e=record.financed_emissions_co2e
    )
    
    result = calculate_iso14064(input_data)
    
    return {
        "status": "success",
        "year": year,
        "iso14064_result": result,
        "company_id": str(current_user.company_id)
    }

from fastapi.responses import Response

@router.get("/export/{year}")
async def export_iso14064_report(
    year: int,
    format: str = "docx",
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(EmissionRecord).where(
        EmissionRecord.company_id == current_user.company_id,
        EmissionRecord.year == year
    )
    res = await db.execute(stmt)
    record = res.scalar_one_or_none()
    
    if not record:
        raise HTTPException(status_code=404, detail="Emisyon verisi bulunamadı")
        
    input_data = EmissionInput(
        company_id=str(current_user.company_id),
        year=record.year,
        electricity_kwh=record.electricity_kwh or 0.0,
        natural_gas_m3=record.natural_gas_m3,
        diesel_liters=record.diesel_liters,
        lpg_kg=record.lpg_kg,
        coal_tons=record.coal_tons,
        company_vehicles_km=record.company_vehicles_km,
        fugitive_emissions_kg=record.fugitive_emissions_kg,
        business_travel_flight_km=record.business_travel_flight_km,
        employee_commute_km=record.employee_commute_km,
        waste_tons=record.waste_tons,
        financed_emissions_co2e=record.financed_emissions_co2e
    )
    
    result = calculate_iso14064(input_data)
    
    # Build markdown content for template
    md_content = f"""# ISO 14064-1 Kurumsal Karbon Ayak İzi Raporu

**Şirket ID:** {current_user.company_id}
**Raporlama Yılı:** {year}
**Raporlama Sınırları:** {record.reporting_boundary}

## Toplam Emisyon
{result.total_co2e} ton CO₂e

## Emisyon Kırılımları
"""
    for scope, data in result.breakdown.items():
        md_content += f"### {scope}\n"
        for k, v in data.items():
            if k == "_toplam":
                md_content += f"**Toplam:** {v} ton\n"
            else:
                md_content += f"- {k}: {v} ton\n"
        md_content += "\n"
        
    md_content += "## Metodoloji\n"
    for note in result.methodology_notes:
        md_content += f"- {note}\n"
        
    if format == "docx":
        from ..services.docx_generator import generate_docx
        docx_bytes = generate_docx(
            title="ISO 14064-1 Raporu",
            content=md_content,
            company_name="SustainHub",
            standard="ISO 14064-1",
            reporting_year=year
        )
        return Response(
            content=docx_bytes,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f"attachment; filename=iso14064_{year}.docx"}
        )
    else:
        raise HTTPException(status_code=400, detail="Sadece docx formatı destekleniyor")

from fastapi import Query
from ..services.trend_engine import get_iso14064_trend

@router.get("/trend/{company_id}")
async def get_trend_analysis(
    company_id: str,
    years: str = Query("2022,2023,2024"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Only allow admin or the company itself
    if str(current_user.company_id) != company_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Erişim reddedildi")
        
    year_list = [int(y.strip()) for y in years.split(",") if y.strip().isdigit()]
    result = await get_iso14064_trend(db, company_id, year_list)
    return result


