import pytest
from app.services.calculation_engine import calculate_iso14064, EmissionInput

def test_iso14064_scope1_calculation():
    input_data = EmissionInput(
        company_id="test",
        year=2024,
        natural_gas_m3=1000,
        diesel_liters=500,
        lpg_kg=200,
        coal_tons=10,
        company_vehicles_km=10000,
        fugitive_emissions_kg=5
    )
    result = calculate_iso14064(input_data)

    assert "Doğalgaz" in result.breakdown["1. Doğrudan Emisyonlar (Kapsam 1)"]
    assert "Şirket araçları" in result.breakdown["1. Doğrudan Emisyonlar (Kapsam 1)"]
    assert "Kaçak Emisyonlar" in result.breakdown["1. Doğrudan Emisyonlar (Kapsam 1)"]

def test_iso14064_scope2_calculation():
    input_data = EmissionInput(
        company_id="test",
        year=2024,
        electricity_kwh=10000
    )
    result = calculate_iso14064(input_data)
    
    assert result.scope2_location_co2e > 0
    assert "Satın Alınan Elektrik" in result.breakdown["2. Enerji Dolaylı Emisyonlar (Kapsam 2)"]

def test_iso14064_scope3_calculation():
    input_data = EmissionInput(
        company_id="test",
        year=2024,
        business_travel_flight_km=5000,
        employee_commute_km=2000,
        waste_tons=5,
        financed_emissions_co2e=10
    )
    result = calculate_iso14064(input_data)
    
    assert "İş seyahati (uçuş)" in result.breakdown["3. Diğer Dolaylı Emisyonlar (Kapsam 3)"]
    assert "Atık" in result.breakdown["3. Diğer Dolaylı Emisyonlar (Kapsam 3)"]
    assert result.breakdown["3. Diğer Dolaylı Emisyonlar (Kapsam 3)"]["Finanse edilmiş emisyonlar (PCAF)"] == 10.0
