import secrets
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr
from ..database import get_db
from ..models import User
from ..services.auth import hash_password
from .auth import get_admin_user

router = APIRouter(prefix="/users", tags=["users"])

VALID_ROLES = {"admin", "editor", "viewer", "auditor", "data_entry"}

ROLE_LABELS = {
    "admin":      "Yönetici",
    "editor":     "Editör",
    "viewer":     "İzleyici",
    "auditor":    "Denetçi",
    "data_entry": "Veri Girişi",
}


class InviteRequest(BaseModel):
    email: EmailStr
    name: str
    role: str = "editor"


class UpdateRoleRequest(BaseModel):
    role: str


@router.get("")
async def list_users(
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(User).where(User.company_id == admin.company_id).order_by(User.created_at)
    )
    users = result.scalars().all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "name": u.name,
            "role": u.role,
            "role_label": ROLE_LABELS.get(u.role, u.role),
            "is_self": u.id == admin.id,
            "created_at": u.created_at.isoformat(),
        }
        for u in users
    ]


@router.post("/invite", status_code=201)
async def invite_user(
    body: InviteRequest,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    if body.role not in VALID_ROLES:
        raise HTTPException(400, f"Geçersiz rol. Geçerli roller: {', '.join(sorted(VALID_ROLES))}")

    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(400, "Bu e-posta zaten kayıtlı")

    temp_password = secrets.token_urlsafe(10)

    user = User(
        email=body.email,
        name=body.name,
        hashed_password=hash_password(temp_password),
        company_id=admin.company_id,
        role=body.role,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "role": user.role,
        "role_label": ROLE_LABELS.get(user.role, user.role),
        "temp_password": temp_password,
    }


@router.patch("/{user_id}/role")
async def update_role(
    user_id: str,
    body: UpdateRoleRequest,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    if body.role not in VALID_ROLES:
        raise HTTPException(400, f"Geçersiz rol. Geçerli roller: {', '.join(sorted(VALID_ROLES))}")

    if user_id == admin.id:
        raise HTTPException(400, "Kendi rolünüzü değiştiremezsiniz")

    user = await db.get(User, user_id)
    if not user or user.company_id != admin.company_id:
        raise HTTPException(404, "Kullanıcı bulunamadı")

    user.role = body.role
    await db.commit()
    return {"id": user.id, "role": user.role, "role_label": ROLE_LABELS.get(user.role, user.role)}


@router.delete("/{user_id}", status_code=204)
async def remove_user(
    user_id: str,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    if user_id == admin.id:
        raise HTTPException(400, "Kendinizi silemezsiniz")

    user = await db.get(User, user_id)
    if not user or user.company_id != admin.company_id:
        raise HTTPException(404, "Kullanıcı bulunamadı")

    await db.delete(user)
    await db.commit()
