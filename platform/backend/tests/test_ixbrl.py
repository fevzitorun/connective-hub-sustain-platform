"""iXBRL Validator service and route tests."""
import pytest
from datetime import datetime, timezone
from app.services.ixbrl_validator import validate_ixbrl_report

def test_ixbrl_validation_success():
    report_data = {
        "company_name": "Simora Carbon",
        "assurance_firm": "PwC",
        "approved_at": datetime.now(timezone.utc),
        "approved_by_name": "Kemal Yilmaz"
    }
    emission_data = {
        "scope1_co2e": 1200.0,
        "scope2_location_co2e": 450.0,
        "electricity_kwh": 500000.0,
        "water_consumption_m3": 15000.0,
        "year": 2024
    }
    
    res = validate_ixbrl_report(report_data, emission_data)
    assert res["valid"] is True
    assert len(res["errors"]) == 0
    assert res["digital_signature"]["signed"] is True
    assert len(res["tags_found"]) == 8  # 8 mandatory tags present


def test_ixbrl_validation_missing_tags():
    # Missing emissions and water details
    report_data = {
        "company_name": "Simora Carbon",
        "assurance_firm": None,
        "approved_at": None,
        "approved_by_name": None
    }
    emission_data = None
    
    res = validate_ixbrl_report(report_data, emission_data)
    assert res["valid"] is False
    assert len(res["errors"]) > 0  # Missing mandatory tags should trigger errors
    assert res["digital_signature"]["signed"] is False  # Missing approval
    assert len(res["warnings"]) > 0  # Missing signature warning


@pytest.mark.asyncio
async def test_validate_ixbrl_endpoint(auth_client):
    # Retrieve reports list to get a valid report ID
    list_resp = await auth_client.get("/reports")
    assert list_resp.status_code == 200
    reports = list_resp.json()
    
    if len(reports) > 0:
        report_id = reports[0]["id"]
        val_resp = await auth_client.post(f"/reports/{report_id}/validate-ixbrl")
        assert val_resp.status_code == 200
        val_data = val_resp.json()
        assert "valid" in val_data
        assert "digital_signature" in val_data
        assert "tags_found" in val_data
