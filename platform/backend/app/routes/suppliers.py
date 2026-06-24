from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
import uuid
from typing import Optional
from ..database import get_db
from ..models import User, EmissionRecord
from ..models.supplier import Supplier
from .auth import get_current_user
from ..services.ocr_service import process_invoice
from ..services.audit_service import log_action

router = APIRouter(prefix="/suppliers", tags=["suppliers"])

class InviteRequest(BaseModel):
    name: str
    email: Optional[str] = None

class SubmitLiteRequest(BaseModel):
    token: str
    year: int = 2024
    consumption: float
    unit: str

@router.post("/invite")
async def invite_supplier(
    req: InviteRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Tedarikçiye özel lite-entry linki oluştur."""
    if not current_user.company_id:
        raise HTTPException(400, "Şirket ID bulunamadı.")
        
    token = str(uuid.uuid4()).replace("-", "")
    
    supplier = Supplier(
        parent_company_id=current_user.company_id,
        name=req.name,
        email=req.email,
        unique_token=token
    )
    db.add(supplier)
    await db.commit()
    await db.refresh(supplier)
    
    return {
        "supplier_id": supplier.id,
        "invite_link": f"https://SustainHub.online/lite-entry?token={token}",
        "token": token
    }

@router.post("/submit-lite")
async def submit_lite(
    req: SubmitLiteRequest,
    db: AsyncSession = Depends(get_db)
):
    """Auth gerektirmeyen veri giriş endpoint'i (Tedarikçi Kapsam 3 verisi)."""
    # Token doğrula
    result = await db.execute(select(Supplier).where(Supplier.unique_token == req.token))
    supplier = result.scalar_one_or_none()
    
    if not supplier:
        raise HTTPException(404, "Geçersiz veya süresi dolmuş token.")
        
    # Parent company'nin emisyon kaydını bul veya oluştur
    em_res = await db.execute(
        select(EmissionRecord)
        .where(
            EmissionRecord.company_id == supplier.parent_company_id,
            EmissionRecord.year == req.year
        )
    )
    emission = em_res.scalar_one_or_none()
    
    # Varsayalım ki bu tedarikçi dışarıdan alınan elektrik veya Kapsam 3 ürünü
    # Kapsam 3 olarak (veya uygun kategoriye) kaydedelim.
    if not emission:
        emission = EmissionRecord(
            company_id=supplier.parent_company_id,
            year=req.year,
            reporting_boundary="operational_control",
            scope3_co2e=req.consumption * 0.5  # Basit bir emisyon faktörü varsayımı
        )
        db.add(emission)
    else:
        current_scope3 = emission.scope3_co2e or 0
        emission.scope3_co2e = current_scope3 + (req.consumption * 0.5)
    
    supplier.status = "submitted"
    await db.commit()
    
    # Audit Log (Denetim izi) - sistemsel işlem olduğu için user_id olmadan kaydedilebilir
    await log_action(
        db=db,
        user_id=None,
        user_email=supplier.email,
        user_role="supplier",
        action="Giriş",
        entity_type="emission_scope3",
        entity_id=emission.id,
        entity_desc=f"Tedarikçi ({supplier.name}) üzerinden otomatik Kapsam 3 veri girişi yapıldı",
        company_id=supplier.parent_company_id,
        table_name="emission_records",
        new_value=f"{{ 'consumption': {req.consumption}, 'unit': '{req.unit}' }}"
    )
    
    return {"status": "success", "message": "Veri başarıyla kaydedildi."}

@router.post("/ocr")
async def process_ocr(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Faturadan tüketim verisi okuma."""
    content = await file.read()
    
    # Call AI OCR service
    ocr_result = await process_invoice(content)
    if not ocr_result:
        raise HTTPException(500, "Fatura okunamadı.")
        
    # Log the OCR operation as requested
    await log_action(
        db=db,
        user_id=current_user.id,
        user_email=current_user.email,
        user_role="user",
        action="Giriş",
        entity_type="ocr_invoice",
        entity_id=file.filename,
        entity_desc="Fatura AI OCR Vision ile okundu.",
        company_id=current_user.company_id,
        table_name="emission_records", # Logical target
        new_value=str(ocr_result)
    )
    
    return ocr_result
