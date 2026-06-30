"""
ISO 14046:2014 — Water Footprint (blue/green/grey)
ESRS E2 — Pollution
ESRS E3 — Water & Marine Resources
ESRS E4 — Biodiversity & Ecosystems
ESRS E5 — Resource Use & Circular Economy
Part of CSRD mandatory environmental reporting (ESRS E1 already done in Sprint 31)
"""
from typing import Any

# ── ESRS E2: Pollution ─────────────────────────────────────────────────────────
ESRS_E2_DISCLOSURES = [
    {"id": "e2_1", "ref": "E2-1", "title": "Policies related to pollution",
     "desc": "Policies on air, water, soil pollution prevention and control"},
    {"id": "e2_2", "ref": "E2-2", "title": "Actions for pollution management",
     "desc": "Actions and resources for pollution prevention, reduction, remediation"},
    {"id": "e2_3", "ref": "E2-3", "title": "Targets for pollution management",
     "desc": "Measurable targets: air pollutants (NOx, SOx, PM, VOC), hazardous waste"},
    {"id": "e2_4", "ref": "E2-4", "title": "Pollution of air, water, soil metrics",
     "desc": "Quantitative disclosure: Scope-like approach to pollution intensity"},
    {"id": "e2_5", "ref": "E2-5", "title": "Substances of concern",
     "desc": "Substances of concern (SVHC) — generation, use, release"},
    {"id": "e2_6", "ref": "E2-6", "title": "Anticipated financial effects",
     "desc": "Financial effects of pollution risks including remediation costs"},
]

# ── ESRS E3: Water & Marine Resources ─────────────────────────────────────────
ESRS_E3_DISCLOSURES = [
    {"id": "e3_1", "ref": "E3-1", "title": "Policies related to water & marine resources",
     "desc": "Policies addressing water stewardship and marine resource protection"},
    {"id": "e3_2", "ref": "E3-2", "title": "Actions and resources on water management",
     "desc": "Actions to reduce water withdrawal, improve efficiency, protect marine ecosystems"},
    {"id": "e3_3", "ref": "E3-3", "title": "Targets related to water & marine resources",
     "desc": "Water reduction targets, water recycling, zero-discharge targets"},
    {"id": "e3_4", "ref": "E3-4", "title": "Water consumption",
     "desc": "Total water withdrawal, consumption by source; stressed-area breakdown"},
    {"id": "e3_5", "ref": "E3-5", "title": "Anticipated financial effects",
     "desc": "Financial effects of water risks (scarcity, flooding, regulatory)"},
]

# ── ESRS E4: Biodiversity & Ecosystems ────────────────────────────────────────
ESRS_E4_DISCLOSURES = [
    {"id": "e4_1", "ref": "E4-1", "title": "Transition plan & consideration of biodiversity",
     "desc": "Transition plan addressing biodiversity and ecosystem impacts"},
    {"id": "e4_2", "ref": "E4-2", "title": "Policies related to biodiversity and ecosystems",
     "desc": "Policies on biodiversity protection, no net loss, ecosystem restoration"},
    {"id": "e4_3", "ref": "E4-3", "title": "Actions and resources for biodiversity",
     "desc": "Conservation, restoration actions; Kunming-Montreal framework alignment"},
    {"id": "e4_4", "ref": "E4-4", "title": "Targets related to biodiversity and ecosystems",
     "desc": "Science-based biodiversity targets, land-use targets"},
    {"id": "e4_5", "ref": "E4-5", "title": "Impact metrics on biodiversity and ecosystems",
     "desc": "Land use, species impact, ecosystem condition metrics"},
    {"id": "e4_6", "ref": "E4-6", "title": "Anticipated financial effects",
     "desc": "Ecosystem dependencies, nature-related financial risks"},
]

# ── ESRS E5: Resource Use & Circular Economy ──────────────────────────────────
ESRS_E5_DISCLOSURES = [
    {"id": "e5_1", "ref": "E5-1", "title": "Policies related to resource use & circular economy",
     "desc": "Policies on resource efficiency, waste reduction, circular design"},
    {"id": "e5_2", "ref": "E5-2", "title": "Actions and resources on circular economy",
     "desc": "Actions to increase resource productivity, reduce waste, enable circularity"},
    {"id": "e5_3", "ref": "E5-3", "title": "Targets related to resource use",
     "desc": "Waste reduction targets, recycled content targets, product take-back"},
    {"id": "e5_4", "ref": "E5-4", "title": "Resource inflows",
     "desc": "Materials consumed (total, renewable, non-renewable), recycled input"},
    {"id": "e5_5", "ref": "E5-5", "title": "Resource outflows",
     "desc": "Total waste by disposal route; products designed for circular economy"},
    {"id": "e5_6", "ref": "E5-6", "title": "Anticipated financial effects",
     "desc": "Resource cost escalation risk, stranded asset risk, circular revenue opportunity"},
]

ALL_ESRS_ENV = [
    {"standard": "ESRS E2", "title": "Pollution",                    "icon": "💨", "color": "#6b7280", "disclosures": ESRS_E2_DISCLOSURES},
    {"standard": "ESRS E3", "title": "Water & Marine Resources",     "icon": "💧", "color": "#0891b2", "disclosures": ESRS_E3_DISCLOSURES},
    {"standard": "ESRS E4", "title": "Biodiversity & Ecosystems",    "icon": "🌳", "color": "#10b981", "disclosures": ESRS_E4_DISCLOSURES},
    {"standard": "ESRS E5", "title": "Resource Use & Circular Economy","icon": "♻️","color": "#f59e0b", "disclosures": ESRS_E5_DISCLOSURES},
]

# ── ISO 14046 Water Footprint ──────────────────────────────────────────────────
WATER_FOOTPRINT_TYPES = [
    {
        "id": "blue",
        "label": "Blue Water Footprint",
        "label_tr": "Mavi Su Ayak İzi",
        "icon": "💧",
        "color": "#0891b2",
        "desc": "Surface and groundwater consumed (evaporated, incorporated into product, discharged to different catchment)",
        "examples": ["Irrigation", "Industrial cooling", "Process water"],
    },
    {
        "id": "green",
        "label": "Green Water Footprint",
        "label_tr": "Yeşil Su Ayak İzi",
        "icon": "🌿",
        "color": "#10b981",
        "desc": "Rainwater consumed (evapotranspiration from crops, forests, natural vegetation)",
        "examples": ["Crop production", "Forestry", "Natural fibre growing"],
    },
    {
        "id": "grey",
        "label": "Grey Water Footprint",
        "label_tr": "Gri Su Ayak İzi",
        "icon": "🌫️",
        "color": "#94a3b8",
        "desc": "Freshwater required to dilute pollutants to ambient water quality standards",
        "examples": ["Industrial discharge", "Agricultural runoff", "Wastewater treatment"],
    },
]

WATER_STRESS_ZONES = [
    {"country": "Turkey", "basins": ["Konya Kapalı Havzası", "Gediz", "Büyük Menderes"], "stress": "High", "color": "#ef4444"},
    {"country": "UK",     "basins": ["Thames", "Anglian"], "stress": "Medium-High", "color": "#f59e0b"},
    {"country": "EU",     "basins": ["Po", "Ebro", "Guadalquivir"], "stress": "High", "color": "#ef4444"},
    {"country": "Global", "basins": ["Indo-Gangetic", "Colorado", "Yellow River"], "stress": "Extremely High", "color": "#dc2626"},
]

# ── Assessment ─────────────────────────────────────────────────────────────────
def assess_water_esrs(
    company_name: str,
    sector: str,
    water_withdrawal_m3: float,
    water_consumed_m3: float,
    operates_in_high_stress: bool,
    completed_disclosures: list[str],
    waste_generated_tonnes: float = 0,
    recycled_pct: float = 0,
) -> dict[str, Any]:
    all_disc = (ESRS_E2_DISCLOSURES + ESRS_E3_DISCLOSURES +
                ESRS_E4_DISCLOSURES + ESRS_E5_DISCLOSURES)
    total = len(all_disc)
    done = len(completed_disclosures)
    completeness = round(done / total * 100, 1)

    water_intensity = round(water_consumed_m3 / 1000, 2) if water_consumed_m3 > 0 else 0

    recommendations = []
    if operates_in_high_stress and water_withdrawal_m3 > 10_000:
        recommendations.append({
            "priority": "High", "ref": "ESRS E3-4",
            "action": "Disclose water withdrawal in high water-stress areas separately — mandatory for material basins",
        })
    if recycled_pct < 20:
        recommendations.append({
            "priority": "Medium", "ref": "ESRS E5-5",
            "action": f"Circular economy target: increase recycled content from {recycled_pct}% toward 30%+ by 2030",
        })
    if "e4_5" not in completed_disclosures:
        recommendations.append({
            "priority": "Medium", "ref": "ESRS E4-5",
            "action": "Quantify biodiversity impact — land use change, species affected (TNFD LEAP phase data)",
        })
    if "e2_5" not in completed_disclosures:
        recommendations.append({
            "priority": "Low", "ref": "ESRS E2-5",
            "action": "Identify and disclose Substances of Very High Concern (SVHC) in operations and supply chain",
        })

    return {
        "company_name": company_name,
        "sector": sector,
        "water": {
            "withdrawal_m3": water_withdrawal_m3,
            "consumed_m3": water_consumed_m3,
            "intensity_m3_per_tco2e": water_intensity,
            "high_stress": operates_in_high_stress,
            "footprint_types": WATER_FOOTPRINT_TYPES,
            "stress_zones": WATER_STRESS_ZONES,
        },
        "circular": {
            "waste_tonnes": waste_generated_tonnes,
            "recycled_pct": recycled_pct,
        },
        "esrs_env": ALL_ESRS_ENV,
        "completed_disclosures": completed_disclosures,
        "completeness_pct": completeness,
        "done": done,
        "total": total,
        "recommendations": recommendations,
    }


DEMO_RESULT = assess_water_esrs(
    company_name="Ereğli Demir Çelik A.Ş.",
    sector="Manufacturing / Steel",
    water_withdrawal_m3=2_800_000,
    water_consumed_m3=1_100_000,
    operates_in_high_stress=True,
    completed_disclosures=["e2_1", "e2_2", "e3_1", "e3_4", "e5_1", "e5_4", "e5_5"],
    waste_generated_tonnes=45_000,
    recycled_pct=38,
)
