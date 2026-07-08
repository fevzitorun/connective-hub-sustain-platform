"""Satellite coordinate analysis API tests."""
import pytest
from app.services.satellite_service import find_nearest_city

def test_nearest_city_resolution():
    # Coords near Adana (37.000, 35.321)
    city_adana = find_nearest_city(37.05, 35.30)
    assert city_adana == "adana"

    # Coords near London (51.507, -0.128)
    city_london = find_nearest_city(51.51, -0.12)
    assert city_london == "london"

    # Coords near Izmir (38.423, 27.143)
    city_izmir = find_nearest_city(38.40, 27.15)
    assert city_izmir == "izmir"


@pytest.mark.asyncio
async def test_satellite_cities_endpoint(auth_client):
    resp = await auth_client.get("/satellite/cities")
    assert resp.status_code == 200
    data = resp.json()
    assert "cities" in data
    assert "istanbul" in data["cities"]


@pytest.mark.asyncio
async def test_analyze_coordinates_endpoint(auth_client):
    payload = {
        "lat": 37.001,
        "lng": 35.322,
        "facility_name": "Adana Solar Farm"
    }
    resp = await auth_client.post("/satellite/analyze-coordinates", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["lat"] == 37.001
    assert data["lng"] == 35.322
    assert data["facility_name"] == "Adana Solar Farm"
    assert data["city"] == "adana"
    
    # Verify Sentinel-2 fields
    assert "sentinel_tile_id" in data
    assert "cloud_cover_pct" in data
    assert "band_red" in data
    assert "band_nir" in data
    assert "band_green" in data
    assert "deforestation_status" in data
    assert "acquisition_date" in data
