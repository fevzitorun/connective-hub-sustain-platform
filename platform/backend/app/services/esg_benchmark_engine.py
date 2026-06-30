"""
ESG Benchmark Engine (Sprint 42) — 3-series Radar
Company / Sector Average / Best-in-Class comparison across 8 ESG dimensions.
Aggregates scores from all platform modules for investor-pitch dashboard.
"""
from typing import Any

BENCHMARK_DIMENSIONS = [
    {"id": "carbon",       "label": "Carbon & Climate", "icon": "🌡️", "weight": 0.20, "sources": ["ISO 14064", "ISSB S2", "TSRS 2", "SBTi"]},
    {"id": "energy",       "label": "Energy Transition","icon": "⚡", "weight": 0.15, "sources": ["GRI 302", "SASB", "EU Taxonomy"]},
    {"id": "water",        "label": "Water Stewardship","icon": "💧", "weight": 0.10, "sources": ["ISO 14046", "ESRS E3", "GRI 303"]},
    {"id": "biodiversity", "label": "Biodiversity",     "icon": "🌳", "weight": 0.10, "sources": ["TNFD", "ESRS E4", "SASB"]},
    {"id": "circular",     "label": "Circular Economy", "icon": "♻️", "weight": 0.10, "sources": ["ESRS E5", "GRI 306"]},
    {"id": "governance",   "label": "Governance",       "icon": "🏛️", "weight": 0.15, "sources": ["ISSB S1", "TSRS 1", "GRI 2"]},
    {"id": "social",       "label": "Social",           "icon": "👥", "weight": 0.10, "sources": ["GRI 401/403", "ESRS S1-S4"]},
    {"id": "disclosure",   "label": "Disclosure Quality","icon": "📄","weight": 0.10, "sources": ["GRI", "CDP", "CSRD", "TSRS"]},
]

SECTOR_BENCHMARKS: dict[str, dict[str, dict[str, float]]] = {
    "banking":       {"sector_avg": {"carbon":62,"energy":55,"water":70,"biodiversity":42,"circular":50,"governance":74,"social":68,"disclosure":72}, "best_in_class": {"carbon":88,"energy":82,"water":90,"biodiversity":75,"circular":78,"governance":95,"social":88,"disclosure":92}},
    "manufacturing": {"sector_avg": {"carbon":48,"energy":52,"water":55,"biodiversity":38,"circular":45,"governance":60,"social":58,"disclosure":55}, "best_in_class": {"carbon":82,"energy":78,"water":85,"biodiversity":68,"circular":75,"governance":88,"social":80,"disclosure":86}},
    "energy":        {"sector_avg": {"carbon":42,"energy":65,"water":60,"biodiversity":45,"circular":40,"governance":68,"social":62,"disclosure":70}, "best_in_class": {"carbon":75,"energy":92,"water":84,"biodiversity":72,"circular":68,"governance":90,"social":82,"disclosure":88}},
    "retail":        {"sector_avg": {"carbon":52,"energy":58,"water":62,"biodiversity":40,"circular":55,"governance":65,"social":70,"disclosure":60}, "best_in_class": {"carbon":80,"energy":84,"water":88,"biodiversity":70,"circular":82,"governance":90,"social":88,"disclosure":85}},
    "tech":          {"sector_avg": {"carbon":65,"energy":70,"water":72,"biodiversity":48,"circular":52,"governance":72,"social":75,"disclosure":75}, "best_in_class": {"carbon":90,"energy":92,"water":92,"biodiversity":78,"circular":80,"governance":95,"social":90,"disclosure":95}},
}

FRAMEWORK_SCORES_DEMO = {
    "TSRS 1+2": 67, "CSRD/ESRS": 58, "GRI 2021": 72, "ISSB S1+S2": 62,
    "CDP": 74, "EU Taxonomy": 55, "SBTi": 68, "TNFD": 50,
    "ISO 14064": 80, "ISO 14067 PCF": 65, "FCA SDR": 60,
    "SASB": 58, "Water/ESRS E2-E5": 52,
}

def calculate_esg_benchmark(company_name: str, sector: str, company_scores: dict[str, float]) -> dict[str, Any]:
    ref = SECTOR_BENCHMARKS.get(sector, SECTOR_BENCHMARKS["manufacturing"])
    sector_avg = ref["sector_avg"]
    best = ref["best_in_class"]

    total_w = sum(d["weight"] for d in BENCHMARK_DIMENSIONS)
    c_w = sum(company_scores.get(d["id"], 50) * d["weight"] for d in BENCHMARK_DIMENSIONS) / total_w
    s_w = sum(sector_avg[d["id"]] * d["weight"] for d in BENCHMARK_DIMENSIONS) / total_w
    b_w = sum(best[d["id"]] * d["weight"] for d in BENCHMARK_DIMENSIONS) / total_w

    radar = [{"dimension": d["label"], "icon": d["icon"], "company": round(company_scores.get(d["id"], 50)), "sector_avg": round(sector_avg[d["id"]]), "best_in_class": round(best[d["id"]])} for d in BENCHMARK_DIMENSIONS]

    gaps = sorted(
        [{"dimension": d["label"], "gap_to_sector": round(sector_avg[d["id"]] - company_scores.get(d["id"], 50)), "gap_to_best": round(best[d["id"]] - company_scores.get(d["id"], 50))} for d in BENCHMARK_DIMENSIONS if company_scores.get(d["id"], 50) < sector_avg[d["id"]]],
        key=lambda x: x["gap_to_best"], reverse=True
    )

    return {
        "company_name": company_name, "sector": sector,
        "radar_data": radar,
        "overall": {"company": round(c_w, 1), "sector_avg": round(s_w, 1), "best_in_class": round(b_w, 1)},
        "gaps": gaps[:4],
        "framework_scores": FRAMEWORK_SCORES_DEMO,
        "dimensions": BENCHMARK_DIMENSIONS,
        "percentile": min(99, max(1, round((c_w / b_w) * 100))),
    }

DEMO_RESULT = calculate_esg_benchmark(
    "Arçelik A.Ş.", "manufacturing",
    {"carbon": 68, "energy": 62, "water": 58, "biodiversity": 45, "circular": 55, "governance": 74, "social": 65, "disclosure": 70},
)
