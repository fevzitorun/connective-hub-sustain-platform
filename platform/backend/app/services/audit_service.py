"""
Denetim izi servisi.
TSRS 1 Madde 9 uyarınca tüm kullanıcı ve sistem işlemlerini kaydeder.
"""
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from ..models.audit import AuditLog


async def log_action(
    db: AsyncSession,
    user_id: Optional[str],
    user_email: Optional[str],
    user_role: str,
    action: str,
    entity_type: str,
    entity_id: Optional[str],
    entity_desc: str,
    company_id: Optional[str] = None,
    table_name: Optional[str] = None,
    old_value: Optional[str] = None,
    new_value: Optional[str] = None,
    ip_address: Optional[str] = None,
    status: str = "ok",
    extra: Optional[dict] = None,
) -> AuditLog:
    """Denetim kaydı oluştur."""
    log = AuditLog(
        user_id=user_id,
        user_email=user_email,
        company_id=company_id,
        user_role=user_role,
        action=action,
        table_name=table_name,
        old_value=old_value,
        new_value=new_value,
        entity_type=entity_type,
        entity_id=entity_id,
        entity_desc=entity_desc,
        ip_address=ip_address,
        status=status,
        extra=extra or {},
        timestamp=datetime.now(timezone.utc),
        created_at=datetime.now(timezone.utc),
    )
    db.add(log)
    await db.commit()
    await db.refresh(log)
    return log


async def get_audit_logs(
    db: AsyncSession,
    company_id: Optional[str] = None,
    user_email: Optional[str] = None,
    entity_type: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
) -> list[AuditLog]:
    """Filtrelenmiş denetim kayıtları."""
    q = select(AuditLog).order_by(desc(AuditLog.created_at))
    if user_email:
        q = q.where(AuditLog.user_email == user_email)
    if entity_type:
        q = q.where(AuditLog.entity_type == entity_type)
    if status:
        q = q.where(AuditLog.status == status)
    q = q.limit(limit).offset(offset)
    result = await db.execute(q)
    return list(result.scalars().all())
