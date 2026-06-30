"""
ESG Health Check — Public, no-auth endpoint.
Landing page widget için anında Sustain-Score tahmini döner.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/health-check", tags=["health-check"])

SECTOR_BENCHMARKS = {
    "manufacturing":  {"avg_intensity": 45.0, "label": "Üretim"},
    "banking":        {"avg_intensity": 8.0,  "label": "Bankacılık"},
    "retail":         {"avg_intensity": 18.0, "label": "Perakende"},
    "energy":         {"avg_intensity": 120.0,"label": "Enerji"},
    "construction":   {"avg_intensity": 55.0, "label": "İnşaat"},
    "logistics":      {"avg_intensity": 62.0, "label": "Lojistik"},
    "textile":        {"avg_intensity": 38.0, "label": "Tekstil"},
    "food":           {"avg_intensity": 28.0, "label": "Gıda"},
    "tech":           {"avg_intensity": 6.0,  "label": "Teknoloji"},
    "other":          {"avg_intensity": 30.0, "label": "Diğer"},
}

GRADE_MAP = [
    (90, "A+", "#166534", "#dcfce7"),
    (80, "A",  "#065f46", "#d1fae5"),
    (70, "B+", "#854d0e", "#fef9c3"),
    (60, "B",  "#92400e", "#fef3c7"),
    (50, "C+", "#9a3412", "#ffedd5"),
    (0,  "C",  "#991b1b", "#fee2e2"),
]

QUICK_WINS = {
    "A+": ["GRI 305 raporlaması başlatın", "Tedarikçi zinciri Scope 3 doğrulaması ekleyin"],
    "A":  ["SBTi hedefi belirleyin", "Yenilenebilir enerji sertifikası (I-REC) alın"],
    "B+": ["Enerji verimliliği denetimi yaptırın", "Elektrik tüketimini %15 azaltın"],
    "B":  ["Doğalgaz kullanımını izole edin", "Tedarikçi ESG anketi başlatın"],
    "C+": ["Acil emisyon envanteri çıkartın", "ISO 14064-1 danışmanlığı alın"],
    "C":  ["Acil karbon ayak izi tespiti gerekli", "Uzman danışmanlık önerilir"],
}


class HealthCheckRequest(BaseModel):
    sector: str
    employee_count: int
    electricity_kwh: Optional[float] = None
    natural_gas_m3: Optional[float] = None


@router.post("/estimate")
async def estimate_score(data: HealthCheckRequest):
    bench = SECTOR_BENCHMARKS.get(data.sector, SECTOR_BENCHMARKS["other"])

    # Scope 2 (elektrik) — 0.42 kgCO2e/kWh Türkiye grid faktörü
    electricity_kwh = data.electricity_kwh or (data.employee_count * 3500)
    scope2_tco2e = electricity_kwh * 0.42 / 1000

    # Scope 1 (doğalgaz) — 2.04 kgCO2e/m3
    gas_m3 = data.natural_gas_m3 or (data.employee_count * 180)
    scope1_tco2e = gas_m3 * 2.04 / 1000

    total_tco2e = scope1_tco2e + scope2_tco2e
    intensity = total_tco2e / max(data.employee_count, 1)  # ton CO2e / çalışan

    avg_intensity = bench["avg_intensity"] / 1000  # aynı birime çevir
    ratio = intensity / max(avg_intensity, 0.001)

    if ratio <= 0.5:
        base_score = 95
    elif ratio <= 0.8:
        base_score = 85
    elif ratio <= 1.0:
        base_score = 75
    elif ratio <= 1.3:
        base_score = 62
    elif ratio <= 1.7:
        base_score = 48
    else:
        base_score = 30

    # Büyük şirketler için küçük bonus (daha fazla veri, daha iyi uyum kapasitesi)
    if data.employee_count > 5000:
        base_score = min(base_score + 5, 99)

    grade_label, grade_color, grade_bg = "C", "#991b1b", "#fee2e2"
    for threshold, label, color, bg in GRADE_MAP:
        if base_score >= threshold:
            grade_label, grade_color, grade_bg = label, color, bg
            break

    percentile = max(5, min(95, int(100 - (ratio * 40))))

    return {
        "score": base_score,
        "grade": grade_label,
        "grade_color": grade_color,
        "grade_bg": grade_bg,
        "percentile": percentile,
        "total_tco2e": round(total_tco2e, 1),
        "intensity_per_employee": round(intensity, 3),
        "sector_avg_intensity": round(avg_intensity, 3),
        "sector_label": bench["label"],
        "vs_sector": f"Sektör ortalamasının {'%' + str(round(abs(1 - ratio) * 100)) + ' altında' if ratio < 1 else '%' + str(round((ratio - 1) * 100)) + ' üzerinde'}",
        "quick_wins": QUICK_WINS.get(grade_label, QUICK_WINS["B"]),
        "cta": "Detaylı analiz ve resmi GRI/TSRS raporu için ücretsiz deneme başlatın.",
        "estimated_electricity_kwh": electricity_kwh,
        "estimated_natural_gas_m3": gas_m3,
    }
