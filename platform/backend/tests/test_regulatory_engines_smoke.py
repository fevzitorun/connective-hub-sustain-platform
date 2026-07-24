"""
Regülasyon-kritik motorlar için "smoke" testleri.

Amaç: derin regülasyon-doğruluğu değil, motorun çökmediğini ve mantıklı
şekilde biçimlendirilmiş bir sonuç ürettiğini doğrulamak. Önceki durumda
CBAM, TCFD, GRI, ISSB, SBTi, Water/ESRS motorlarının HİÇBİRİ test altında
değildi — bu platformun temel değer önerisinin dayandığı motorlar.

Not: Bazı endpoint'ler (GRI/ISSB/SBTi/Water-ESRS /assess) kasıtlı olarak
auth istemiyor — halka açık pazarlama/lead-gen hesaplayıcıları olarak
tasarlanmış (TCFD'nin ayrı bir /demo endpoint'i olması gibi). Bu davranış
değiştirilmedi, sadece mevcut haliyle test edildi.
"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_cbam_calculate_requires_auth(client: AsyncClient):
    resp = await client.post("/cbam/calculate", json={
        "sector": "çimento", "goods_tons": 1000,
    })
    assert resp.status_code in (401, 403)


@pytest.mark.asyncio
async def test_cbam_calculate_happy_path(auth_client: AsyncClient):
    resp = await auth_client.post("/cbam/calculate", json={
        "sector": "çimento", "goods_tons": 1000,
    })
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["sector"] == "çimento"
    assert data["embedded_co2_total"] > 0
    assert data["cbam_duty_eur"] > 0
    assert len(data["cn_codes"]) > 0


@pytest.mark.asyncio
async def test_cbam_calculate_unsupported_sector(auth_client: AsyncClient):
    resp = await auth_client.post("/cbam/calculate", json={
        "sector": "uzay-turizmi", "goods_tons": 10,
    })
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_tcfd_scenarios_requires_auth(client: AsyncClient):
    resp = await client.post("/tcfd/scenarios", json={
        "sector": "enerji", "annual_revenue_eur": 10_000_000, "total_co2e": 5000,
    })
    assert resp.status_code in (401, 403)


@pytest.mark.asyncio
async def test_tcfd_scenarios_happy_path(auth_client: AsyncClient):
    resp = await auth_client.post("/tcfd/scenarios", json={
        "sector": "enerji", "annual_revenue_eur": 10_000_000, "total_co2e": 5000,
    })
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["sector"] == "enerji"
    assert len(data["scenarios"]) > 0


@pytest.mark.asyncio
async def test_gri_assess_happy_path(client: AsyncClient):
    """Auth gerektirmez — kasıtlı olarak halka açık hesaplayıcı."""
    resp = await client.post("/api/gri/assess", json={
        "completed_ids": ["102-1", "102-2", "305-1"], "maturity_score": 60,
    })
    assert resp.status_code == 200, resp.text
    assert "score" in resp.json() or "completeness" in resp.json() or len(resp.json()) > 0


@pytest.mark.asyncio
async def test_issb_assess_happy_path(client: AsyncClient):
    resp = await client.post("/issb/assess", json={
        "company_name": "Test A.Ş.", "sector": "imalat",
        "scope1_tco2e": 1000, "scope2_tco2e": 2000, "scope3_tco2e": 15000,
    })
    assert resp.status_code == 200, resp.text
    assert len(resp.json()) > 0


@pytest.mark.asyncio
async def test_sbti_assess_happy_path(client: AsyncClient):
    resp = await client.post("/api/sbti/assess", json={
        "company_name": "Test A.Ş.", "sector": "tekstil",
        "base_year": 2021, "total_emissions_tco2e": 10000,
        "current_annual_reduction_pct": 2.0, "commitment_stage": "committed",
    })
    assert resp.status_code == 200, resp.text
    assert len(resp.json()) > 0


@pytest.mark.asyncio
async def test_sbti_temperature_alignment(client: AsyncClient):
    resp = await client.post("/api/sbti/temperature-alignment", json={
        "current_emissions_tco2e": 10000, "reduction_rate_pct_per_year": 4.2,
    })
    assert resp.status_code == 200, resp.text


@pytest.mark.asyncio
async def test_water_esrs_assess_happy_path(client: AsyncClient):
    resp = await client.post("/water-esrs/assess", json={
        "company_name": "Test A.Ş.", "sector": "tekstil",
        "water_withdrawal_m3": 50000, "water_consumed_m3": 12000,
    })
    assert resp.status_code == 200, resp.text
    assert len(resp.json()) > 0


@pytest.mark.asyncio
async def test_tsrs_assess_happy_path(client: AsyncClient):
    resp = await client.post("/tsrs/assess", json={
        "company_name": "Test A.Ş.", "segment": "BİST-100",
        "pillar_scores": {"yonetisim": 70, "strateji": 60, "risk_yonetimi": 65, "metrikler_hedefler": 55},
        "checklist_done": ["k1", "k2", "k3"],
        "scope1_tco2e": 100, "scope2_tco2e": 200, "scope3_tco2e": 1500,
    })
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert "overall_score" in data
    assert data["ghg_summary"]["total"] == 1800


@pytest.mark.asyncio
async def test_csrd_materiality_assess_requires_auth(client: AsyncClient):
    resp = await client.post("/materiality/assess", json={})
    assert resp.status_code in (401, 403)


@pytest.mark.asyncio
async def test_csrd_materiality_assess_happy_path(auth_client: AsyncClient):
    resp = await auth_client.post("/materiality/assess", json={})
    assert resp.status_code == 200, resp.text
    assert len(resp.json()) > 0


def test_calculate_tsrs_compliance_returns_checks_regression():
    """
    Regresyon testi: calculate_tsrs_compliance() önceden 'checks' anahtarını
    döndürmüyordu (app/services/calculation_engine.py), bu yüzden
    TsrsChecksResult(**compliance) her seferinde ValidationError fırlatıp
    AI rapor üretimini "failed" statüsüne düşürüyordu. Bu test bunun
    yeniden olmasını engeller.
    """
    from app.services.calculation_engine import calculate_tsrs_compliance
    from app.routes.report_detail import TsrsChecksResult

    result = calculate_tsrs_compliance({
        "scope1_co2e": 100, "scope2_location": 200, "scope2_market": 190,
        "has_scope3_analysis": True, "has_board_oversight": True,
    })
    assert "checks" in result
    assert isinstance(result["checks"], dict)
    assert len(result["checks"]) > 0

    # Asıl regresyon: bu satır önceden ValidationError fırlatıyordu.
    parsed = TsrsChecksResult(**result)
    assert parsed.checks == result["checks"]
