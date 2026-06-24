"""
Uydu & İklim Risk Servisi.
- NASA EARTHDATA Power API (ücretsiz, key gerektirmez)
- AFAD Türkiye deprem/sel risk bölgeleri (statik veri)
- Copernicus EFAS sel riski (mock — kayıt gerektirir)
"""
import httpx
from typing import Optional
from dataclasses import dataclass

# AFAD Türkiye Deprem Bölgeleri (2018 TBDY)
_TURKEY_EARTHQUAKE_ZONES: dict[str, dict] = {
    "istanbul":    {"zone": 1, "pga_g": 0.40, "risk": "Çok Yüksek"},
    "izmir":       {"zone": 1, "pga_g": 0.45, "risk": "Çok Yüksek"},
    "kocaeli":     {"zone": 1, "pga_g": 0.42, "risk": "Çok Yüksek"},
    "zurich":      {"zone": 4, "pga_g": 0.05, "risk": "Çok Düşük"},
    "sakarya":     {"zone": 1, "pga_g": 0.38, "risk": "Çok Yüksek"},
    "bolu":        {"zone": 1, "pga_g": 0.35, "risk": "Yüksek"},
    "bursa":       {"zone": 2, "pga_g": 0.30, "risk": "Yüksek"},
    "ankara":      {"zone": 2, "pga_g": 0.20, "risk": "Orta"},
    "antalya":     {"zone": 2, "pga_g": 0.25, "risk": "Orta-Yüksek"},
    "adana":       {"zone": 2, "pga_g": 0.28, "risk": "Yüksek"},
    "konya":       {"zone": 3, "pga_g": 0.12, "risk": "Düşük"},
    "samsun":      {"zone": 2, "pga_g": 0.22, "risk": "Orta"},
    "trabzon":     {"zone": 2, "pga_g": 0.20, "risk": "Orta"},
    "van":         {"zone": 1, "pga_g": 0.50, "risk": "Çok Yüksek"},
    "erzurum":     {"zone": 1, "pga_g": 0.38, "risk": "Çok Yüksek"},
    "default":     {"zone": 2, "pga_g": 0.25, "risk": "Orta"},
}

# Türkiye sel risk bölgeleri (DSİ verisinden)
_TURKEY_FLOOD_RISK: dict[str, str] = {
    "istanbul": "Orta",
    "antalya": "Yüksek",
    "trabzon": "Çok Yüksek",
    "rize": "Çok Yüksek",
    "samsun": "Yüksek",
    "ordu": "Yüksek",
    "kocaeli": "Orta",
    "zurich": "Düşük",
    "ankara": "Düşük",
    "konya": "Düşük",
    "izmir": "Orta",
    "bursa": "Orta",
    "default": "Orta",
}

NASA_POWER_BASE = "https://power.larc.nasa.gov/api/temporal/monthly/point"


@dataclass
class SatelliteRisk:
    lat: float
    lng: float
    city: str
    # Deprem
    earthquake_zone: int
    earthquake_risk: str
    pga_g: float
    # Sel
    flood_risk: str
    # Kuraklık (NASA'dan hesaplanan)
    drought_risk: str
    drought_score: float     # 0-100 (yüksek = kurak)
    # NASA iklim verileri
    temperature_c: float
    precipitation_mm: float
    solar_radiation_kwh_m2: float
    ndvi_proxy: float        # 0-1 (NASA yüzey yansıması proxy)
    # Genel
    physical_risk_score: float   # 0-100 (düşük = az riskli)
    data_source: str


async def get_satellite_risk(
    lat: float,
    lng: float,
    city: str = "default",
    year: int = 2024,
) -> SatelliteRisk:
    """NASA Power API'yi çağır, AFAD verileriyle birleştir."""
    city_lower = city.lower()
    eq_data = _TURKEY_EARTHQUAKE_ZONES.get(city_lower, _TURKEY_EARTHQUAKE_ZONES["default"])
    flood_risk = _TURKEY_FLOOD_RISK.get(city_lower, _TURKEY_FLOOD_RISK["default"])

    # NASA Power API çağrısı (gerçek veri)
    temp_c = 14.5
    precip_mm = 65.0
    solar_kwh = 4.8
    data_source = "AFAD + NASA POWER (gerçek)"

    try:
        params = {
            "parameters": "T2M,PRECTOTCORR,ALLSKY_SFC_SW_DWN",
            "community": "RE",
            "longitude": lng,
            "latitude": lat,
            "start": f"{year}01",
            "end": f"{year}12",
            "format": "JSON",
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(NASA_POWER_BASE, params=params)
            if resp.status_code == 200:
                data = resp.json()
                props = data.get("properties", {}).get("parameter", {})
                # Yıllık ortalama sıcaklık
                t2m = props.get("T2M", {})
                if t2m:
                    vals = [v for v in t2m.values() if isinstance(v, (int, float)) and v > -999]
                    temp_c = round(sum(vals) / len(vals), 1) if vals else temp_c
                # Toplam yıllık yağış
                prec = props.get("PRECTOTCORR", {})
                if prec:
                    vals = [v for v in prec.values() if isinstance(v, (int, float)) and v >= 0]
                    precip_mm = round(sum(vals), 1) if vals else precip_mm
                # Güneş radyasyonu (aylık ort.)
                solar = props.get("ALLSKY_SFC_SW_DWN", {})
                if solar:
                    vals = [v for v in solar.values() if isinstance(v, (int, float)) and v >= 0]
                    solar_kwh = round(sum(vals) / len(vals), 2) if vals else solar_kwh
    except Exception:
        data_source = "AFAD + NASA POWER (fallback)"

    # Kuraklık risk skoru: yüksek sıcaklık + düşük yağış → kuraklık
    drought_score = min(100.0, max(0.0, (temp_c / 25 * 50) + max(0, (500 - precip_mm * 12) / 500 * 50)))
    if drought_score >= 70:
        drought_risk = "Yüksek"
    elif drought_score >= 40:
        drought_risk = "Orta"
    else:
        drought_risk = "Düşük"

    # NDVI proxy: daha yağışlı → daha yeşil
    ndvi_proxy = min(0.9, max(0.1, precip_mm * 12 / 1000))

    # Genel fiziksel risk skoru
    eq_score = eq_data["pga_g"] * 100
    flood_map = {"Çok Yüksek": 80, "Yüksek": 60, "Orta": 40, "Düşük": 20}
    flood_score = flood_map.get(flood_risk, 40)
    physical_risk_score = round((eq_score * 0.4 + flood_score * 0.35 + drought_score * 0.25), 1)

    return SatelliteRisk(
        lat=lat,
        lng=lng,
        city=city,
        earthquake_zone=eq_data["zone"],
        earthquake_risk=eq_data["risk"],
        pga_g=eq_data["pga_g"],
        flood_risk=flood_risk,
        drought_risk=drought_risk,
        drought_score=round(drought_score, 1),
        temperature_c=temp_c,
        precipitation_mm=precip_mm,
        solar_radiation_kwh_m2=solar_kwh,
        ndvi_proxy=round(ndvi_proxy, 2),
        physical_risk_score=physical_risk_score,
        data_source=data_source,
    )
