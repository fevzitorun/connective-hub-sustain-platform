from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from ..database import get_db
from ..models import User, Verification, EmissionRecord
from ..services.auth import get_current_user
from ..services.rbac import require_role

router = APIRouter(prefix="/api/verification", tags=["ISO 14064-3 Verification"])

class VerificationRequest(BaseModel):
    emission_id: str
    
class VerificationResponse(BaseModel):
    id: str
    emission_id: str
    auditor_id: str
    status: str
    assurance_level: str
    materiality_threshold: float
    verified_at: Optional[datetime]
    created_at: datetime
    
class VerificationUpdate(BaseModel):
    status: str # verified, rejected, in_progress
    findings: str # JSON string for now

@router.post("/request", response_model=VerificationResponse)
async def request_verification(
    req: VerificationRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Firmaların doğrulama (verification) talebi oluşturması."""
    
    # Emission'ı kontrol et
    stmt = select(EmissionRecord).where(
        EmissionRecord.id == req.emission_id,
        EmissionRecord.company_id == current_user.company_id
    )
    res = await db.execute(stmt)
    emission = res.scalar_one_or_none()
    
    if not emission:
        raise HTTPException(status_code=404, detail="Emisyon kaydı bulunamadı veya yetkisiz erişim")
        
    # Check if already requested
    stmt_exist = select(Verification).where(Verification.emission_id == req.emission_id)
    res_exist = await db.execute(stmt_exist)
    if res_exist.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Bu emisyon için zaten doğrulama talebi var")
        
    verification = Verification(
        emission_id=req.emission_id,
        auditor_id="mock-auditor-id", # In real app, auditor is assigned or chosen
        status="pending"
    )
    db.add(verification)
    await db.commit()
    await db.refresh(verification)
    
    return verification

@router.get("/list")
async def list_verifications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Denetçinin kendisine atanmış doğrulamaları görmesi."""
    require_role("auditor")(current_user)
    
    stmt = select(Verification) # In real app: where(Verification.auditor_id == current_user.id)
    res = await db.execute(stmt)
    verifications = res.scalars().all()
    
    return {"verifications": verifications}

@router.post("/{verification_id}/verify")
async def verify_record(
    verification_id: str,
    update: VerificationUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Denetçinin doğrulamayı tamamlaması."""
    require_role("auditor")(current_user)
    
    stmt = select(Verification).where(Verification.id == verification_id)
    res = await db.execute(stmt)
    verification = res.scalar_one_or_none()
    
    if not verification:
        raise HTTPException(status_code=404, detail="Doğrulama kaydı bulunamadı")
        
    verification.status = update.status
    verification.findings = update.findings
    if update.status == "verified":
        verification.verified_at = datetime.utcnow()
        
    await db.commit()
    
    return {"status": "success", "verification_status": verification.status}
