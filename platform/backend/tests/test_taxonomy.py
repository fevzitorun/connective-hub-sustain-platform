"""
EU Taxonomy kalıcılık testleri (/api/taxonomy/...).

Önceden: /calculate sonucu DB'ye hiç kaydedilmiyordu (TODO yorumu), /company/{id}
ve /report/{id} kasıtlı olarak 501 döndürüyordu, hiçbiri auth istemiyordu.
"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_calculate_requires_auth(client: AsyncClient):
    response = await client.post("/api/taxonomy/calculate", json={
        "company_id": "ignored", "year": 2024, "nace_code": "C24",
    })
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_calculate_persists_and_ignores_body_company_id(auth_client: AsyncClient):
    """company_id body'den değil, doğrulanmış kullanıcının şirketinden alınmalı (tenant güvenliği)."""
    response = await auth_client.post("/api/taxonomy/calculate", json={
        "company_id": "baska-bir-sirketin-id-si",
        "year": 2024,
        "nace_code": "C24",
        "revenue_eur": 1000000,
        "capex_eur": 100000,
        "opex_eur": 50000,
    })
    assert response.status_code == 200, response.text
    data = response.json()
    me = await auth_client.get("/auth/me")
    assert data["company_id"] == me.json()["company_id"]
    assert data["company_id"] != "baska-bir-sirketin-id-si"


@pytest.mark.asyncio
async def test_company_results_404_before_calculate(auth_client: AsyncClient):
    me = await auth_client.get("/auth/me")
    company_id = me.json()["company_id"]
    resp = await auth_client.get(f"/api/taxonomy/company/{company_id}")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_company_results_after_calculate(auth_client: AsyncClient):
    me = await auth_client.get("/auth/me")
    company_id = me.json()["company_id"]

    calc = await auth_client.post("/api/taxonomy/calculate", json={
        "company_id": company_id, "year": 2024, "nace_code": "C24",
        "revenue_eur": 1000000, "capex_eur": 100000, "opex_eur": 50000,
    })
    assert calc.status_code == 200

    resp = await auth_client.get(f"/api/taxonomy/company/{company_id}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["year"] == 2024
    assert data["company_id"] == company_id


@pytest.mark.asyncio
async def test_company_results_other_tenant_forbidden(auth_client: AsyncClient):
    """Farklı bir şirketin ID'siyle sorgulamak 403 dönmeli (verify_tenant)."""
    resp = await auth_client.get("/api/taxonomy/company/baska-sirket-id")
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_report_summary_before_calculate_404(auth_client: AsyncClient):
    me = await auth_client.get("/auth/me")
    company_id = me.json()["company_id"]
    resp = await auth_client.post(f"/api/taxonomy/report/{company_id}", params={"year": 2030})
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_report_summary_after_calculate(auth_client: AsyncClient):
    me = await auth_client.get("/auth/me")
    company_id = me.json()["company_id"]

    await auth_client.post("/api/taxonomy/calculate", json={
        "company_id": company_id, "year": 2025, "nace_code": "C24",
        "revenue_eur": 2000000, "capex_eur": 200000, "opex_eur": 100000,
    })

    resp = await auth_client.post(f"/api/taxonomy/report/{company_id}", params={"year": 2025})
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["year"] == 2025
    assert "summary" in data and data["summary"]


@pytest.mark.asyncio
async def test_calculate_upserts_same_year(auth_client: AsyncClient):
    """Aynı yıl için tekrar hesaplama yeni satır değil, güncelleme yapmalı."""
    me = await auth_client.get("/auth/me")
    company_id = me.json()["company_id"]

    first = await auth_client.post("/api/taxonomy/calculate", json={
        "company_id": company_id, "year": 2026, "nace_code": "C24",
        "revenue_eur": 1000000, "capex_eur": 100000, "opex_eur": 50000,
    })
    assert first.status_code == 200

    second = await auth_client.post("/api/taxonomy/calculate", json={
        "company_id": company_id, "year": 2026, "nace_code": "A01",
        "revenue_eur": 1000000, "capex_eur": 100000, "opex_eur": 50000,
    })
    assert second.status_code == 200

    resp = await auth_client.get(f"/api/taxonomy/company/{company_id}", params={"year": 2026})
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_nace_lookup_unknown_code_404(client: AsyncClient):
    resp = await client.get("/api/taxonomy/nace/ZZ99")
    assert resp.status_code == 404
