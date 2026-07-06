"""EMİR 2: Kullanıcı yönetimi ve rol atama."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr
from typing import Optional
from ..database import get_db
from ..models import User, Company
from ..services.rbac import require_role, ROLE_HIERARCHY, get_active_company_id
from ..services.auth import hash_password, create_access_token
from ..services.subscription_service import check_limits
from .auth import get_current_user

router = APIRouter(prefix="/users", tags=["users"])

VALID_ROLES = list(ROLE_HIERARCHY.keys())


class InviteRequest(BaseModel):
    email: EmailStr
    name: str
    role: str = "editor"
    temp_password: str


class UpdateRoleRequest(BaseModel):
    role: str


@router.get("")
async def list_users(
    company_id: str = Depends(get_active_company_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Şirket kullanıcılarını listele (admin/editor)."""
    _ = require_role("editor")(current_user)

    result = await db.execute(
        select(User).where(User.company_id == company_id)
    )
    users = result.scalars().all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "name": u.name,
            "role": u.role,
            "is_active": u.is_active,
            "created_at": u.created_at.isoformat(),
        }
        for u in users
    ]


@router.post("/invite", status_code=201)
async def invite_user(
    body: InviteRequest,
    company_id: str = Depends(get_active_company_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Şirkete yeni kullanıcı davet et (admin only)."""
    _ = require_role("admin")(current_user)

    await check_limits(db, company_id, "create_user")

    if body.role not in VALID_ROLES:
        raise HTTPException(400, f"Geçersiz rol. Geçerli roller: {', '.join(VALID_ROLES)}")

    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(400, "Bu e-posta zaten kayıtlı")

    new_user = User(
        email=body.email,
        name=body.name,
        hashed_password=hash_password(body.temp_password),
        role=body.role,
        company_id=company_id,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return {
        "id": new_user.id,
        "email": new_user.email,
        "name": new_user.name,
        "role": new_user.role,
        "message": f"{body.email} kullanıcısı '{body.role}' rolüyle eklendi. Geçici şifre ile giriş yapabilir.",
    }


@router.patch("/{user_id}/role")
async def update_role(
    user_id: str,
    body: UpdateRoleRequest,
    company_id: str = Depends(get_active_company_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Kullanıcı rolünü güncelle (admin only)."""
    _ = require_role("admin")(current_user)

    if body.role not in VALID_ROLES:
        raise HTTPException(400, f"Geçersiz rol: {body.role}")

    result = await db.execute(
        select(User).where(
            User.id == user_id,
            User.company_id == company_id,
        )
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(404, "Kullanıcı bulunamadı")
    if user.id == current_user.id:
        raise HTTPException(400, "Kendi rolünüzü değiştiremezsiniz")

    user.role = body.role
    await db.commit()
    return {"id": user.id, "role": user.role}


@router.delete("/{user_id}")
async def deactivate_user(
    user_id: str,
    company_id: str = Depends(get_active_company_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Kullanıcıyı devre dışı bırak (admin only)."""
    _ = require_role("admin")(current_user)

    result = await db.execute(
        select(User).where(
            User.id == user_id,
            User.company_id == company_id,
        )
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(404, "Kullanıcı bulunamadı")
    if user.id == current_user.id:
        raise HTTPException(400, "Kendinizi silemezsiniz")

    user.is_active = False
    await db.commit()
    return {"id": user.id, "is_active": False}
