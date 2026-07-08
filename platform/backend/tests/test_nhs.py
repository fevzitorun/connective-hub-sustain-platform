"""UK NHS PPN 06/21 Compliance and Carbon Reduction Plan tests."""
import pytest
from app.services.nhs_service import analyze_ppn_compliance, generate_crp_html

def test_ppn_compliance_success():
    # Fully populated emission record
    emissions = {
        "scope1_co2e": 120.0,
        "scope2_location_co2e": 65.0,
        "purchased_goods_spend_tl": 50000.0,
        "waste_tons": 5.4,
        "business_travel_flight_km": 12000.0,
        "employee_commute_km": 25000.0,
        "downstream_transport_co2e": 18.9,
        "year": 2024
    }

    res = analyze_ppn_compliance(emissions, company_name="Yildiz Tekstil")
    assert res["compliant"] is True
    assert res["overall_score"] == 100
    assert len(res["gaps"]) == 0
    assert res["net_zero_target_year"] == 2040
    assert res["emissions"]["total"]["current"] > 0


def test_ppn_compliance_missing_fields():
    # Missing employee commute and waste ops
    emissions = {
        "scope1_co2e": 120.0,
        "scope2_location_co2e": 65.0,
        "purchased_goods_spend_tl": 50000.0,
        "waste_tons": 0.0, # Gap
        "business_travel_flight_km": 12000.0,
        "employee_commute_km": 0.0, # Gap
        "year": 2024
    }
    
    res = analyze_ppn_compliance(emissions, company_name="Yildiz Tekstil")
    assert res["compliant"] is False
    assert res["overall_score"] < 100
    assert len(res["gaps"]) == 2  # 2 gaps detected
    assert "Kategori 5" in res["gaps"][0] or "Kategori 7" in res["gaps"][0]


def test_crp_html_generation():
    emissions = {
        "scope1_co2e": 120.0,
        "scope2_location_co2e": 65.0,
        "purchased_goods_spend_tl": 50000.0,
        "waste_tons": 5.4,
        "business_travel_flight_km": 12000.0,
        "employee_commute_km": 25000.0,
        "year": 2024
    }
    res = analyze_ppn_compliance(emissions, company_name="Yildiz Tekstil")
    html = generate_crp_html(res, ["LED lighting upgrade"])
    
    assert "Carbon Reduction Plan" in html
    assert "Yildiz Tekstil" in html
    assert "LED lighting upgrade" in html
    assert "Baseline Emissions Footprint" in html
    assert "Declaration and Sign-Off" in html


@pytest.mark.asyncio
async def test_nhs_routes(auth_client):
    # Fetch reports list to get a valid company ID
    list_resp = await auth_client.get("/reports")
    assert list_resp.status_code == 200
    reports = list_resp.json()
    
    if len(reports) > 0:
        company_id = reports[0]["company_id"]
        
        # Test Assess endpoint
        assess_resp = await auth_client.post("/nhs/assess", json={"company_id": company_id, "year": 2024})
        assert assess_resp.status_code == 200
        data = assess_resp.json()
        assert "result" in data
        assert "compliant" in data["result"]
        
        # Test Generate CRP endpoint
        gen_resp = await auth_client.post("/nhs/generate-crp", json={
            "company_id": company_id,
            "year": 2024,
            "selected_actions": ["Procure renewable energy via UK Green Tariffs"]
        })
        assert gen_resp.status_code == 200
        gen_data = gen_resp.json()
        assert "html" in gen_data
        assert "Carbon Reduction Plan" in gen_data["html"]
