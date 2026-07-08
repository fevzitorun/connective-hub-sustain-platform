"""
Sektör benchmark servisi.
EEA CSV veri setleri ve SASB JRC ciltleri kullanılarak
şirket performansını sektör ortalaması ile karşılaştırır.
"""
from dataclasses import dataclass
from typing import Optional

# EEA veri setlerinden türetilmiş sektör baseline değerleri
# Kaynak: ee25-* CSV dosyaları + SASB JRC ciltleri
SECTOR_BENCHMARKS: dict[str, dict] = {
    "bankacılık": {
        "carbon_intensity_avg": 3.4,       # ton CO₂e/çalışan
        "carbon_intensity_best": 0.8,
        "energy_intensity_avg": 210,        # kWh/m²
        "energy_intensity_best": 95,
        "renewable_pct_avg": 18,            # %
        "renewable_pct_best": 85,
        "water_intensity_avg": 9.8,         # m³/çalışan
        "water_intensity_best": 4.2,
        "waste_recycling_avg": 55,          # %
        "waste_recycling_best": 92,
        "scope3_ratio_avg": 65,             # % (finanse edilen)
        "sasb_volume": "Cilt 16 + Cilt 19",
    },
    "imalat": {
        "carbon_intensity_avg": 12.5,
        "carbon_intensity_best": 3.2,
        "energy_intensity_avg": 850,
        "energy_intensity_best": 320,
        "renewable_pct_avg": 12,
        "renewable_pct_best": 60,
        "water_intensity_avg": 45,
        "water_intensity_best": 18,
        "waste_recycling_avg": 72,
        "waste_recycling_best": 95,
        "scope3_ratio_avg": 45,
        "sasb_volume": "Cilt 26",
    },
    "çimento": {
        "carbon_intensity_avg": 145,
        "carbon_intensity_best": 68,
        "energy_intensity_avg": 3800,
        "energy_intensity_best": 2100,
        "renewable_pct_avg": 8,
        "renewable_pct_best": 35,
        "water_intensity_avg": 280,
        "water_intensity_best": 95,
        "waste_recycling_avg": 62,
        "waste_recycling_best": 88,
        "scope3_ratio_avg": 20,
        "sasb_volume": "Cilt 10",
    },
    "enerji": {
        "carbon_intensity_avg": 890,
        "carbon_intensity_best": 12,
        "energy_intensity_avg": 12000,
        "energy_intensity_best": 800,
        "renewable_pct_avg": 22,
        "renewable_pct_best": 100,
        "water_intensity_avg": 1200,
        "water_intensity_best": 85,
        "waste_recycling_avg": 48,
        "waste_recycling_best": 82,
        "scope3_ratio_avg": 85,
        "sasb_volume": "Cilt 32",
    },
    "perakende": {
        "carbon_intensity_avg": 4.2,
        "carbon_intensity_best": 1.1,
        "energy_intensity_avg": 320,
        "energy_intensity_best": 145,
        "renewable_pct_avg": 25,
        "renewable_pct_best": 90,
        "water_intensity_avg": 12,
        "water_intensity_best": 4.8,
        "waste_recycling_avg": 68,
        "waste_recycling_best": 92,
        "scope3_ratio_avg": 78,
        "sasb_volume": "Cilt 22",
    },
    "inşaat": {
        "carbon_intensity_avg": 8.9,
        "carbon_intensity_best": 2.4,
        "energy_intensity_avg": 480,
        "energy_intensity_best": 190,
        "renewable_pct_avg": 10,
        "renewable_pct_best": 55,
        "water_intensity_avg": 32,
        "water_intensity_best": 12,
        "waste_recycling_avg": 58,
        "waste_recycling_best": 85,
        "scope3_ratio_avg": 72,
        "sasb_volume": "Cilt 33",
    },
    "sigorta": {
        "carbon_intensity_avg": 2.8,
        "carbon_intensity_best": 0.6,
        "energy_intensity_avg": 185,
        "energy_intensity_best": 80,
        "renewable_pct_avg": 20,
        "renewable_pct_best": 88,
        "water_intensity_avg": 8.5,
        "water_intensity_best": 3.5,
        "waste_recycling_avg": 60,
        "waste_recycling_best": 90,
        "scope3_ratio_avg": 60,
        "sasb_volume": "Cilt 20 + Cilt 21",
    },
    "rafineri": {
        "carbon_intensity_avg": 420,
        "carbon_intensity_best": 95,
        "energy_intensity_avg": 8500,
        "energy_intensity_best": 3200,
        "renewable_pct_avg": 5,
        "renewable_pct_best": 28,
        "water_intensity_avg": 850,
        "water_intensity_best": 220,
        "waste_recycling_avg": 55,
        "waste_recycling_best": 80,
        "scope3_ratio_avg": 90,
        "sasb_volume": "Cilt 31",
    },
}

# EEA çevre göstergeleri (EEA-25 veri setleri, AB-38 ülke ortalaması)
# EEA çevre göstergeleri — gerçek veriler (scripts/load_eea_data.py ile üretildi)
EEA_INDICATORS = {
    "circular_material_use_rate": {"name": "Döngüsel Materyal Kullanım Oranı", "value": 11.8, "unit": "%", "trend": 0.30, "year": 2023, "source": "EEA"},
    "organic_farming_area": {"name": "Organik Tarım Alanı", "value": 9.1, "unit": "%", "trend": 0.0, "year": 2022, "source": "EEA"},
    "climate_economic_losses": {"name": "İklimle İlişkili Ekonomik Kayıplar", "value": 66.4, "unit": "milyar EUR", "trend": 4.51, "year": 2023, "source": "EEA"},
    "consumption_footprint": {"name": "Tüketim Ayak İzi", "value": 2.1, "unit": "ton/kişi", "trend": 0.18, "year": 2021, "source": "EEA"},
    "eco_innovation_index": {"name": "Eko-İnovasyon Endeksi", "value": 127.5, "unit": "index", "trend": 3.80, "year": 2024, "source": "EEA"},
    "green_employment": {"name": "Çevre Sektöründe İstihdam", "value": 2.49, "unit": "% toplam istihdam", "trend": 0.05, "year": 2021, "source": "EEA"},
    "energy_poverty": {"name": "Enerji Yoksulluğu", "value": 10.6, "unit": "%", "trend": 1.30, "year": 2023, "source": "EEA"},
    "env_protection_expenditure": {"name": "Çevre Koruma Harcamaları", "value": 2.1, "unit": "% GSYH", "trend": 0.0, "year": 2023, "source": "EEA"},
}


@dataclass
class BenchmarkResult:
    sector: str
    carbon_intensity: float
    carbon_intensity_avg: float
    carbon_intensity_best: float
    carbon_percentile: int
    energy_intensity: float
    renewable_pct: float
    overall_score: int
    sector_rank: str
    grade: str
    recommendations: list[str]


def calculate_benchmark(
    sector: str,
    total_co2e: float,
    employee_count: int,
    electricity_kwh: float,
    floor_area_m2: float,
    renewable_pct: float = 0,
    water_m3: float = 0,
    waste_recycling_pct: float = 0,
) -> BenchmarkResult:
    sector_key = sector.lower()
    bench = SECTOR_BENCHMARKS.get(sector_key, SECTOR_BENCHMARKS["bankacılık"])

    carbon_intensity = total_co2e / max(employee_count, 1)
    energy_intensity = electricity_kwh / max(floor_area_m2, 1)

    # Karbon yoğunluğu skoru (0-100)
    best = bench["carbon_intensity_best"]
    avg = bench["carbon_intensity_avg"]
    if carbon_intensity <= best:
        carbon_score = 100
    elif carbon_intensity >= avg * 1.5:
        carbon_score = 0
    else:
        carbon_score = int(100 * (avg * 1.5 - carbon_intensity) / (avg * 1.5 - best))

    # Yenilenebilir enerji skoru
    re_score = min(100, int(renewable_pct / bench["renewable_pct_best"] * 100))

    # Atık geri dönüşüm skoru
    waste_score = min(100, int(waste_recycling_pct / bench["waste_recycling_best"] * 100))

    overall_score = int(carbon_score * 0.5 + re_score * 0.3 + waste_score * 0.2)

    if overall_score >= 80:
        grade = "A"
    elif overall_score >= 65:
        grade = "B+"
    elif overall_score >= 50:
        grade = "B"
    elif overall_score >= 35:
        grade = "C"
    else:
        grade = "D"

    # Karbon yüzdeliği (sektörde kaçıncı dilimde)
    if carbon_intensity <= best:
        percentile = 95
    elif carbon_intensity <= avg * 0.7:
        percentile = 75
    elif carbon_intensity <= avg:
        percentile = 50
    elif carbon_intensity <= avg * 1.3:
        percentile = 25
    else:
        percentile = 10

    recommendations = _build_recommendations(
        carbon_intensity, avg, best, renewable_pct,
        bench["renewable_pct_avg"], waste_recycling_pct, bench["waste_recycling_avg"]
    )

    return BenchmarkResult(
        sector=sector,
        carbon_intensity=round(carbon_intensity, 2),
        carbon_intensity_avg=avg,
        carbon_intensity_best=best,
        carbon_percentile=percentile,
        energy_intensity=round(energy_intensity, 1),
        renewable_pct=renewable_pct,
        overall_score=overall_score,
        sector_rank=f"~{100 - percentile}. yüzdelik",
        grade=grade,
        recommendations=recommendations,
    )


def _build_recommendations(
    co2: float,
    avg: float,
    best: float,
    re_pct: float,
    re_avg: float,
    waste_pct: float,
    waste_avg: float,
) -> list[str]:
    recs = []
    if co2 > avg:
        gap = round(((co2 - avg) / avg) * 100, 1)
        recs.append(f"Karbon yoğunluğu sektör ortalamasının %{gap} üzerinde — Kapsam 1 azaltım planı önerilir.")
    if re_pct < re_avg:
        recs.append(f"Yenilenebilir enerji payı (%{re_pct}) sektör ortalamasının (%{re_avg}) altında — GES veya YEK-G sertifikası değerlendirilmeli.")
    if waste_pct < waste_avg:
        recs.append(f"Atık geri dönüşüm oranı (%{waste_pct}) sektör ortalamasının (%{waste_avg}) altında — Sıfır atık programı uygulanmalı.")
    if not recs:
        recs.append("Tüm metriklerde sektör ortalamasının üzerindesiniz. SBTi 1.5°C uyumlu hedef belirlenmesi önerilir.")
    return recs


def get_eea_indicators() -> dict:
    return EEA_INDICATORS


def list_sectors() -> list[str]:
    return list(SECTOR_BENCHMARKS.keys())


# Radar eksen tanımları — SBTi + SASB temel kategorileri
_RADAR_AXES = [
    "Karbon", "Enerji", "Su", "Atık", "Arazi",
    "Havacılık", "Kimyasallar", "Biyoçeşitlilik",
]

# Sektöre göre radar ağırlıkları (0-100)
_SECTOR_RADAR_DEFAULTS: dict[str, dict[str, int]] = {
    "bankacılık":  {"Karbon": 72, "Enerji": 68, "Su": 80, "Atık": 78, "Arazi": 90, "Havacılık": 88, "Kimyasallar": 95, "Biyoçeşitlilik": 82},
    "imalat":      {"Karbon": 45, "Enerji": 52, "Su": 60, "Atık": 58, "Arazi": 70, "Havacılık": 75, "Kimyasallar": 48, "Biyoçeşitlilik": 65},
    "çimento":     {"Karbon": 25, "Enerji": 30, "Su": 42, "Atık": 55, "Arazi": 60, "Havacılık": 80, "Kimyasallar": 72, "Biyoçeşitlilik": 50},
    "enerji":      {"Karbon": 30, "Enerji": 38, "Su": 45, "Atık": 50, "Arazi": 55, "Havacılık": 70, "Kimyasallar": 60, "Biyoçeşitlilik": 48},
    "perakende":   {"Karbon": 60, "Enerji": 65, "Su": 72, "Atık": 62, "Arazi": 75, "Havacılık": 80, "Kimyasallar": 70, "Biyoçeşitlilik": 68},
    "inşaat":      {"Karbon": 40, "Enerji": 45, "Su": 50, "Atık": 48, "Arazi": 35, "Havacılık": 78, "Kimyasallar": 55, "Biyoçeşitlilik": 42},
    "sigorta":     {"Karbon": 75, "Enerji": 70, "Su": 82, "Atık": 80, "Arazi": 88, "Havacılık": 90, "Kimyasallar": 92, "Biyoçeşitlilik": 85},
    "rafineri":    {"Karbon": 18, "Enerji": 22, "Su": 35, "Atık": 40, "Arazi": 45, "Havacılık": 55, "Kimyasallar": 28, "Biyoçeşitlilik": 32},
}


def radar_data(
    sector: str,
    carbon_intensity: float,
    renewable_pct: float = 0,
    water_intensity: float = 0,
    waste_recycling_pct: float = 0,
) -> dict:
    """Radar grafiği için şirket vs sektör verisini hesapla (0-100 normalize)."""
    sector_key = sector.lower()
    bench = SECTOR_BENCHMARKS.get(sector_key, SECTOR_BENCHMARKS["bankacılık"])
    sector_avg = _SECTOR_RADAR_DEFAULTS.get(sector_key, _SECTOR_RADAR_DEFAULTS["bankacılık"])

    # Karbon skoru: düşük → iyi (ters orantılı)
    best = bench["carbon_intensity_best"]
    avg = bench["carbon_intensity_avg"]
    carbon_score = max(0, min(100, int(100 * (avg * 1.5 - carbon_intensity) / max(avg * 1.5 - best, 1))))

    # Yenilenebilir enerji (doğrudan orantılı)
    energy_score = min(100, int(renewable_pct / bench["renewable_pct_best"] * 100))

    # Su (düşük → iyi)
    w_avg = bench["water_intensity_avg"]
    water_score = max(0, min(100, int(100 * (w_avg * 1.5 - water_intensity) / max(w_avg, 1)))) if water_intensity > 0 else sector_avg["Su"]

    # Atık geri dönüşüm
    waste_score = min(100, int(waste_recycling_pct / bench["waste_recycling_best"] * 100)) if waste_recycling_pct > 0 else sector_avg["Atık"]

    company_values = {
        "Karbon": carbon_score,
        "Enerji": energy_score,
        "Su": water_score,
        "Atık": waste_score,
        "Arazi": sector_avg["Arazi"],           # kullanıcı verisi yoksa sektör ortalama
        "Havacılık": sector_avg["Havacılık"],
        "Kimyasallar": sector_avg["Kimyasallar"],
        "Biyoçeşitlilik": sector_avg["Biyoçeşitlilik"],
    }

    # Sektör sektör ortalaması (global)
    global_avg = {"Karbon": 52, "Enerji": 55, "Su": 58, "Atık": 60, "Arazi": 65, "Havacılık": 72, "Kimyasallar": 68, "Biyoçeşitlilik": 62}

    return {
        "axes": _RADAR_AXES,
        "company": [company_values[a] for a in _RADAR_AXES],
        "sector_avg": [sector_avg[a] for a in _RADAR_AXES],
        "global_avg": [global_avg[a] for a in _RADAR_AXES],
        "sector": sector,
        "overall_score": int(sum(company_values.values()) / len(company_values)),
    }
