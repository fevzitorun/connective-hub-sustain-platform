"""
SASB Standards — Sustainability Accounting Standards Board
77 industry standards → 11 SICS sectors, 26 industry groups
UN SDGs — 17 Sustainable Development Goals → company activity mapping
"""
from typing import Any

# ── SASB SICS Sector taxonomy (11 sectors, 13 platform segments) ───────────────
SASB_SECTORS = [
    {
        "id": "apparel",
        "label": "Apparel, Accessories & Footwear",
        "label_tr": "Tekstil & Giyim",
        "icon": "👕",
        "color": "#f59e0b",
        "sics": "CN0101",
        "key_topics": ["Chemical Mgmt", "Water Use", "Labour Practices", "Raw Materials Sourcing", "GHG Emissions"],
        "metrics": [
            {"id": "cn_chemicals", "label": "Chemical use (SVHC)", "unit": "tonnes", "ref": "CN-AA-250a.1"},
            {"id": "cn_water",     "label": "Water withdrawn in high-stress areas", "unit": "m³", "ref": "CN-AA-140a.1"},
            {"id": "cn_labour",    "label": "% supply chain audited to SMETA", "unit": "%", "ref": "CN-AA-430a.1"},
            {"id": "cn_recycled",  "label": "% recycled materials used", "unit": "%", "ref": "CN-AA-440a.1"},
        ],
    },
    {
        "id": "food_bev",
        "label": "Food & Beverages",
        "label_tr": "Gıda & İçecek",
        "icon": "🍎",
        "color": "#10b981",
        "sics": "CN0301",
        "key_topics": ["GHG Emissions", "Water Mgmt", "Ingredient Sourcing", "Food Safety", "Packaging"],
        "metrics": [
            {"id": "fb_ghg",     "label": "Scope 1 GHG emissions",             "unit": "tCO₂e",  "ref": "FB-FR-110a.1"},
            {"id": "fb_water",   "label": "Water withdrawn",                   "unit": "m³",     "ref": "FB-FR-140a.1"},
            {"id": "fb_cert",    "label": "% certified sustainable ingredients","unit": "%",      "ref": "FB-FR-430a.1"},
            {"id": "fb_pkg",     "label": "Total packaging by type",           "unit": "tonnes", "ref": "FB-FR-410a.1"},
        ],
    },
    {
        "id": "chemicals",
        "label": "Chemicals",
        "label_tr": "Kimya & Malzeme",
        "icon": "⚗️",
        "color": "#8b5cf6",
        "sics": "RT0101",
        "key_topics": ["GHG Emissions", "Air Quality", "Hazardous Waste", "Safety", "Product Stewardship"],
        "metrics": [
            {"id": "ch_ghg",    "label": "GHG Scope 1 emissions",           "unit": "tCO₂e",  "ref": "RT-CH-110a.1"},
            {"id": "ch_air",    "label": "NOx, SOx, VOC emissions",         "unit": "tonnes", "ref": "RT-CH-120a.1"},
            {"id": "ch_waste",  "label": "Hazardous waste generated",        "unit": "tonnes", "ref": "RT-CH-150a.1"},
            {"id": "ch_safety", "label": "Process Safety Incidents (PSIF)",  "unit": "count",  "ref": "RT-CH-540a.1"},
        ],
    },
    {
        "id": "construction",
        "label": "Engineering & Construction",
        "label_tr": "İnşaat & Gayrimenkul",
        "icon": "🏗️",
        "color": "#ef4444",
        "sics": "IF0201",
        "key_topics": ["GHG Emissions", "Workforce Safety", "Materials Efficiency", "Water", "Biodiversity"],
        "metrics": [
            {"id": "ec_ghg",      "label": "Scope 1 GHG emissions",          "unit": "tCO₂e", "ref": "IF-EN-110a.1"},
            {"id": "ec_safety",   "label": "Total recordable incident rate",  "unit": "TRIR",  "ref": "IF-EN-320a.1"},
            {"id": "ec_backlog",  "label": "Revenue from green/certified projects", "unit": "£", "ref": "IF-EN-410a.1"},
            {"id": "ec_waste",    "label": "Construction waste diverted from landfill", "unit": "%", "ref": "IF-EN-150a.1"},
        ],
    },
    {
        "id": "energy",
        "label": "Oil, Gas & Consumable Fuels",
        "label_tr": "Enerji",
        "icon": "⚡",
        "color": "#0891b2",
        "sics": "EM0101",
        "key_topics": ["GHG & Air", "Water Mgmt", "Ecological Impacts", "Safety", "Reserve Carbon Cost"],
        "metrics": [
            {"id": "en_ghg",      "label": "Scope 1 GHG (direct) emissions", "unit": "tCO₂e", "ref": "EM-EP-110a.1"},
            {"id": "en_methane",  "label": "Methane (CH4) emissions",         "unit": "tCO₂e", "ref": "EM-EP-110a.2"},
            {"id": "en_flare",    "label": "Volume of gas flared",            "unit": "MMscf",  "ref": "EM-EP-120a.1"},
            {"id": "en_spills",   "label": "Volume of hydrocarbon spills",    "unit": "m³",     "ref": "EM-EP-167a.1"},
        ],
    },
    {
        "id": "banking",
        "label": "Commercial Banks",
        "label_tr": "Bankacılık & Finans",
        "icon": "🏦",
        "color": "#6366f1",
        "sics": "FN0101",
        "key_topics": ["Financed Emissions", "Data Security", "Financial Inclusion", "Governance", "ESG Integration"],
        "metrics": [
            {"id": "bn_finance",  "label": "Financed emissions (PCAF-aligned)",   "unit": "tCO₂e", "ref": "FN-CB-410a.1"},
            {"id": "bn_green",    "label": "% sustainable finance portfolio",     "unit": "%",      "ref": "FN-CB-410a.2"},
            {"id": "bn_cyber",    "label": "Number of data security incidents",   "unit": "count",  "ref": "FN-CB-230a.1"},
            {"id": "bn_inclusion","label": "% unbanked customers served",         "unit": "%",      "ref": "FN-CB-240a.1"},
        ],
    },
    {
        "id": "tech",
        "label": "Software & IT Services",
        "label_tr": "Teknoloji & Yazılım",
        "icon": "💻",
        "color": "#3b82f6",
        "sics": "TC0101",
        "key_topics": ["Data Privacy", "Data Security", "Employee Diversity", "Competitive Behaviour", "GHG Emissions"],
        "metrics": [
            {"id": "tc_breach",   "label": "Data security breaches",              "unit": "count",  "ref": "TC-SI-230a.1"},
            {"id": "tc_privacy",  "label": "% users protected by privacy policy", "unit": "%",      "ref": "TC-SI-220a.1"},
            {"id": "tc_diversity","label": "% gender diversity in workforce",     "unit": "%",      "ref": "TC-SI-330a.1"},
            {"id": "tc_ghg",      "label": "Scope 1+2 GHG emissions",            "unit": "tCO₂e",  "ref": "TC-SI-130a.1"},
        ],
    },
    {
        "id": "transport",
        "label": "Road Transportation",
        "label_tr": "Lojistik & Taşımacılık",
        "icon": "🚛",
        "color": "#f97316",
        "sics": "TR0101",
        "key_topics": ["GHG Emissions", "Air Quality", "Driver Wellbeing", "Fuel Efficiency", "Safety"],
        "metrics": [
            {"id": "tr_ghg",     "label": "Scope 1 GHG emissions",            "unit": "tCO₂e", "ref": "TR-RO-110a.1"},
            {"id": "tr_fuel",    "label": "Fuel consumed (diesel/alternative)", "unit": "GJ",   "ref": "TR-RO-110a.2"},
            {"id": "tr_safety",  "label": "Crash rate (USDOT)",               "unit": "per mile", "ref": "TR-RO-540a.1"},
            {"id": "tr_ev_pct",  "label": "% zero-emission vehicles",         "unit": "%",      "ref": "TR-RO-410a.1"},
        ],
    },
    {
        "id": "retail",
        "label": "Multiline & Specialty Retailers",
        "label_tr": "Perakende",
        "icon": "🛒",
        "color": "#ec4899",
        "sics": "CN0201",
        "key_topics": ["Labour Practices", "Energy", "GHG Emissions", "Supply Chain", "Data Security"],
        "metrics": [
            {"id": "rt_energy",  "label": "Total energy consumed",            "unit": "GJ",     "ref": "CN-MS-130a.1"},
            {"id": "rt_ghg",     "label": "Scope 1+2 GHG emissions",         "unit": "tCO₂e",  "ref": "CN-MS-110a.1"},
            {"id": "rt_labour",  "label": "% supply chain audited",           "unit": "%",      "ref": "CN-MS-430a.1"},
            {"id": "rt_waste",   "label": "Packaging weight reduction",       "unit": "tonnes", "ref": "CN-MS-410a.1"},
        ],
    },
]

# ── UN Sustainable Development Goals ──────────────────────────────────────────
UN_SDGS = [
    {"id": 1,  "label": "No Poverty",              "icon": "🏠", "color": "#e5243b"},
    {"id": 2,  "label": "Zero Hunger",             "icon": "🌾", "color": "#dda63a"},
    {"id": 3,  "label": "Good Health & Wellbeing", "icon": "🏥", "color": "#4c9f38"},
    {"id": 4,  "label": "Quality Education",        "icon": "📚", "color": "#c5192d"},
    {"id": 5,  "label": "Gender Equality",          "icon": "⚧️", "color": "#ff3a21"},
    {"id": 6,  "label": "Clean Water & Sanitation", "icon": "💧", "color": "#26bde2"},
    {"id": 7,  "label": "Affordable & Clean Energy","icon": "☀️", "color": "#fcc30b"},
    {"id": 8,  "label": "Decent Work & Growth",    "icon": "💼", "color": "#a21942"},
    {"id": 9,  "label": "Industry, Innovation & Infrastructure","icon": "🏭","color": "#fd6925"},
    {"id": 10, "label": "Reduced Inequalities",    "icon": "⚖️", "color": "#dd1367"},
    {"id": 11, "label": "Sustainable Cities",      "icon": "🌆", "color": "#fd9d24"},
    {"id": 12, "label": "Responsible Consumption", "icon": "♻️", "color": "#bf8b2e"},
    {"id": 13, "label": "Climate Action",          "icon": "🌍", "color": "#3f7e44"},
    {"id": 14, "label": "Life Below Water",        "icon": "🐋", "color": "#0a97d9"},
    {"id": 15, "label": "Life on Land",            "icon": "🌳", "color": "#56c02b"},
    {"id": 16, "label": "Peace, Justice & Institutions","icon": "⚖️","color": "#00689d"},
    {"id": 17, "label": "Partnerships for the Goals","icon": "🤝","color": "#19486a"},
]

# ── Sector → SDG mapping (top 4 per sector) ────────────────────────────────────
SECTOR_SDG_MAP: dict[str, list[int]] = {
    "banking":      [8, 13, 10, 17],
    "energy":       [7, 13, 9,  11],
    "manufacturing": [9, 13, 12, 8],
    "construction": [11, 13, 9,  8],
    "tech":         [9,  8, 10, 17],
    "transport":    [11, 13, 9,  8],
    "food_bev":     [2,  12, 13, 6],
    "apparel":      [12,  8,  6, 13],
    "retail":       [12,  8, 13,  9],
    "chemicals":    [9,  13,  3, 12],
    "other":        [13,  8, 12, 17],
}

# ── Assessment ─────────────────────────────────────────────────────────────────
def assess_sasb_sdg(
    company_name: str,
    sector_id: str,
    metric_values: dict[str, float],
    relevant_sdgs: list[int] | None = None,
) -> dict[str, Any]:
    sector = next((s for s in SASB_SECTORS if s["id"] == sector_id), SASB_SECTORS[0])

    filled_metrics = []
    for m in sector["metrics"]:
        val = metric_values.get(m["id"])
        filled_metrics.append({**m, "value": val, "disclosed": val is not None})

    disclosure_pct = round(sum(1 for m in filled_metrics if m["disclosed"]) / len(filled_metrics) * 100)

    sdg_ids = relevant_sdgs or SECTOR_SDG_MAP.get(sector_id, [13, 8, 12, 17])
    sdgs = [s for s in UN_SDGS if s["id"] in sdg_ids]

    return {
        "company_name": company_name,
        "sector": sector,
        "metrics": filled_metrics,
        "disclosure_pct": disclosure_pct,
        "sdgs": sdgs,
        "all_sdgs": UN_SDGS,
        "sector_sdg_map": SECTOR_SDG_MAP,
        "sasb_sectors": SASB_SECTORS,
    }


DEMO_RESULT = assess_sasb_sdg(
    company_name="Koç Holding A.Ş.",
    sector_id="manufacturing",
    metric_values={},
    relevant_sdgs=[9, 13, 12, 8, 7],
)
