"""Role-Based Access Control helpers."""
from fastapi import HTTPException, status
from ..models.user import User

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
