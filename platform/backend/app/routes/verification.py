from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from ..database import get_db
from ..models import User, Verification, EmissionRecord
from .auth import get_current_user
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

    # Şirkette "auditor" rolüne sahip bir kullanıcıya ata (Verification.auditor_id NOT NULL
    # bir FK — önceden burada gerçek olmayan bir ID yazılıyordu, Postgres'te FK ihlaliyle
    # her talebi kırıyordu).
    auditor_stmt = select(User).where(
        User.company_id == current_user.company_id,
        User.role == "auditor",
        User.is_active.is_(True),
    ).limit(1)
    auditor = (await db.execute(auditor_stmt)).scalar_one_or_none()
    if not auditor:
        raise HTTPException(
            status_code=400,
            detail="Şirketinizde 'auditor' rolüne sahip aktif bir kullanıcı yok. "
                   "Doğrulama talebi oluşturmadan önce bir denetçi davet edin.",
        )

    verification = Verification(
        emission_id=req.emission_id,
        auditor_id=auditor.id,
        status="pending"
    )
    db.add(verification)
    await db.commit()
    await db.refresh(verification)

    return VerificationResponse(
        id=verification.id,
        emission_id=verification.emission_id,
        auditor_id=verification.auditor_id,
        status=verification.status,
        assurance_level=verification.assurance_level,
        materiality_threshold=verification.materiality_threshold,
        verified_at=verification.verified_at,
        created_at=verification.created_at,
    )

@router.get("/list")
async def list_verifications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Denetçinin kendisine atanmış doğrulamaları görmesi."""
    require_role("auditor")(current_user)

    # Önceden şirket/denetçi filtresi yoktu — herhangi bir "auditor" rolündeki kullanıcı
    # sistemdeki TÜM şirketlerin doğrulama kayıtlarını görebiliyordu (tenant izolasyon açığı).
    stmt = select(Verification).where(Verification.auditor_id == current_user.id)
    res = await db.execute(stmt)
    verifications = res.scalars().all()

    return {
        "verifications": [
            {
                "id": v.id,
                "emission_id": v.emission_id,
                "auditor_id": v.auditor_id,
                "status": v.status,
                "findings": v.findings,
                "assurance_level": v.assurance_level,
                "materiality_threshold": v.materiality_threshold,
                "verified_at": v.verified_at.isoformat() if v.verified_at else None,
                "created_at": v.created_at.isoformat() if v.created_at else None,
            }
            for v in verifications
        ]
    }

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

    # Sadece bu kayda atanmış denetçi tamamlayabilir — önceden herhangi bir "auditor"
    # rolündeki kullanıcı sistemdeki HERHANGİ bir doğrulamayı değiştirebiliyordu.
    if verification.auditor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu doğrulama size atanmamış.")

    verification.status = update.status
    verification.findings = update.findings
    if update.status == "verified":
        verification.verified_at = datetime.utcnow()
        
    await db.commit()
    
    return {"status": "success", "verification_status": verification.status}
