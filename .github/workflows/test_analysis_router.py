"""
API Testleri: /analysis router'ı.
Bu testler, analiz ve raporlama motorlarımızı ortaya çıkaran API endpoint'lerinin
doğru çalıştığını doğrular.
"""
from fastapi.testclient import TestClient
import pytest
from unittest.mock import patch

# Gerçek app objesini import etmemiz gerekiyor.
# Proje yapısına göre bu import yolu değişebilir.
# Varsayım: app/main.py içinde 'app' adında bir FastAPI instance var.
from app.main import app

client = TestClient(app)


def test_get_tsrs_readiness_assessment():
    """
    TSRS hazırlık değerlendirme endpoint'ini test eder.
    POST /analysis/tsrs-readiness
    """
    request_data = {
        "company_name": "Test A.Ş.",
        "segment": "BİST-100",
        "pillar_scores": {"yonetisim": 80, "strateji": 70, "risk_yonetimi": 65, "metrikler_hedefler": 60},
        "checklist_done": ["k1", "k2", "k3", "k4", "k7", "k9", "k10"],
        "scope1_tco2e": 100,
        "scope2_tco2e": 200,
        "scope3_tco2e": 1500,
        "scenarios_count": 2,
        "has_target": True,
    }
    response = client.post("/analysis/tsrs-readiness", json=request_data)
    assert response.status_code == 200
    data = response.json()
    assert data["company_name"] == "Test A.Ş."
    assert data["overall_score"] > 0
    assert "readiness_label" in data
    assert "ghg_summary" in data
    assert data["ghg_summary"]["total"] == 1800


def test_estimate_emissions_by_revenue():
    """
    Gelir bazlı emisyon tahmini (EEIO) endpoint'ini test eder.
    POST /analysis/estimate-emissions-by-revenue
    """
    request_data = {
        "subsidiaries": [
            {"name": "Şirket A", "revenue_m_tl": 100, "sector": "imalat"},
            {"name": "Şirket B", "revenue_m_tl": 250, "sector": "enerji", "reported_co2e": 12000}
        ]
    }
    response = client.post("/analysis/estimate-emissions-by-revenue", json=request_data)
    assert response.status_code == 200
    data = response.json()
    assert "total_estimated_co2e" in data
    # Sadece Şirket A için tahmin yapılmalı: 100 Milyon TL * 18.5 (imalat faktörü) = 1850
    assert data["total_estimated_co2e"] == 1850.0
    assert len(data["estimated_subsidiaries"]) == 1
    assert data["estimated_subsidiaries"][0]["name"] == "Şirket A"


def test_calculate_holding_target():
    """
    Holding geneli SBTi hedefi hesaplama endpoint'ini test eder.
    POST /analysis/calculate-holding-target
    """
    request_data = {
        "subsidiaries": [
            {"name": "Enerji A.Ş.", "sector": "enerji", "base_scope12": 20000, "base_scope3": 5000},
            {"name": "Finans Bank", "sector": "bankacılık", "base_scope12": 1000, "base_scope3": 30000}
        ],
        "holding_base_year": 2024
    }
    response = client.post("/analysis/calculate-holding-target", json=request_data)
    assert response.status_code == 200
    data = response.json()
    assert data["sector"] == "Holding"
    assert data["base_scope12"] == 21000
    assert data["base_scope3"] == 35000
    assert "sbti_target_path" in data
    assert len(data["sbti_target_path"]) > 0


@patch("app.services.ai_report_writer.generate_tsrs_report")
def test_generate_report_endpoint(mock_generate_report):
    """
    AI rapor oluşturma endpoint'ini test eder.
    POST /analysis/generate-report
    """
    # AI çağrısını mock'layarak gerçek bir API çağrısı yapmadan test ediyoruz.
    mock_generate_report.return_value = ("Mock Rapor Metni", {"input_tokens": 100, "output_tokens": 200})

    request_data = {"company_name": "AI Test Corp", "sector": "teknoloji", "year": 2024}
    response = client.post("/analysis/generate-report", json=request_data)

    assert response.status_code == 200
    data = response.json()
    assert data["report"] == "Mock Rapor Metni"
    assert data["usage"]["output_tokens"] == 200
    mock_generate_report.assert_called_once_with(**request_data)