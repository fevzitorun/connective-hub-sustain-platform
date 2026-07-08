"""Draft/Otomatik Kaydetme testleri."""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_save_draft(auth_client: AsyncClient):
    resp = await auth_client.post("/drafts/save", json={
        "content": {"step": 1, "data": {"year": 2024}},
        "notes": "İlk taslak",
    })
    assert resp.status_code == 200
    assert "id" in resp.json()
    assert "updated_at" in resp.json()


@pytest.mark.asyncio
async def test_get_latest_draft(auth_client: AsyncClient):
    # Önce kaydet
    await auth_client.post("/drafts/save", json={
        "content": {"step": 2, "data": {"electricity_kwh": 500000}},
    })
    resp = await auth_client.get("/drafts/latest")
    assert resp.status_code == 200
    data = resp.json()
    assert data["content"]["step"] == 2


@pytest.mark.asyncio
async def test_update_existing_draft(auth_client: AsyncClient):
    await auth_client.post("/drafts/save", json={"content": {"step": 1}})
    await auth_client.post("/drafts/save", json={"content": {"step": 3, "updated": True}})

    resp = await auth_client.get("/drafts/latest")
    assert resp.json()["content"]["step"] == 3
    assert resp.json()["content"]["updated"] is True
