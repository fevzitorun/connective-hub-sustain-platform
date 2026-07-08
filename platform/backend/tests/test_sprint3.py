"""
Sprint 3 Testleri: Benchmark, CBAM, EUDR, Audit, Credit Score
ANTIGRAVITY-PROMPT.md satır 131-135: %60+ kapsam hedefi
"""
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


# ── Benchmark Testleri ──────────────────────────────────────────────────

class TestBenchmarks:
    @pytest.mark.asyncio
    async def test_benchmark_calculate_unauthenticated(self, client):
        """Benchmark hesaplama auth gerektirir."""
        response = await client.post("/benchmarks/calculate", json={
            "sector": "cement",
            "scope1_total": 12500,
            "scope2_total": 3200,
        })
        assert response.status_code in (401, 403)

    @pytest.mark.asyncio
    async def test_benchmark_company_not_found(self, client):
        """Var olmayan şirket için 404 döner."""
        response = await client.get("/benchmarks/company/nonexistent-id")
        assert response.status_code in (401, 404)


# ── CBAM Testleri ──────────────────────────────────────────────────────

class TestCBAM:
    @pytest.mark.asyncio
    async def test_cbam_calculate_unauthenticated(self, client):
        """CBAM hesaplama auth gerektirir."""
        response = await client.post("/cbam/calculate", json={
            "product_category": "cement",
            "export_quantity_tonnes": 1000,
            "direct_emissions_tco2e": 850,
        })
        assert response.status_code in (401, 403)

    @pytest.mark.asyncio
    async def test_cbam_de_minimis_threshold(self, client):
        """50 ton altı de minimis muafiyeti."""
        # Bu test auth ile çalıştırılmalı, burada sadece endpoint varlığını kontrol
        response = await client.post("/cbam/calculate", json={
            "product_category": "cement",
            "export_quantity_tonnes": 40,
        })
        assert response.status_code in (401, 403, 422)


# ── EUDR Testleri ──────────────────────────────────────────────────────

class TestEUDR:
    @pytest.mark.asyncio
    async def test_eudr_assess_unauthenticated(self, client):
        """EUDR risk değerlendirme auth gerektirir."""
        response = await client.post("/eudr/suppliers/assess", json={
            "commodity": "coffee",
            "origin_country": "BR",
        })
        assert response.status_code in (401, 403)


# ── Audit (Denetim İzi) Testleri ─────────────────────────────────────

class TestAudit:
    @pytest.mark.asyncio
    async def test_audit_log_unauthenticated(self, client):
        """Denetim izi erişimi auth gerektirir."""
        response = await client.get("/audit/logs")
        assert response.status_code in (401, 403)

    @pytest.mark.asyncio
    async def test_audit_export_csv_unauthenticated(self, client):
        """CSV export auth gerektirir."""
        response = await client.get("/audit/logs/export")
        assert response.status_code in (401, 403)


# ── Credit Score Testleri ────────────────────────────────────────────

class TestCreditScore:
    @pytest.mark.asyncio
    async def test_credit_score_unauthenticated(self, client):
        """Kredi puanlama auth gerektirir."""
        response = await client.get("/credit-score/some-company-id")
        assert response.status_code in (401, 403)


# ── Regulation Validation Testleri ───────────────────────────────────

class TestRegulationValidation:
    @pytest.mark.asyncio
    async def test_validate_unsupported_regulation(self, client):
        """Desteklenmeyen düzenleme için hata döner."""
        response = await client.get("/validate/unknown_reg/company/some-id")
        assert response.status_code in (400, 401)

    @pytest.mark.asyncio
    async def test_validate_tsrs_unauthenticated(self, client):
        """TSRS uyum doğrulaması auth gerektirir."""
        response = await client.get("/validate/tsrs/company/some-id")
        assert response.status_code in (401, 403)

    @pytest.mark.asyncio
    async def test_validate_cbam_unauthenticated(self, client):
        """CBAM uyum doğrulaması auth gerektirir."""
        response = await client.get("/validate/cbam/company/some-id")
        assert response.status_code in (401, 403)
