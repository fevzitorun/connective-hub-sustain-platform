"""
Doğrulama (Verification) akışı testleri — /api/verification/...

Önceki hâl: request_verification() `auditor_id="mock-auditor-id"` yazıyordu —
Verification.auditor_id NOT NULL bir FK (users.id), gerçek bir Postgres'te bu
her talebi FK ihlaliyle kırardı. SQLite testte FK zorunlu kılınmadığı için bu
hiç yakalanmıyordu. Bu dosyanın eski hâli de API'yi hiç çağırmıyor, sadece
unpersisted bir model nesnesinin Python alanlarını kontrol ediyordu.
"""
import uuid
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.models import User, EmissionRecord


async def _make_auditor(db: AsyncSession, company_id: str) -> User:
    from app.services.auth import hash_password
    auditor = User(
        email=f"auditor-{uuid.uuid4().hex[:8]}@sustainhub.ai",
        name="Test Denetçi",
        hashed_password=hash_password("Auditor1234!"),
        role="auditor",
        company_id=company_id,
        is_active=True,
    )
    db.add(auditor)
    await db.commit()
    await db.refresh(auditor)
    return auditor


async def _make_emission(db: AsyncSession, company_id: str, year: int = 2024) -> EmissionRecord:
    emission = EmissionRecord(company_id=company_id, year=year, scope1_co2e=100)
    db.add(emission)
    await db.commit()
    await db.refresh(emission)
    return emission


@pytest.mark.asyncio
async def test_request_verification_fails_without_auditor(auth_client: AsyncClient, db: AsyncSession):
    """Şirkette hiç auditor rolü yoksa dürüst bir hata dönmeli — sahte ID yazılmamalı."""
    me = await auth_client.get("/auth/me")
    company_id = me.json()["company_id"]
    emission = await _make_emission(db, company_id)

    resp = await auth_client.post("/api/verification/request", json={"emission_id": emission.id})
    assert resp.status_code == 400
    assert "auditor" in resp.json()["detail"].lower() or "denetçi" in resp.json()["detail"].lower()


@pytest.mark.asyncio
async def test_request_verification_happy_path(auth_client: AsyncClient, db: AsyncSession):
    me = await auth_client.get("/auth/me")
    company_id = me.json()["company_id"]
    emission = await _make_emission(db, company_id)
    auditor = await _make_auditor(db, company_id)

    resp = await auth_client.post("/api/verification/request", json={"emission_id": emission.id})
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["emission_id"] == emission.id
    assert data["auditor_id"] == auditor.id
    assert data["status"] == "pending"


@pytest.mark.asyncio
async def test_request_verification_duplicate_rejected(auth_client: AsyncClient, db: AsyncSession):
    me = await auth_client.get("/auth/me")
    company_id = me.json()["company_id"]
    emission = await _make_emission(db, company_id)
    await _make_auditor(db, company_id)

    first = await auth_client.post("/api/verification/request", json={"emission_id": emission.id})
    assert first.status_code == 200

    second = await auth_client.post("/api/verification/request", json={"emission_id": emission.id})
    assert second.status_code == 400


@pytest.mark.asyncio
async def test_verify_rejects_non_assigned_user(auth_client: AsyncClient, db: AsyncSession):
    """
    Kaydı isteyen editor kullanıcısı (auth_client), kendisine atanmamış bir
    doğrulamayı tamamlayamaz — sadece atanan auditor tamamlayabilir. (Önceden
    hiç sahiplik kontrolü yoktu; herhangi bir 'auditor' rolündeki kullanıcı
    sistemdeki HERHANGİ bir şirketin kaydını değiştirebilirdi.)
    """
    me = await auth_client.get("/auth/me")
    company_id = me.json()["company_id"]
    emission = await _make_emission(db, company_id)
    await _make_auditor(db, company_id)

    req = await auth_client.post("/api/verification/request", json={"emission_id": emission.id})
    verification_id = req.json()["id"]

    resp = await auth_client.post(
        f"/api/verification/{verification_id}/verify",
        json={"status": "verified", "findings": "{}"},
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_verify_allows_assigned_auditor(db: AsyncSession, auth_client: AsyncClient):
    """Atanan auditor kendisine atanmış kaydı gerçekten tamamlayabilmeli."""
    me = await auth_client.get("/auth/me")
    company_id = me.json()["company_id"]
    emission = await _make_emission(db, company_id)
    auditor = await _make_auditor(db, company_id)

    req = await auth_client.post("/api/verification/request", json={"emission_id": emission.id})
    verification_id = req.json()["id"]

    from app.services.auth import create_access_token
    token = create_access_token({"sub": auditor.id, "company_id": company_id})
    auditor_client = AsyncClient(transport=ASGITransport(app=app), base_url="http://test")
    auditor_client.headers["Authorization"] = f"Bearer {token}"

    try:
        resp = await auditor_client.post(
            f"/api/verification/{verification_id}/verify",
            json={"status": "verified", "findings": "{}"},
        )
        assert resp.status_code == 200, resp.text
        assert resp.json()["verification_status"] == "verified"
    finally:
        await auditor_client.aclose()


@pytest.mark.asyncio
async def test_verification_no_longer_uses_broken_audit_endpoint(client: AsyncClient):
    """Eski /audit/verify endpoint'i (int id, User.full_name AttributeError) kaldırıldı."""
    resp = await client.post("/audit/verify", json={"record_id": 1, "status": "verified"})
    assert resp.status_code == 404
