"""Role-Based Access Control helpers."""
from fastapi import HTTPException, status, Header, Depends
from typing import Optional
from ..models.user import User
from ..routes.auth import get_current_user

ROLE_HIERARCHY = {
    "admin": 100,
    "editor": 60,
    "data_entry": 40,
    "auditor": 30,
    "viewer": 10,
}

# What each role can do
ROLE_PERMISSIONS = {
    "admin": {
        "reports:create", "reports:read", "reports:approve", "reports:publish",
        "reports:delete", "reports:share",
        "emissions:create", "emissions:read", "emissions:update", "emissions:delete",
        "users:invite", "users:manage",
    },
    "editor": {
        "reports:create", "reports:read", "reports:share",
        "emissions:create", "emissions:read", "emissions:update",
    },
    "data_entry": {
        "emissions:create", "emissions:read", "emissions:update",
        "reports:read",
    },
    "auditor": {
        "reports:read", "emissions:read",
    },
    "viewer": {
        "reports:read",
    },
}


def require_permission(permission: str):
    """FastAPI dependency factory — raises 403 if user lacks the permission."""
    def _check(current_user: User) -> User:
        role = current_user.role or "viewer"
        allowed = ROLE_PERMISSIONS.get(role, set())
        if permission not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Bu işlem için '{permission}' yetkisi gerekiyor. Rolünüz: {role}",
            )
        return current_user
    return _check


def require_role(minimum_role: str):
    """FastAPI dependency factory — raises 403 if user's role is below minimum."""
    min_level = ROLE_HIERARCHY.get(minimum_role, 0)

    def _check(current_user: User) -> User:
        user_level = ROLE_HIERARCHY.get(current_user.role or "viewer", 0)
        if user_level < min_level:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Bu işlem için en az '{minimum_role}' rolü gerekiyor.",
            )
        return current_user
    return _check


def can(user: User, permission: str) -> bool:
    role = user.role or "viewer"
    return permission in ROLE_PERMISSIONS.get(role, set())


def verify_tenant(company_id: str, current_user: User) -> bool:
    """
    Verifies if the current user has access to the specified company_id.
    Standard users are restricted to their company_id.
    Consultants/Advisors can access client company IDs listed in managed_company_ids.
    """
    if not company_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Şirket ID belirtilmelidir.")

    # 1. Regular company user access
    if current_user.company_id == company_id:
        return True

    # 2. Consultant/Advisor access (managed client list)
    if current_user.managed_company_ids:
        managed_ids = [cid.strip() for cid in current_user.managed_company_ids.split(",") if cid.strip()]
        if company_id in managed_ids:
            return True

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Bu şirket verilerine erişim yetkiniz bulunmamaktadır (KVKK Veri İzolasyon İhlali)."
    )


async def get_active_company_id(
    x_tenant_id: Optional[str] = Header(None, alias="X-Tenant-ID"),
    current_user: User = Depends(get_current_user)
) -> str:
    """
    FastAPI dependency to resolve the active company context.
    If X-Tenant-ID header is provided, it checks access permissions first (KVKK RLS).
    """
    target_id = x_tenant_id or current_user.company_id
    if not target_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Şirket bağlamı (company context) bulunamadı."
        )
    verify_tenant(target_id, current_user)
    return target_id

