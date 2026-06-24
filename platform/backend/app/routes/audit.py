"""Denetim İzi API — TSRS 1 Madde 9."""
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from pydantic import BaseModel
import csv
import io

from ..database import get_db
from ..services.audit_service import get_audit_logs
from ..services.auth import get_current_user
from ..services.rbac import require_role

router = APIRouter(prefix="/audit", tags=["audit"])


@router.get("/logs")
async def list_audit_logs(
    user_email: Optional[str] = Query(None),
    entity_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(100, le=500),
    offset: int = Query(0),
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Denetim kayıtlarını listele. Sadece admin ve auditor rolü erişebilir."""
    require_role(current_user, min_level=30)  # auditor+
    logs = await get_audit_logs(
        db,
        user_email=user_email,
        entity_type=entity_type,
        status=status,
        limit=limit,
        offset=offset,
    )
    return {
        "total": len(logs),
        "logs": [
            {
                "id": l.id,
                "user_email": l.user_email,
                "user_role": l.user_role,
                "action": l.action,
                "entity_type": l.entity_type,
                "entity_desc": l.entity_desc,
                "ip_address": l.ip_address,
                "status": l.status,
                "created_at": l.created_at.isoformat() if l.created_at else None,
            }
            for l in logs
        ],
    }


@router.get("/logs/export")
async def export_audit_csv(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Denetim kayıtlarını CSV olarak indir."""
    require_role(current_user, min_level=60)  # editor+
    logs = await get_audit_logs(db, limit=500)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Zaman", "Kullanıcı", "Rol", "İşlem", "Nesne", "IP", "Durum"])
    for l in logs:
        writer.writerow([
            l.created_at.isoformat() if l.created_at else "",
            l.user_email or "",
            l.user_role,
            l.action,
            l.entity_desc,
            l.ip_address or "",
            l.status,
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=denetim-izi.csv"},
    )

class VerifyPayload(BaseModel):
    record_id: int
    status: str
    notes: str = ""

@router.post("/verify")
async def verify_emission_record(
    payload: VerifyPayload,
    current_user=Depends(get_current_user)
):
    """Denetçi tarafından kaydın doğrulanması."""
    require_role(current_user, min_level=30)  # auditor+
    from ..services.verification_service import verify_record
    
    auditor_name = current_user.full_name or current_user.email
    result = verify_record(payload.record_id, auditor_name, payload.status, payload.notes)
    return result
