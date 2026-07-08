"""Validation engine testleri."""
import pytest
from app.services.validation_engine import validate_emission_data


def test_normal_manufacturing_data():
    data = {
        "electricity_kwh": 500_000,
        "natural_gas_m3": 50_000,
        "diesel_liters": 10_000,
        "waste_tons": 50,
    }
    warnings = validate_emission_data(data, sector="manufacturing", employee_count=100)
    assert len(warnings) == 0


def test_too_low_electricity():
    data = {"electricity_kwh": 100}  # Manufacturing için çok düşük
    warnings = validate_emission_data(data, sector="manufacturing", employee_count=100)
    assert any(w.field == "electricity_kwh" for w in warnings)


def test_too_high_electricity():
    data = {"electricity_kwh": 500_000_000_000}  # Saçma yüksek
    warnings = validate_emission_data(data, sector="manufacturing")
    assert any(w.field == "electricity_kwh" and w.severity == "error" for w in warnings)


def test_per_employee_ratio():
    data = {"electricity_kwh": 10_000}
    # 100 çalışan için 100kWh/çalışan — normalin altında (min 500 kWh/çalışan)
    warnings = validate_emission_data(data, sector="manufacturing", employee_count=100)
    ratio_warnings = [w for w in warnings if w.field == "electricity_kwh"]
    assert len(ratio_warnings) > 0


def test_banking_sector():
    data = {
        "electricity_kwh": 1_000_000,
        "natural_gas_m3": 50_000,
        "business_travel_flight_km": 500_000,
    }
    warnings = validate_emission_data(data, sector="banking", employee_count=1000)
    assert len(warnings) == 0


def test_unknown_sector_falls_back():
    data = {"electricity_kwh": 500_000}
    warnings = validate_emission_data(data, sector="unknown_sector", employee_count=100)
    # manufacturing baseline kullanılır, hata vermemeli
    assert isinstance(warnings, list)


@pytest.mark.asyncio
async def test_validate_endpoint(auth_client):
    resp = await auth_client.post("/validate/emissions", json={
        "electricity_kwh": 500_000,
        "natural_gas_m3": 50_000,
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "warnings" in data
    assert "has_errors" in data
