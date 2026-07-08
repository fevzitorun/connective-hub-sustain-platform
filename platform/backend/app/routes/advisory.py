from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from pydantic import BaseModel
from typing import Optional
from ..database import get_db
from ..models.advisory import AdvisoryNote
from ..models.user import User
from ..models.company import Company
from .auth import get_current_user
from ..services.rbac import require_role

router = APIRouter(prefix="/advisory", tags=["advisory"])


class NoteCreate(BaseModel):
    company_id: str
    content: str
    priority: Optional[str] = "normal"
    author_title: Optional[str] = None


@router.post("/notes")
async def create_note(
    data: NoteCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """YK üyesi (editor+) şirket için stratejik not bırakır."""
    require_role("editor")(current_user)

    # Şirket var mı?
    company_q = await db.execute(select(Company).where(Company.id == data.company_id))
    if not company_q.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Şirket bulunamadı")

    note = AdvisoryNote(
        company_id=data.company_id,
        author_id=current_user.id,
        author_name=current_user.name,
        author_title=data.author_title or current_user.role,
        content=data.content,
        priority=data.priority or "normal",
    )
    db.add(note)
    await db.commit()
    await db.refresh(note)

    return {
        "id": note.id,
        "company_id": note.company_id,
        "author_name": note.author_name,
        "content": note.content,
        "priority": note.priority,
        "created_at": note.created_at.isoformat(),
    }


@router.get("/notes/company/{company_id}")
async def get_company_notes(
    company_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Bir şirketin YK notlarını getir. Şirket sahibi + admin/editor görebilir."""
    is_advisor = current_user.role in ("admin", "editor", "auditor")
    is_owner = current_user.company_id == company_id

    if not (is_advisor or is_owner):
        raise HTTPException(status_code=403, detail="Bu notlara erişim yetkiniz yok")

    notes_q = await db.execute(
        select(AdvisoryNote)
        .where(AdvisoryNote.company_id == company_id)
        .order_by(AdvisoryNote.created_at.desc())
        .limit(20)
    )
    notes = notes_q.scalars().all()

    return {
        "notes": [
            {
                "id": n.id,
                "author_name": n.author_name,
                "author_title": n.author_title,
                "content": n.content,
                "priority": n.priority,
                "is_read": n.is_read,
                "created_at": n.created_at.isoformat(),
            }
            for n in notes
        ],
        "unread_count": sum(1 for n in notes if not n.is_read),
    }


@router.get("/notes/my-company")
async def get_my_company_notes(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Giriş yapan kullanıcının şirketine ait YK notlarını getir (dashboard widget)."""
    if not current_user.company_id:
        return {"notes": [], "unread_count": 0}

    notes_q = await db.execute(
        select(AdvisoryNote)
        .where(AdvisoryNote.company_id == current_user.company_id)
        .order_by(AdvisoryNote.created_at.desc())
        .limit(5)
    )
    notes = notes_q.scalars().all()

    return {
        "notes": [
            {
                "id": n.id,
                "author_name": n.author_name,
                "author_title": n.author_title,
                "content": n.content,
                "priority": n.priority,
                "is_read": n.is_read,
                "created_at": n.created_at.isoformat(),
            }
            for n in notes
        ],
        "unread_count": sum(1 for n in notes if not n.is_read),
    }


@router.patch("/notes/{note_id}/read")
async def mark_read(
    note_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Notu okundu olarak işaretle."""
    await db.execute(
        update(AdvisoryNote)
        .where(AdvisoryNote.id == note_id)
        .values(is_read=True)
    )
    await db.commit()
    return {"ok": True}
