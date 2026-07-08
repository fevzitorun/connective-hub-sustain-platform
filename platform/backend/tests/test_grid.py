"""Sustain Grid+ Energy Management tests."""
import pytest
from app.services.grid_service import generate_live_meter_reading, calculate_energy_efficiency

def test_live_meter_reading():
    res = generate_live_meter_reading("comp_123")
    assert "voltages" in res
    assert "currents" in res
    assert "active_power_kw" in res
    assert "cumulative_kwh" in res
    assert res["active_power_kw"] > 0
    assert res["power_factor"] >= 0.7 and res["power_factor"] <= 1.0


def test_energy_efficiency():
    # TR Grid factor
    res_tr = calculate_energy_efficiency(100000.0, "TR")
    assert res_tr["efficiency_score"] > 0
    assert res_tr["grid_factor_applied"] == 0.4166
    assert res_tr["carbon_equivalent_tco2e"] == 41.66
    assert len(res_tr["recommendations"]) > 0

    # UK Grid factor
    res_uk = calculate_energy_efficiency(100000.0, "UK")
    assert res_uk["grid_factor_applied"] == 0.2117
    assert res_uk["carbon_equivalent_tco2e"] == 21.17


@pytest.mark.asyncio
async def test_grid_routes(auth_client):
    # Fetch reports list to get a valid company ID
    list_resp = await auth_client.get("/reports")
    assert list_resp.status_code == 200
    reports = list_resp.json()
    
    if len(reports) > 0:
        company_id = reports[0]["company_id"]
        
        # Test Live Meter
        meter_resp = await auth_client.get(f"/grid/live-meter?company_id={company_id}")
        assert meter_resp.status_code == 200
        meter_data = meter_resp.json()
        assert "cumulative_kwh" in meter_data
        
        # Test Efficiency Analysis
        eff_resp = await auth_client.get(f"/grid/efficiency?company_id={company_id}")
        assert eff_resp.status_code == 200
        eff_data = eff_resp.json()
        assert "analysis" in eff_data
        assert "efficiency_score" in eff_data["analysis"]
        
        # Test Sync to Emissions
        sync_resp = await auth_client.post("/grid/sync-to-emissions", json={
            "company_id": company_id,
            "year": 2024,
            "cumulative_kwh": 250000.0
        })
        assert sync_resp.status_code == 200
        sync_data = sync_resp.json()
        assert sync_data["success"] is True
        assert sync_data["electricity_kwh"] == 250000.0
        assert sync_data["emissions_tco2e"] > 0
