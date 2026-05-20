from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr
from typing import Optional
from ..database import get_db
from ..models import User, Company
from ..services.auth import hash_password, verify_password, create_access_token, decode_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

router = APIRouter(prefix="/auth", tags=["auth"])
bearer = HTTPBearer()


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    company_name: str
    tax_id: Optional[str] = None
    sector: Optional[str] = "manufacturing"
    employee_count: Optional[int] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="E-posta veya şifre hatalı")

    token = create_access_token({"sub": user.id, "company_id": user.company_id})
    return TokenResponse(
        access_token=token,
        user={"id": user.id, "email": user.email, "name": user.name, "company_id": user.company_id},
    )


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Bu e-posta zaten kayıtlı")

    company = Company(
        name=body.company_name,
        tax_id=body.tax_id or None,
        sector=body.sector,
        employee_count=body.employee_count,
    )
    db.add(company)
    await db.flush()

    user = User(
        email=body.email,
        name=body.name,
        hashed_password=hash_password(body.password),
        company_id=company.id,
    )
    db.add(user)
    await db.commit()

    token = create_access_token({"sub": user.id, "company_id": company.id})
    return TokenResponse(
        access_token=token,
        user={"id": user.id, "email": user.email, "name": user.name, "company_id": company.id},
    )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
    db: AsyncSession = Depends(get_db),
) -> User:
    try:
        payload = decode_token(credentials.credentials)
        user_id = payload.get("sub")
    except ValueError:
        raise HTTPException(status_code=401, detail="Geçersiz kimlik doğrulaması")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="Kullanıcı bulunamadı")
    return user


@router.get("/me")
async def me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "company_id": current_user.company_id,
        "role": current_user.role,
    }
