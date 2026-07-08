"""Auth endpoint testleri."""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register(client: AsyncClient):
    resp = await client.post("/auth/register", json={
        "email": "new@example.com",
        "password": "Pass1234!",
        "name": "Yeni Kullanıcı",
        "company_name": "Yeni Şirket",
        "sector": "retail",
        "employee_count": 100,
    })
    assert resp.status_code == 201
    data = resp.json()
    assert "access_token" in data
    assert data["user"]["email"] == "new@example.com"


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient):
    payload = {
        "email": "dup@example.com",
        "password": "Pass1234!",
        "name": "Kullanıcı",
        "company_name": "Şirket",
    }
    await client.post("/auth/register", json=payload)
    resp = await client.post("/auth/register", json=payload)
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_login(client: AsyncClient):
    await client.post("/auth/register", json={
        "email": "login@example.com",
        "password": "Pass1234!",
        "name": "Login Test",
        "company_name": "Login Şirket",
    })
    resp = await client.post("/auth/login", json={
        "email": "login@example.com",
        "password": "Pass1234!",
    })
    assert resp.status_code == 200
    assert "access_token" in resp.json()


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient):
    resp = await client.post("/auth/login", json={
        "email": "login@example.com",
        "password": "YanlisŞifre",
    })
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_me(auth_client: AsyncClient):
    resp = await auth_client.get("/auth/me")
    assert resp.status_code == 200
    assert resp.json()["email"].endswith("@sustainhub.ai")
