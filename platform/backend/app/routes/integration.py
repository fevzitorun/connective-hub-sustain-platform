from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional, Dict, Any
from ..database import get_db
from ..models import Company, EmissionRecord
from ..services.erp_adapter import process_erp_sync
from ..services.audit_service import log_action

router = APIRouter(prefix="/integration", tags=["integration"])

# Çok basit bir API Key mock yapısı (Normalde DB tablosu olur)
VALID_API_KEYS = {
    "sk_live_1234567890abcdef": "comp_erp_demo_id"
}

class SyncPayload(BaseModel):
    year: int
    data: Dict[str, Any]

@router.post("/sync")
async def sync_erp_data(
    payload: SyncPayload,
    x_api_key: str = Header(None),
    db: AsyncSession = Depends(get_db)
):
    """
    ERP Sistemlerinden (SAP vb.) gelen verileri senkronize eder.
    x-api-key başlığı zorunludur.
    """
    if not x_api_key or x_api_key not in VALID_API_KEYS:
        raise HTTPException(status_code=401, detail="Geçersiz veya eksik API Anahtarı.")
        
    # İleride DB'den şirket ID'si bulunacak
    # Demo amaçlı doğrudan bir şirket ID oluşturup veya var olanla devam ediyoruz.
    # Burada company tablosundan sorgu yapılabilir, es geçiyoruz mock olarak 1 numaralı id varsayabiliriz
    company_id = "comp_test_1" # VALID_API_KEYS[x_api_key] 
    
    # ERP Adapter'dan geçir
    converted_data = process_erp_sync(payload.data)
    
    # Veritabanında o yılın emisyon kaydını bul veya oluştur
    result = await db.execute(
        select(EmissionRecord)
        .where(
            EmissionRecord.company_id == company_id,
            EmissionRecord.year == payload.year
        )
    )
    emission = result.scalar_one_or_none()
    
    if not emission:
        emission = EmissionRecord(
            company_id=company_id,
            year=payload.year,
            reporting_boundary="operational_control",
            electricity_kwh=converted_data.get("electricity_kwh", 0),
            natural_gas_m3=converted_data.get("natural_gas_m3", 0),
            diesel_liters=converted_data.get("diesel_liters", 0)
        )
        db.add(emission)
    else:
        emission.electricity_kwh = (emission.electricity_kwh or 0) + converted_data.get("electricity_kwh", 0)
        emission.natural_gas_m3 = (emission.natural_gas_m3 or 0) + converted_data.get("natural_gas_m3", 0)
        emission.diesel_liters = (emission.diesel_liters or 0) + converted_data.get("diesel_liters", 0)
        
    await db.commit()
    await db.refresh(emission)
    
    # Audit log (System Integration)
    await log_action(
        db=db,
        user_id=None,
        user_email="erp_system@integration.local",
        user_role="system_api",
        action="Sync",
        entity_type="erp_sync",
        entity_id=emission.id,
        entity_desc="Dış sistem (ERP) üzerinden veri senkronizasyonu yapıldı.",
        company_id=company_id,
        table_name="emission_records",
        new_value=str(converted_data)
    )
    
    return {
        "status": "success",
        "message": "ERP verileri başarıyla senkronize edildi.",
        "converted_data": converted_data
    }
