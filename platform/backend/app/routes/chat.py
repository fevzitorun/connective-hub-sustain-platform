from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from ..database import get_db
from ..models import User, EmissionRecord, Company
from .auth import get_current_user
from ..services.alert_engine import detect_anomalies
from ..services.ai_copilot import chat_with_data

router = APIRouter(prefix="/chat", tags=["chat"])

class ChatMessage(BaseModel):
    message: str

@router.post("")
async def copilot_chat(
    req: ChatMessage,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Kullanıcının ESG verileri ve anomali tespiti bağlamıyla Sustain-Copilot'a mesaj atması.
    """
    if not current_user.company_id:
        raise HTTPException(400, "Şirket bilgisi bulunamadı.")
        
    # Get recent emissions for context
    result = await db.execute(
        select(EmissionRecord)
        .where(EmissionRecord.company_id == current_user.company_id)
        .order_by(EmissionRecord.year.desc())
        .limit(2)
    )
    records = result.scalars().all()
    
    context = {}
    anomalies = []
    
    if len(records) >= 1:
        current_data = {
            "year": records[0].year,
            "electricity_kwh": records[0].electricity_kwh or 0,
            "natural_gas_m3": records[0].natural_gas_m3 or 0,
            "diesel_liters": records[0].diesel_liters or 0,
            "total_scope1_2_co2e": records[0].total_co2e or 0
        }
        context["current_year_data"] = current_data
        
        if len(records) >= 2:
            historical_data = {
                "year": records[1].year,
                "electricity_kwh": records[1].electricity_kwh or 0,
                "natural_gas_m3": records[1].natural_gas_m3 or 0,
                "diesel_liters": records[1].diesel_liters or 0
            }
            context["previous_year_data"] = historical_data
            
            # Anomaly Detection Trigger
            anomalies = detect_anomalies(current_data, historical_data)

    # Call AI Copilot
    ai_response = await chat_with_data(
        user_message=req.message,
        company_context=context,
        anomalies=anomalies
    )
    
    return {
        "reply": ai_response,
        "anomalies_detected": len(anomalies) > 0
    }
