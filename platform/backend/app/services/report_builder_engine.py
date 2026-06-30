"""
Report Builder Engine — Multi-framework ESG report generation
Combines data from all platform modules into structured report documents.
Supports: TSRS, CSRD/ESRS, GRI 2021, ISSB S1/S2, UK SRS, CDP
"""
from typing import Any
from datetime import datetime

# ── Supported frameworks ───────────────────────────────────────────────────────
FRAMEWORKS = [
    {
        "id": "tsrs",
        "label": "TSRS 1+2",
        "label_full": "Türkiye Sürdürülebilirlik Raporlama Standartları",
        "icon": "🇹🇷",
        "color": "#ef4444",
        "regulator": "KGK / SPK",
        "sections": ["Yönetişim", "Strateji", "Risk Yönetimi", "Metrikler ve Hedefler", "Emisyon Verileri"],
        "markets": ["Turkey"],
        "mandatory": True,
    },
    {
        "id": "csrd",
        "label": "CSRD / ESRS",
        "label_full": "Corporate Sustainability Reporting Directive",
        "icon": "🇪🇺",
        "color": "#6366f1",
        "regulator": "EC / EFRAG",
        "sections": ["Double Materiality", "E1 Climate", "E2-E5 Environment", "S1-S4 Social", "G1 Governance"],
        "markets": ["EU", "UK export"],
        "mandatory": True,
    },
    {
        "id": "gri",
        "label": "GRI 2021",
        "label_full": "Global Reporting Initiative Universal Standards 2021",
        "icon": "📖",
        "color": "#10b981",
        "regulator": "GRI",
        "sections": ["GRI 2 General Disclosures", "GRI 3 Material Topics", "GRI 302 Energy",
                     "GRI 305 Emissions", "GRI 401 Employment", "GRI 403 OHS"],
        "markets": ["Global"],
        "mandatory": False,
    },
    {
        "id": "issb",
        "label": "ISSB S1+S2",
        "label_full": "IFRS Sustainability Disclosure Standards",
        "icon": "📋",
        "color": "#8b5cf6",
        "regulator": "ISSB / IOSCO",
        "sections": ["Governance", "Strategy", "Risk Management", "Metrics & Targets", "Climate Scenarios"],
        "markets": ["UK", "GCC", "Japan", "Australia", "Global"],
        "mandatory": False,
    },
    {
        "id": "cdp",
        "label": "CDP Climate",
        "label_full": "Carbon Disclosure Project Climate Questionnaire",
        "icon": "🌍",
        "color": "#0891b2",
        "regulator": "CDP",
        "sections": ["C1 Governance", "C2 Risks & Opportunities", "C4 Targets", "C6 Emissions",
                     "C7 Emissions Breakdown", "C11 Carbon Pricing"],
        "markets": ["Global"],
        "mandatory": False,
    },
    {
        "id": "uk_srs",
        "label": "UK SRS",
        "label_full": "UK Sustainability Reporting Standards (FCA)",
        "icon": "🇬🇧",
        "color": "#f59e0b",
        "regulator": "FCA",
        "sections": ["SDR Label Assessment", "Governance", "Strategy", "Stewardship", "Consumer Outcomes"],
        "markets": ["UK"],
        "mandatory": False,
    },
]

# ── Report templates ───────────────────────────────────────────────────────────
REPORT_TEMPLATES = [
    {
        "id": "annual_sustainability",
        "label": "Annual Sustainability Report",
        "label_tr": "Yıllık Sürdürülebilirlik Raporu",
        "icon": "📄",
        "frameworks": ["tsrs", "gri"],
        "pages_est": 45,
        "desc": "Kapsamlı yıllık sürdürülebilirlik raporu — TSRS + GRI tabanlı",
    },
    {
        "id": "climate_disclosure",
        "label": "Climate Disclosure Report",
        "label_tr": "İklim Açıklama Raporu",
        "icon": "🌡️",
        "frameworks": ["tsrs", "issb", "cdp"],
        "pages_est": 28,
        "desc": "TSRS 2 + ISSB S2 + CDP — iklim odaklı yatırımcı raporu",
    },
    {
        "id": "eu_export",
        "label": "EU Supply Chain Report",
        "label_tr": "AB Tedarik Zinciri Raporu",
        "icon": "🇪🇺",
        "frameworks": ["csrd", "gri"],
        "pages_est": 32,
        "desc": "CSRD/ESRS E1 + GRI 305 — AB pazar erişimi için",
    },
    {
        "id": "investor_esg",
        "label": "Investor ESG Summary",
        "label_tr": "Yatırımcı ESG Özeti",
        "icon": "💹",
        "frameworks": ["issb", "gri"],
        "pages_est": 18,
        "desc": "ISSB S1+S2 + GRI özet — roadshow ve yatırımcı sunumu",
    },
    {
        "id": "custom",
        "label": "Custom Report",
        "label_tr": "Özel Rapor",
        "icon": "⚙️",
        "frameworks": [],
        "pages_est": None,
        "desc": "İstediğin çerçeveleri seçerek özelleştirilmiş rapor",
    },
]

# ── Report sections (generic building blocks) ──────────────────────────────────
SECTION_LIBRARY = [
    {"id": "cover",         "label": "Kapak & İçindekiler",      "category": "Structure",  "pages": 2},
    {"id": "ceo_letter",    "label": "CEO/Yönetim Mesajı",       "category": "Structure",  "pages": 2},
    {"id": "about",         "label": "Şirket Hakkında",          "category": "Structure",  "pages": 3},
    {"id": "governance",    "label": "Yönetişim",                 "category": "ESG",        "pages": 4},
    {"id": "materiality",   "label": "Önemlilik Değerlendirmesi","category": "ESG",        "pages": 4},
    {"id": "strategy",      "label": "Sürdürülebilirlik Stratejisi", "category": "ESG",    "pages": 4},
    {"id": "emissions",     "label": "Kapsam 1/2/3 Emisyonlar",  "category": "Climate",    "pages": 5},
    {"id": "energy",        "label": "Enerji Tüketimi",           "category": "Climate",    "pages": 3},
    {"id": "water",         "label": "Su Tüketimi",               "category": "Environment","pages": 2},
    {"id": "waste",         "label": "Atık Yönetimi",             "category": "Environment","pages": 2},
    {"id": "biodiversity",  "label": "Biyoçeşitlilik",           "category": "Environment","pages": 2},
    {"id": "targets",       "label": "İklim Hedefleri",           "category": "Climate",    "pages": 3},
    {"id": "scenarios",     "label": "Senaryo Analizi",           "category": "Climate",    "pages": 4},
    {"id": "social",        "label": "Çalışan & Sosyal",         "category": "Social",     "pages": 4},
    {"id": "supply_chain",  "label": "Tedarik Zinciri",          "category": "Social",     "pages": 3},
    {"id": "risk",          "label": "Sürdürülebilirlik Riskleri","category": "ESG",        "pages": 3},
    {"id": "kpis",          "label": "KPI Tablosu",               "category": "Data",       "pages": 2},
    {"id": "gri_index",     "label": "GRI İçerik Endeksi",        "category": "Index",      "pages": 3},
    {"id": "tsrs_table",    "label": "TSRS Uyum Tablosu",         "category": "Index",      "pages": 2},
    {"id": "assurance",     "label": "Bağımsız Güvence Beyanı",  "category": "Assurance",  "pages": 2},
]

# ── Build report outline ───────────────────────────────────────────────────────
def build_report_outline(
    company_name: str,
    report_year: int,
    frameworks: list[str],
    extra_sections: list[str] | None = None,
    language: str = "tr",
) -> dict[str, Any]:
    """Generate a full report outline with sections, page estimates, and framework mapping."""
    selected_fw = [f for f in FRAMEWORKS if f["id"] in frameworks]

    # always-on sections
    core = ["cover", "ceo_letter", "about", "governance", "materiality", "strategy",
            "emissions", "energy", "targets", "kpis"]

    # framework-specific sections
    if "tsrs" in frameworks or "issb" in frameworks:
        core += ["scenarios", "risk"]
    if "csrd" in frameworks:
        core += ["water", "waste", "biodiversity", "supply_chain"]
    if "gri" in frameworks:
        core += ["social", "gri_index"]
    if "tsrs" in frameworks:
        core += ["tsrs_table"]
    if extra_sections:
        core += extra_sections
    core.append("assurance")

    # deduplicate preserving order
    seen: set[str] = set()
    unique_sections = [s for s in core if not (s in seen or seen.add(s))]  # type: ignore[func-returns-value]

    sections = [s for s in SECTION_LIBRARY if s["id"] in unique_sections]
    total_pages = sum(s["pages"] for s in sections)

    return {
        "company_name": company_name,
        "report_year": report_year,
        "language": language,
        "frameworks": selected_fw,
        "sections": sections,
        "total_pages": total_pages,
        "estimated_hours": round(total_pages * 1.5),
        "status": "draft",
        "generated_at": datetime.utcnow().isoformat(),
    }


# ── Demo ───────────────────────────────────────────────────────────────────────
DEMO_OUTLINE = build_report_outline(
    company_name="Arçelik A.Ş.",
    report_year=2024,
    frameworks=["tsrs", "gri", "issb"],
    language="tr",
)

DEMO_RESULT = {
    "frameworks": FRAMEWORKS,
    "templates": REPORT_TEMPLATES,
    "section_library": SECTION_LIBRARY,
    "demo_outline": DEMO_OUTLINE,
}
