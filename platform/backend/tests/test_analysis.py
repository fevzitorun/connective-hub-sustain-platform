"""
API Testleri: /analysis router'ı (Holding Konsolidasyonu).

Not: Bu dosya eskiden `.github/workflows/test_analysis_router.py` içinde
yanlış yerde duruyordu ve hiç çalıştırılmıyordu (CI sadece `tests/` altına
bakıyor). tsrs-readiness ve generate-report testleri, artık `app/routes/tsrs.py`
ve `app/routes/reports.py`'nin kendi test dosyalarında dolaylı kapsanan
gerçek/auth'lu endpoint'lerle tekrar olduğu için buraya taşınmadı.
"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_estimate_emissions_requires_auth(client: AsyncClient):
    response = await client.post("/analysis/estimate-emissions-by-revenue", json={
        "subsidiaries": [{"name": "Şirket A", "revenue_m_tl": 100, "sector": "imalat"}],
    })
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_estimate_emissions_by_revenue(auth_client: AsyncClient):
    """
    Gelir bazlı emisyon tahmini (EEIO) endpoint'ini test eder.
    POST /analysis/estimate-emissions-by-revenue
    """
    request_data = {
        "subsidiaries": [
            {"name": "Şirket A", "revenue_m_tl": 100, "sector": "imalat"},
            {"name": "Şirket B", "revenue_m_tl": 250, "sector": "enerji", "reported_co2e": 12000},
        ]
    }
    response = await auth_client.post("/analysis/estimate-emissions-by-revenue", json=request_data)
    assert response.status_code == 200, response.text
    data = response.json()
    assert "total_estimated_co2e" in data
    # Sadece Şirket A için tahmin yapılmalı: 100 Milyon TL * 18.5 (imalat faktörü) = 1850
    assert data["total_estimated_co2e"] == 1850.0
    assert len(data["estimated_subsidiaries"]) == 1
    assert data["estimated_subsidiaries"][0]["name"] == "Şirket A"


@pytest.mark.asyncio
async def test_calculate_holding_target_requires_auth(client: AsyncClient):
    response = await client.post("/analysis/calculate-holding-target", json={
        "subsidiaries": [{"name": "A", "sector": "enerji", "base_scope12": 100, "base_scope3": 50}],
    })
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_calculate_holding_target(auth_client: AsyncClient):
    """
    Holding geneli SBTi hedefi hesaplama endpoint'ini test eder.
    POST /analysis/calculate-holding-target
    """
    request_data = {
        "subsidiaries": [
            {"name": "Enerji A.Ş.", "sector": "enerji", "base_scope12": 20000, "base_scope3": 5000},
            {"name": "Finans Bank", "sector": "bankacılık", "base_scope12": 1000, "base_scope3": 30000},
        ],
        "holding_base_year": 2024,
    }
    response = await auth_client.post("/analysis/calculate-holding-target", json=request_data)
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["sector"] == "Holding"
    assert data["base_scope12"] == 21000
    assert data["base_scope3"] == 35000
    assert "sbti_target_path" in data
    assert len(data["sbti_target_path"]) > 0
