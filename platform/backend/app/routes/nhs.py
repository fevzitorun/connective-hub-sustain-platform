"""
UK NHS PPN 06/21 Compliance Routes.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import List, Optional

from ..database import get_db
from ..models import Company, EmissionRecord, User
from .auth import get_current_user
from ..services.nhs_service import analyze_ppn_compliance, generate_crp_html

router = APIRouter(prefix="/nhs", tags=["UK NHS Net Zero"])

class PPNInput(BaseModel):
    company_id: str
    year: Optional[int] = 2024

class GenerateCRPInput(BaseModel):
    company_id: str
    year: Optional[int] = 2024
    selected_actions: List[str] = []

@router.post("/assess")
async def assess_ppn_compliance(
    body: PPNInput,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Kampüs veya KOBİ emisyon verisinden PPN 06/21 uyumluluk analizi yapar."""
    company = await db.get(Company, body.company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Şirket bulunamadı")

    # Fetch latest emission record for the given year
    result = await db.execute(
        select(EmissionRecord)
        .where(EmissionRecord.company_id == body.company_id)
        .where(EmissionRecord.year == body.year)
    )
    emission = result.scalars().first()
    
    # Format to dict for the engine
    emission_dict = {}
    if emission:
        emission_dict = {
            "year": emission.year,
            "scope1_co2e": float(emission.scope1_co2e) if emission.scope1_co2e is not None else 0.0,
            "scope2_location_co2e": float(emission.scope2_location_co2e) if emission.scope2_location_co2e is not None else 0.0,
            "scope2_market_co2e": float(emission.scope2_market_co2e) if emission.scope2_market_co2e is not None else 0.0,
            "purchased_goods_spend_tl": float(emission.purchased_goods_spend_tl) if emission.purchased_goods_spend_tl is not None else 0.0,
            "waste_tons": float(emission.waste_tons) if emission.waste_tons is not None else 0.0,
            "business_travel_flight_km": float(emission.business_travel_flight_km) if emission.business_travel_flight_km is not None else 0.0,
            "employee_commute_km": float(emission.employee_commute_km) if emission.employee_commute_km is not None else 0.0,
        }
    else:
        # Return empty baseline structure
        emission_dict = {
            "year": body.year,
            "scope1_co2e": 0.0,
            "scope2_location_co2e": 0.0,
            "scope3_co2e": 0.0,
        }

    assessment = analyze_ppn_compliance(emission_dict, company_name=company.name)
    return {"result": assessment}

@router.post("/generate-crp")
async def generate_crp_document(
    body: GenerateCRPInput,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Resmi UK PPN 06/21 şablonunda Carbon Reduction Plan belgesi oluşturur."""
    company = await db.get(Company, body.company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Şirket bulunamadı")

    result = await db.execute(
        select(EmissionRecord)
        .where(EmissionRecord.company_id == body.company_id)
        .where(EmissionRecord.year == body.year)
    )
    emission = result.scalars().first()
    
    emission_dict = {}
    if emission:
        emission_dict = {
            "year": emission.year,
            "scope1_co2e": float(emission.scope1_co2e) if emission.scope1_co2e is not None else 0.0,
            "scope2_location_co2e": float(emission.scope2_location_co2e) if emission.scope2_location_co2e is not None else 0.0,
            "purchased_goods_spend_tl": float(emission.purchased_goods_spend_tl) if emission.purchased_goods_spend_tl is not None else 0.0,
            "waste_tons": float(emission.waste_tons) if emission.waste_tons is not None else 0.0,
            "business_travel_flight_km": float(emission.business_travel_flight_km) if emission.business_travel_flight_km is not None else 0.0,
            "employee_commute_km": float(emission.employee_commute_km) if emission.employee_commute_km is not None else 0.0,
        }
    else:
        emission_dict = {"year": body.year}

    assessment = analyze_ppn_compliance(emission_dict, company_name=company.name)
    html_content = generate_crp_html(assessment, body.selected_actions)
    
    return {"html": html_content}
