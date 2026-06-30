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
    
    assert "Sabit Yanma (Doğalgaz)" in result.breakdown["Kapsam 1 (Doğrudan)"]
    assert "Mobil Yanma (Şirket Araçları)" in result.breakdown["Kapsam 1 (Doğrudan)"]
    assert "Kaçak Emisyonlar (Soğutma/Klima)" in result.breakdown["Kapsam 1 (Doğrudan)"]

def test_iso14064_scope2_calculation():
    input_data = EmissionInput(
        company_id="test",
        year=2024,
        electricity_kwh=10000
    )
    result = calculate_iso14064(input_data)
    
    assert result.scope2_location_co2e > 0
    assert "Şebeke Elektriği (TEİAŞ)" in result.breakdown["Kapsam 2 (Enerji Dolaylı)"]

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
    
    assert "İş Seyahatleri (Uçuş)" in result.breakdown["Kapsam 3 (Diğer Dolaylı)"]
    assert "Atık (Düzenli Depolama)" in result.breakdown["Kapsam 3 (Diğer Dolaylı)"]
    assert result.breakdown["Kapsam 3 (Diğer Dolaylı)"]["Finansal Yatırımlar (Kategori 15)"] == 10.0
