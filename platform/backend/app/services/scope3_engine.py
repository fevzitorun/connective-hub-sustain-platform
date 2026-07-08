"""
GHG Protocol — Scope 3 Value Chain Calculator
All 15 categories with emission factors and calculation methods
"""
from typing import Any

# ── 15 Scope 3 Categories ─────────────────────────────────────────────────────
SCOPE3_CATEGORIES = [
    # Upstream
    {"id": 1,  "code": "Cat 1",  "title": "Satın Alınan Mal & Hizmetler",       "group": "upstream",   "icon": "📦",
     "method": "Supplier-specific / EEIO", "unit": "tCO₂e",
     "description": "Tedarik zincirinin Kapsam 1+2 emisyonları dahil satın alınan tüm mal ve hizmetler",
     "sbti_included": True, "typical_pct": 35},
    {"id": 2,  "code": "Cat 2",  "title": "Sermaye Malları",                    "group": "upstream",   "icon": "🏭",
     "method": "Supplier-specific / EEIO", "unit": "tCO₂e",
     "description": "Binalar, ekipmanlar, makinalar — yaşam boyu emisyonların bir yılda itfa edilmesi",
     "sbti_included": True, "typical_pct": 5},
    {"id": 3,  "code": "Cat 3",  "title": "Yakıt & Enerji İlişkili Faaliyetler","group": "upstream",   "icon": "⚡",
     "method": "Market-based / Location-based", "unit": "tCO₂e",
     "description": "Satın alınan yakıt ve enerji üretiminin yukarı akış emisyonları (Kapsam 1+2 dışı)",
     "sbti_included": False, "typical_pct": 3},
    {"id": 4,  "code": "Cat 4",  "title": "Yukarı Akış Taşımacılık & Dağıtım", "group": "upstream",   "icon": "🚛",
     "method": "Spend-based / Distance-based", "unit": "tCO₂e",
     "description": "Satın alınan ürünlerin tedarikçiden tesise taşınması",
     "sbti_included": True, "typical_pct": 4},
    {"id": 5,  "code": "Cat 5",  "title": "Operasyonlarda Oluşan Atık",        "group": "upstream",   "icon": "♻️",
     "method": "Waste-type specific EF", "unit": "tCO₂e",
     "description": "Operasyonlarda oluşan atıkların işlenmesinden kaynaklanan emisyonlar",
     "sbti_included": True, "typical_pct": 1},
    {"id": 6,  "code": "Cat 6",  "title": "İş Seyahatleri",                    "group": "upstream",   "icon": "✈️",
     "method": "Distance-based (DEFRA)", "unit": "tCO₂e",
     "description": "Havayolu, demiryolu, kara — çalışanların iş seyahatleri",
     "sbti_included": False, "typical_pct": 2},
    {"id": 7,  "code": "Cat 7",  "title": "Çalışan İşe Geliş-Gidiş",          "group": "upstream",   "icon": "🚌",
     "method": "Distance-based", "unit": "tCO₂e",
     "description": "Çalışanların evden işe ve işten eve taşımacılığı",
     "sbti_included": False, "typical_pct": 1},
    {"id": 8,  "code": "Cat 8",  "title": "Yukarı Akış Kiralanmış Varlıklar", "group": "upstream",   "icon": "🏢",
     "method": "Asset-specific", "unit": "tCO₂e",
     "description": "Kiralanan ofis, depo, ekipman gibi varlıkların emisyonları",
     "sbti_included": False, "typical_pct": 2},
    # Downstream
    {"id": 9,  "code": "Cat 9",  "title": "Aşağı Akış Taşımacılık & Dağıtım", "group": "downstream", "icon": "🚢",
     "method": "Distance-based", "unit": "tCO₂e",
     "description": "Satılan ürünlerin tesisten müşteriye taşınması",
     "sbti_included": True, "typical_pct": 3},
    {"id": 10, "code": "Cat 10", "title": "Satılan Ürünlerin İşlenmesi",       "group": "downstream", "icon": "⚙️",
     "method": "Product-specific", "unit": "tCO₂e",
     "description": "Ara ürünlerin müşteri tarafından işlenmesi sırasındaki emisyonlar",
     "sbti_included": True, "typical_pct": 2},
    {"id": 11, "code": "Cat 11", "title": "Satılan Ürünlerin Kullanımı",       "group": "downstream", "icon": "🏠",
     "method": "Usage-based / LCA", "unit": "tCO₂e",
     "description": "Müşterilerin satın aldığı ürünleri kullanırken oluşan emisyonlar (en büyük kategori)",
     "sbti_included": True, "typical_pct": 25},
    {"id": 12, "code": "Cat 12", "title": "Satılan Ürünlerin Ömür Sonu İşlemi","group": "downstream", "icon": "🗑️",
     "method": "Waste-type specific EF", "unit": "tCO₂e",
     "description": "Ürünlerin kullanım ömrü sonundaki bertaraf ve geri dönüşüm emisyonları",
     "sbti_included": True, "typical_pct": 3},
    {"id": 13, "code": "Cat 13", "title": "Aşağı Akış Kiralanmış Varlıklar",  "group": "downstream", "icon": "🏗️",
     "method": "Asset-specific", "unit": "tCO₂e",
     "description": "Başkalarına kiralanan varlıklardan kaynaklanan emisyonlar",
     "sbti_included": False, "typical_pct": 2},
    {"id": 14, "code": "Cat 14", "title": "Franchiseler",                      "group": "downstream", "icon": "🏪",
     "method": "Franchisee-specific", "unit": "tCO₂e",
     "description": "Franchise işletmelerinin Kapsam 1+2 emisyonları",
     "sbti_included": False, "typical_pct": 5},
    {"id": 15, "code": "Cat 15", "title": "Yatırımlar (Finanse Edilen Emisyon)","group": "downstream", "icon": "💰",
     "method": "PCAF Standard", "unit": "tCO₂e",
     "description": "Finansal kurumlar için portföy şirketlerinin atıf payı emisyonları — PCAF metodolojisi",
     "sbti_included": True, "typical_pct": 7},
]

# ── Emission factors for spend-based calculation ──────────────────────────────
SPEND_FACTORS: dict[str, float] = {
    "tekstil_hammadde":   4.2,    # tCO₂e / 1000 USD harcama
    "enerji_alımı":       2.8,
    "taşımacılık":        1.5,
    "kimyasallar":        3.1,
    "plastik_ambalaj":    3.8,
    "metal_bileşenler":   5.2,
    "kağıt_karton":       2.1,
    "dijital_hizmetler":  0.6,
    "danışmanlık":        0.3,
}

# ── Distance-based emission factors ──────────────────────────────────────────
TRANSPORT_EF: dict[str, float] = {
    "havayolu_kısa":   0.255,   # kgCO₂e / pax-km
    "havayolu_orta":   0.195,
    "havayolu_uzun":   0.150,
    "tren":            0.041,
    "kara_araç":       0.171,
    "TIR_yük":         0.062,   # kgCO₂e / tkm
    "deniz_yük":       0.016,
    "hava_yük":        0.500,
}

# ── Business travel EF (DEFRA 2022) ───────────────────────────────────────────
TRAVEL_EF = {
    "uçak_short_haul":  0.255,  # kgCO₂e/km
    "uçak_long_haul":   0.195,
    "tren":             0.041,
    "taksi":            0.150,
    "otobüs":           0.089,
}


def calculate_scope3(
    category_inputs: dict[int, float],  # {cat_id: tCO₂e value}
    total_scope1_2: float = 1000.0,
) -> dict[str, Any]:
    """
    Calculate Scope 3 totals, hotspots, and SBTi-relevant categories.
    category_inputs: {1: 4200.0, 6: 280.0, 11: 3100.0, ...}
    """
    results = []
    total = 0.0
    sbti_total = 0.0

    for cat in SCOPE3_CATEGORIES:
        value = category_inputs.get(cat["id"], 0.0)
        total += value
        if cat["sbti_included"]:
            sbti_total += value
        results.append({
            **{k: cat[k] for k in ("id", "code", "title", "group", "icon", "method", "unit", "sbti_included", "typical_pct")},
            "emissions_tco2e": value,
            "is_hotspot": False,  # will be set below
        })

    # Mark hotspots (top 3 emitting categories)
    sorted_by_emissions = sorted(results, key=lambda x: x["emissions_tco2e"], reverse=True)
    for i, item in enumerate(sorted_by_emissions[:3]):
        if item["emissions_tco2e"] > 0:
            next(r for r in results if r["id"] == item["id"])["is_hotspot"] = True

    upstream_total = sum(r["emissions_tco2e"] for r in results if SCOPE3_CATEGORIES[r["id"]-1]["group"] == "upstream")
    downstream_total = sum(r["emissions_tco2e"] for r in results if SCOPE3_CATEGORIES[r["id"]-1]["group"] == "downstream")

    intensity = round(total / total_scope1_2 * 100, 1) if total_scope1_2 > 0 else 0

    return {
        "total_scope3_tco2e": round(total, 1),
        "sbti_relevant_tco2e": round(sbti_total, 1),
        "upstream_tco2e": round(upstream_total, 1),
        "downstream_tco2e": round(downstream_total, 1),
        "scope3_vs_scope12_pct": intensity,
        "categories": results,
        "hotspots": [r for r in results if r["is_hotspot"]],
        "coverage_pct": round(sum(1 for r in results if r["emissions_tco2e"] > 0) / len(results) * 100),
        "data_quality": _data_quality(category_inputs),
        "reduction_priority": sorted_by_emissions[:5],
    }


def _data_quality(inputs: dict[int, float]) -> str:
    filled = sum(1 for v in inputs.values() if v > 0)
    if filled >= 12: return "Yüksek (≥12 kategori)"
    if filled >= 8:  return "Orta (≥8 kategori)"
    if filled >= 5:  return "Temel (≥5 kategori)"
    return "Düşük (<5 kategori) — SBTi için en az 5 kategori gerekli"


# ── Demo data (realistic tekstil sector) ─────────────────────────────────────
DEMO_INPUTS = {
    1: 4850.0,   # Purchased goods
    2: 420.0,    # Capital goods
    3: 310.0,    # Fuel & energy related
    4: 680.0,    # Upstream transport
    5: 85.0,     # Waste in operations
    6: 145.0,    # Business travel
    7: 95.0,     # Employee commuting
    8: 0.0,      # Upstream leased
    9: 520.0,    # Downstream transport
    10: 0.0,     # Processing of sold products
    11: 3100.0,  # Use of sold products
    12: 280.0,   # End of life
    13: 0.0,     # Downstream leased
    14: 0.0,     # Franchises
    15: 0.0,     # Investments
}

DEMO_RESULT = calculate_scope3(DEMO_INPUTS, total_scope1_2=1284.0)
