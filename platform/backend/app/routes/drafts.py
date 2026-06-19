"""EMİR 1: Draft / Auto-Save sistemi."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
from ..database import get_db
from ..models import User
from ..models.report import ReportDraft
from .auth import get_current_user

router = APIRouter(prefix="/drafts", tags=["drafts"])


class SaveDraftRequest(BaseModel):
    emission_data_id: Optional[str] = None
    report_id: Optional[str] = None
    content: Optional[dict] = None
    notes: Optional[str] = None


@router.post("/save")
async def save_draft(
    body: SaveDraftRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Otomatik kaydetme — 30 saniyede bir frontend'den çağrılır."""
    result = await db.execute(
        select(ReportDraft).where(
            ReportDraft.user_id == current_user.id,
            ReportDraft.company_id == current_user.company_id,
        ).order_by(ReportDraft.updated_at.desc())
    )
    draft = result.scalars().first()

    if draft:
        if body.emission_data_id:
            draft.emission_data_id = body.emission_data_id
        if body.report_id:
            draft.report_id = body.report_id
        if body.content is not None:
            draft.content = body.content
        if body.notes is not None:
            draft.notes = body.notes
        draft.updated_at = datetime.now(timezone.utc)
    else:
        draft = ReportDraft(
            user_id=current_user.id,
            company_id=current_user.company_id,
            emission_data_id=body.emission_data_id,
            report_id=body.report_id,
            content=body.content,
            notes=body.notes,
        )
        db.add(draft)

    await db.commit()
    await db.refresh(draft)
    return {"id": draft.id, "updated_at": draft.updated_at.isoformat()}


@router.get("/latest")
async def get_latest_draft(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """En son kaydedilen taslağı getir."""
    result = await db.execute(
        select(ReportDraft).where(
            ReportDraft.user_id == current_user.id,
            ReportDraft.company_id == current_user.company_id,
        ).order_by(ReportDraft.updated_at.desc())
    )
    draft = result.scalars().first()
    if not draft:
        return None
    return {
        "id": draft.id,
        "emission_data_id": draft.emission_data_id,
        "report_id": draft.report_id,
        "content": draft.content,
        "notes": draft.notes,
        "updated_at": draft.updated_at.isoformat(),
    }


@router.delete("/{draft_id}")
async def delete_draft(
    draft_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ReportDraft).where(
            ReportDraft.id == draft_id,
            ReportDraft.user_id == current_user.id,
        )
    )
    draft = result.scalar_one_or_none()
    if not draft:
        raise HTTPException(404, "Taslak bulunamadı")
    await db.delete(draft)
    await db.commit()
    return {"deleted": True}
