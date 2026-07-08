"""
ISSB IFRS S1 (2023) — General Sustainability-related Financial Disclosures
ISSB IFRS S2 (2023) — Climate-related Disclosures
IOSCO-endorsed global baseline; adopted by UK (UK SRS), GCC, Japan, Australia
Builds on TCFD framework — 4 pillars mapped to ISSB requirements
"""
from typing import Any

# ── IFRS S1: General Sustainability Disclosures ────────────────────────────────
S1_PILLARS = [
    {
        "id": "governance",
        "label": "Governance",
        "icon": "🏛️",
        "color": "#6366f1",
        "description": "Processes, controls and procedures to monitor and manage sustainability-related risks and opportunities",
        "requirements": [
            {"id": "gov_1", "ref": "S1.15(a)", "text": "Governance body(s) or individual(s) responsible for sustainability oversight"},
            {"id": "gov_2", "ref": "S1.15(b)", "text": "Management's role in governance processes, controls and procedures"},
            {"id": "gov_3", "ref": "S1.16(a)", "text": "How governance body is informed about sustainability risks and opportunities"},
            {"id": "gov_4", "ref": "S1.16(b)", "text": "How governance body considers sustainability in strategic decisions and risk oversight"},
        ],
    },
    {
        "id": "strategy",
        "label": "Strategy",
        "icon": "🧭",
        "color": "#f59e0b",
        "description": "Current and anticipated effects of sustainability risks and opportunities on business model, strategy and financial performance",
        "requirements": [
            {"id": "str_1", "ref": "S1.22(a)", "text": "Sustainability-related risks and opportunities that could reasonably affect prospects"},
            {"id": "str_2", "ref": "S1.22(b)", "text": "Anticipated effects on business model and value chain"},
            {"id": "str_3", "ref": "S1.22(c)", "text": "How strategy and decision-making has been adjusted"},
            {"id": "str_4", "ref": "S1.22(d)", "text": "Resilience of strategy and business model to sustainability risks"},
        ],
    },
    {
        "id": "risk_management",
        "label": "Risk Management",
        "icon": "🛡️",
        "color": "#ef4444",
        "description": "Processes to identify, assess, prioritise and monitor sustainability-related risks and opportunities",
        "requirements": [
            {"id": "rm_1", "ref": "S1.34(a)", "text": "Processes for identifying sustainability-related risks and opportunities"},
            {"id": "rm_2", "ref": "S1.34(b)", "text": "Assessment criteria, including prioritisation relative to other risks"},
            {"id": "rm_3", "ref": "S1.34(c)", "text": "How processes are integrated into overall risk management framework"},
            {"id": "rm_4", "ref": "S1.34(d)", "text": "Monitoring approach and related decision-making processes"},
        ],
    },
    {
        "id": "metrics_targets",
        "label": "Metrics & Targets",
        "icon": "📊",
        "color": "#10b981",
        "description": "Performance against sustainability-related risks and opportunities, including targets set or required by law",
        "requirements": [
            {"id": "mt_1", "ref": "S1.44(a)", "text": "Metrics required by applicable ISSB Standards"},
            {"id": "mt_2", "ref": "S1.44(b)", "text": "Industry-based metrics from SASB Standards applicable to entity"},
            {"id": "mt_3", "ref": "S1.44(c)", "text": "Entity-specific metrics for material sustainability-related risks/opportunities"},
            {"id": "mt_4", "ref": "S1.44(d)", "text": "Targets set by entity and progress towards those targets"},
        ],
    },
]

# ── IFRS S2: Climate-specific Disclosures ─────────────────────────────────────
S2_PILLARS = [
    {
        "id": "climate_governance",
        "label": "Governance (S2)",
        "icon": "🏛️",
        "color": "#6366f1",
        "s1_ref": "governance",
        "requirements": [
            {"id": "cg_1", "ref": "S2.6", "text": "Board oversight of climate-related risks and opportunities"},
            {"id": "cg_2", "ref": "S2.7", "text": "Management's role in climate risk assessment and management"},
        ],
    },
    {
        "id": "climate_strategy",
        "label": "Strategy (S2)",
        "icon": "🌡️",
        "color": "#f59e0b",
        "s1_ref": "strategy",
        "requirements": [
            {"id": "cs_1", "ref": "S2.10(a)", "text": "Physical and transition climate-related risks and opportunities identified"},
            {"id": "cs_2", "ref": "S2.10(b)", "text": "Anticipated effects on business model and strategy (short/medium/long-term)"},
            {"id": "cs_3", "ref": "S2.10(c)", "text": "Climate resilience of strategy using scenario analysis (incl. 1.5°C or 2°C)"},
            {"id": "cs_4", "ref": "S2.10(d)", "text": "Use of carbon credits to achieve net zero or climate-related targets"},
        ],
    },
    {
        "id": "climate_risk",
        "label": "Risk Management (S2)",
        "icon": "⚠️",
        "color": "#ef4444",
        "s1_ref": "risk_management",
        "requirements": [
            {"id": "cr_1", "ref": "S2.25(a)", "text": "Processes for identifying, assessing and prioritising climate-related risks"},
            {"id": "cr_2", "ref": "S2.25(b)", "text": "How climate risks are integrated into overall risk management"},
        ],
    },
    {
        "id": "climate_metrics",
        "label": "Metrics & Targets (S2)",
        "icon": "📏",
        "color": "#10b981",
        "s1_ref": "metrics_targets",
        "requirements": [
            {"id": "cm_1", "ref": "S2.29(a)", "text": "GHG emissions: Scope 1, Scope 2, Scope 3 (with consolidation approach)"},
            {"id": "cm_2", "ref": "S2.29(b)", "text": "Cross-industry metric categories (transition risk, physical risk, capital deployment)"},
            {"id": "cm_3", "ref": "S2.29(c)", "text": "Industry-based metrics (SASB-derived, sector-specific)"},
            {"id": "cm_4", "ref": "S2.33",    "text": "Climate-related targets: GHG targets, absolute/intensity, validated (SBTi)"},
        ],
    },
]

# ── S2 Cross-Industry Metrics (mandatory) ─────────────────────────────────────
S2_CROSS_INDUSTRY_METRICS = [
    {
        "id": "ghg_scope1",  "category": "GHG Emissions",
        "label": "Scope 1 GHG Emissions",
        "unit": "tCO₂e", "ref": "S2.29(a)(i)",
        "protocol": "GHG Protocol Corporate Standard",
    },
    {
        "id": "ghg_scope2",  "category": "GHG Emissions",
        "label": "Scope 2 GHG Emissions (location + market-based)",
        "unit": "tCO₂e", "ref": "S2.29(a)(ii)",
        "protocol": "GHG Protocol Corporate Standard",
    },
    {
        "id": "ghg_scope3",  "category": "GHG Emissions",
        "label": "Scope 3 GHG Emissions (all 15 categories where material)",
        "unit": "tCO₂e", "ref": "S2.29(a)(iii)",
        "protocol": "GHG Protocol Scope 3 Standard",
    },
    {
        "id": "transition_risk", "category": "Transition Risk",
        "label": "Amount / % revenue from activities aligned with climate transition",
        "unit": "£ / %", "ref": "S2.29(b)(i)",
        "protocol": "ISSB Application Guidance AG13",
    },
    {
        "id": "physical_risk", "category": "Physical Risk",
        "label": "% assets or business exposed to acute/chronic physical risks",
        "unit": "%", "ref": "S2.29(b)(ii)",
        "protocol": "ISSB Application Guidance AG14",
    },
    {
        "id": "capital_low",  "category": "Capital Deployment",
        "label": "Capital expenditure deployed toward climate-related opportunities",
        "unit": "£", "ref": "S2.29(b)(iii)",
        "protocol": "ISSB Application Guidance AG15",
    },
    {
        "id": "internal_carbon", "category": "Carbon Pricing",
        "label": "Internal carbon price per tCO₂e (if used in decision-making)",
        "unit": "£/tCO₂e", "ref": "S2.29(b)(iv)",
        "protocol": "Voluntary disclosure",
    },
    {
        "id": "exec_remuneration", "category": "Remuneration",
        "label": "% of executive remuneration linked to climate considerations",
        "unit": "%", "ref": "S2.29(b)(v)",
        "protocol": "S2 Application Guidance",
    },
]

# ── TCFD → ISSB Crosswalk ─────────────────────────────────────────────────────
TCFD_ISSB_CROSSWALK = [
    {
        "tcfd_pillar": "Governance",
        "tcfd_req": "Board oversight of climate risks and opportunities",
        "issb_ref": "IFRS S2.6–S2.8",
        "esrs_ref": "ESRS E1-GOV-1",
        "csrd_aligned": True,
        "notes": "ISSB S2 governance is identical to TCFD; S1 extends to all sustainability topics",
    },
    {
        "tcfd_pillar": "Governance",
        "tcfd_req": "Management's role in assessing and managing climate risks",
        "issb_ref": "IFRS S2.7",
        "esrs_ref": "ESRS E1-GOV-2",
        "csrd_aligned": True,
        "notes": "Direct 1:1 mapping",
    },
    {
        "tcfd_pillar": "Strategy",
        "tcfd_req": "Short/medium/long-term climate risks and opportunities",
        "issb_ref": "IFRS S2.10(a)",
        "esrs_ref": "ESRS E1-SBM-3",
        "csrd_aligned": True,
        "notes": "ISSB requires explicit time horizons defined by entity",
    },
    {
        "tcfd_pillar": "Strategy",
        "tcfd_req": "Impact of risks/opportunities on business/strategy/financials",
        "issb_ref": "IFRS S2.10(b)–(c)",
        "esrs_ref": "ESRS E1-SBM-3",
        "csrd_aligned": True,
        "notes": "ISSB requires quantified financial impact where practicable",
    },
    {
        "tcfd_pillar": "Strategy",
        "tcfd_req": "Resilience of strategy under different climate scenarios",
        "issb_ref": "IFRS S2.10(c) + AG8–AG11",
        "esrs_ref": "ESRS E1-4",
        "csrd_aligned": True,
        "notes": "ISSB mandates scenario analysis; 1.5°C scenario required from 2027",
    },
    {
        "tcfd_pillar": "Risk Management",
        "tcfd_req": "Processes to identify and assess climate-related risks",
        "issb_ref": "IFRS S2.25(a)",
        "esrs_ref": "ESRS E1-IRO-1",
        "csrd_aligned": True,
        "notes": "Identical intent; ISSB more explicit on prioritisation criteria",
    },
    {
        "tcfd_pillar": "Risk Management",
        "tcfd_req": "Integration of climate risk into overall risk management",
        "issb_ref": "IFRS S2.25(b)",
        "esrs_ref": "ESRS E1-IRO-1",
        "csrd_aligned": True,
        "notes": "Direct mapping; ISSB also covers opportunities explicitly",
    },
    {
        "tcfd_pillar": "Metrics & Targets",
        "tcfd_req": "Scope 1, 2, 3 GHG emissions + related risks",
        "issb_ref": "IFRS S2.29(a)",
        "esrs_ref": "ESRS E1-6",
        "csrd_aligned": True,
        "notes": "ISSB mandates all three scopes; Scope 3 phased-in for SMEs",
    },
    {
        "tcfd_pillar": "Metrics & Targets",
        "tcfd_req": "Metrics used to manage climate-related risks/opportunities",
        "issb_ref": "IFRS S2.29(b) + (c)",
        "esrs_ref": "ESRS E1-9",
        "csrd_aligned": True,
        "notes": "ISSB adds cross-industry metrics (transition risk %, physical risk %, CapEx)",
    },
    {
        "tcfd_pillar": "Metrics & Targets",
        "tcfd_req": "Climate-related targets and performance against targets",
        "issb_ref": "IFRS S2.33–S2.36",
        "esrs_ref": "ESRS E1-4",
        "csrd_aligned": True,
        "notes": "ISSB requires disclosure of target type (absolute/intensity), validation status",
    },
]

# ── UK SRS vs IFRS S1/S2: 6 UK-specific amendments ──────────────────────────
# UK SRS published August 2024 by FRC/BEIS; effective FYB 1 January 2025
# Both UK SRS 1 & UK SRS 2 are structurally identical to IFRS S1/S2 with 6 amendments.
UK_SRS_AMENDMENTS = [
    {
        "ref": "Amendment 1",
        "topic": "Label & Authority",
        "ifrs_text": "IFRS S1/S2 issued by ISSB (IFRS Foundation)",
        "uk_srs_text": "UK SRS 1/2 issued by UK FRC under BEIS authority",
        "materiality": "Low — administrative",
        "icon": "🏛️",
    },
    {
        "ref": "Amendment 2",
        "topic": "Effective Date",
        "ifrs_text": "Annual periods beginning on or after 1 January 2024",
        "uk_srs_text": "Annual periods beginning on or after 1 January 2025 (UK mandatory)",
        "materiality": "Medium — UK companies gain 12-month later start",
        "icon": "📅",
    },
    {
        "ref": "Amendment 3",
        "topic": "Proportionality Relief (Smaller Listed)",
        "ifrs_text": "No explicit relief for smaller listed entities",
        "uk_srs_text": "Proportionality provisions: smaller Tier 2 listed companies may phase-in climate disclosures over 2 years",
        "materiality": "High — significant relief for AIM/AQSE companies",
        "icon": "⚖️",
    },
    {
        "ref": "Amendment 4",
        "topic": "Climate-First Phasing",
        "ifrs_text": "IFRS S1 (general) and S2 (climate) apply together from Year 1",
        "uk_srs_text": "UK SRS 2 (climate) may be applied alone in Year 1; UK SRS 1 follows Year 2",
        "materiality": "High — allows climate-only reporting in first year",
        "icon": "🌡️",
    },
    {
        "ref": "Amendment 5",
        "topic": "UK Transition Plan (CTPR)",
        "ifrs_text": "Transition plan disclosures per ISSB S2 §B36–B37",
        "uk_srs_text": "Additional UK Climate Transition Plan Requirement (CTPR) aligned with TPT Disclosure Framework",
        "materiality": "Medium — adds UK TPT sector pathways",
        "icon": "🗺️",
    },
    {
        "ref": "Amendment 6",
        "topic": "FCA TCFD Compatibility",
        "ifrs_text": "ISSB replaces TCFD as the global climate disclosure framework",
        "uk_srs_text": "UK SRS must align with FCA's TCFD-based Listing Rules (LR 9.8.6R); dual compliance supported",
        "materiality": "Medium — UK SRS = TCFD-compliant by design",
        "icon": "🇬🇧",
    },
]

# ── Adoption tracker: which jurisdictions have adopted IFRS S1/S2 ─────────────
ISSB_ADOPTION_MAP: list[dict] = [
    {"jurisdiction": "United Kingdom", "code": "UK", "standard": "UK SRS 1+2", "effective": "FYB Jan 2025", "mandatory_scope": "Premium + Standard listed (FCA)", "status": "Mandatory"},
    {"jurisdiction": "Turkey", "code": "TR", "standard": "TSRS 1+2 (KGK)", "effective": "FYB Jan 2024 (BİST-100)", "mandatory_scope": "BİST-100 → all listed → banks → large cos", "status": "Mandatory (phased)"},
    {"jurisdiction": "Australia", "code": "AU", "standard": "AASB S1+S2", "effective": "FYB Jan 2025 (large)","mandatory_scope": "Large entities, financial institutions", "status": "Mandatory"},
    {"jurisdiction": "Japan", "code": "JP", "standard": "SSBJ S1+S2", "effective": "FYB Apr 2027", "mandatory_scope": "TSE Prime listed", "status": "Phased"},
    {"jurisdiction": "Singapore", "code": "SG", "standard": "SGX ISSB-aligned", "effective": "FY2025", "mandatory_scope": "SGX-listed companies", "status": "Mandatory"},
    {"jurisdiction": "Canada", "code": "CA", "standard": "CSSB S1+S2", "effective": "FYB Jan 2025 (voluntary)", "mandatory_scope": "Voluntary; regulatory mandate pending", "status": "Voluntary"},
    {"jurisdiction": "GCC / UAE", "code": "AE", "standard": "ISSB S1+S2 (direct)", "effective": "FY2026", "mandatory_scope": "Financial institutions; ADGM/DIFC firms", "status": "Phased"},
    {"jurisdiction": "EU", "code": "EU", "standard": "ESRS (CSRD) — ISSB interop", "effective": "FY2024 (large PIEs)", "mandatory_scope": "Large EU companies + EU-listed", "status": "Mandatory (ESRS)"},
    {"jurisdiction": "KKTC", "code": "CY-N", "standard": "TSRS 1+2 (consolidated under TR parent)", "effective": "FYB Jan 2024 (via TR consolidation)", "mandatory_scope": "Subsidiaries of TR-listed parents (TSRS 1 §20 + App. Guide B38)", "status": "Via consolidation"},
]

# ── Readiness scoring ─────────────────────────────────────────────────────────
READINESS_BANDS = [
    {"min": 0,  "max": 25, "label": "Initial",    "color": "#ef4444", "bg": "#fef2f2",
     "desc": "Sustainability governance and climate risk processes not yet formalised"},
    {"min": 25, "max": 50, "label": "Developing",  "color": "#f59e0b", "bg": "#fffbeb",
     "desc": "Basic processes in place; material gaps in disclosure quality and quantification"},
    {"min": 50, "max": 75, "label": "Established", "color": "#3b82f6", "bg": "#eff6ff",
     "desc": "Most ISSB requirements addressed; scenario analysis and financialisation needed"},
    {"min": 75, "max": 100,"label": "Advanced",    "color": "#10b981", "bg": "#f0fdf4",
     "desc": "Comprehensive ISSB-ready disclosure; audit-trail and assurance recommended"},
]

# ── Scenario analysis bands ────────────────────────────────────────────────────
SCENARIO_BANDS = [
    {"id": "1_5c",    "label": "1.5°C (Orderly)",    "icon": "🟢", "color": "#10b981",
     "transition_risk": "High", "physical_risk": "Low",
     "desc": "Rapid decarbonisation; high transition cost, low physical damage. Required from 2027."},
    {"id": "2c",      "label": "2°C (Below)",         "icon": "🟡", "color": "#f59e0b",
     "transition_risk": "Medium", "physical_risk": "Medium",
     "desc": "Paris Agreement baseline. Moderate transition + moderate physical risk."},
    {"id": "3c",      "label": "3°C (Disorderly)",    "icon": "🟠", "color": "#f97316",
     "transition_risk": "Low",  "physical_risk": "High",
     "desc": "Late, disruptive policy action. High physical risk especially post-2040."},
    {"id": "4c",      "label": "4°C+ (Hot House)",    "icon": "🔴", "color": "#ef4444",
     "transition_risk": "Very Low", "physical_risk": "Severe",
     "desc": "Business-as-usual. Catastrophic physical risk; potential asset stranding by 2050."},
]

# ── Core assessment function ───────────────────────────────────────────────────
def calculate_issb_readiness(
    pillar_scores: dict[str, float],  # pillar_id → 0-100
) -> dict[str, Any]:
    """Compute overall ISSB readiness and per-pillar gaps."""
    pillar_ids = ["governance", "strategy", "risk_management", "metrics_targets"]
    filled = {p: pillar_scores.get(p, 0.0) for p in pillar_ids}
    overall = round(sum(filled.values()) / len(pillar_ids), 1)

    band = next(
        (b for b in READINESS_BANDS if b["min"] <= overall < b["max"]),
        READINESS_BANDS[-1],
    )

    gaps = [
        pid for pid, score in filled.items() if score < 50
    ]

    return {
        "pillar_scores": filled,
        "overall_score": overall,
        "readiness_label": band["label"],
        "readiness_color": band["color"],
        "readiness_desc": band["desc"],
        "gaps": gaps,
        "disclosure_ready": overall >= 65,
    }


def full_issb_assessment(
    company_name: str,
    sector: str,
    scope1_tco2e: float,
    scope2_tco2e: float,
    scope3_tco2e: float,
    pillar_scores: dict[str, float] | None = None,
    scenarios_analysed: list[str] | None = None,
    has_sbti_target: bool = False,
    internal_carbon_price: float | None = None,
    exec_pay_linked: bool = False,
) -> dict[str, Any]:
    """Full ISSB S1+S2 assessment for a company."""
    scores = pillar_scores or {"governance": 60, "strategy": 45, "risk_management": 50, "metrics_targets": 55}
    readiness = calculate_issb_readiness(scores)

    total_ghg = scope1_tco2e + scope2_tco2e + scope3_tco2e
    scope3_pct = round(scope3_tco2e / total_ghg * 100, 1) if total_ghg else 0

    scenario_coverage = len(scenarios_analysed or [])
    scenario_ready = "1_5c" in (scenarios_analysed or [])

    cross_industry: list[dict] = []
    for m in S2_CROSS_INDUSTRY_METRICS:
        val: Any = None
        status = "not_disclosed"
        if m["id"] == "ghg_scope1":
            val = scope1_tco2e; status = "disclosed"
        elif m["id"] == "ghg_scope2":
            val = scope2_tco2e; status = "disclosed"
        elif m["id"] == "ghg_scope3":
            val = scope3_tco2e; status = "disclosed" if scope3_tco2e > 0 else "not_disclosed"
        elif m["id"] == "internal_carbon" and internal_carbon_price:
            val = internal_carbon_price; status = "disclosed"
        elif m["id"] == "exec_remuneration":
            val = 20 if exec_pay_linked else 0
            status = "disclosed" if exec_pay_linked else "not_disclosed"
        cross_industry.append({**m, "value": val, "status": status})

    recommendations = []
    if not scenario_ready:
        recommendations.append({
            "priority": "High", "ref": "IFRS S2.10(c)",
            "action": "Conduct 1.5°C scenario analysis — mandatory from 2027 reporting period",
        })
    if scores.get("governance", 0) < 60:
        recommendations.append({
            "priority": "High", "ref": "IFRS S2.6",
            "action": "Formalise board-level climate governance — appoint named oversight body",
        })
    if scope3_tco2e == 0:
        recommendations.append({
            "priority": "Medium", "ref": "IFRS S2.29(a)(iii)",
            "action": "Measure and disclose Scope 3 emissions across all material categories",
        })
    if not has_sbti_target:
        recommendations.append({
            "priority": "Medium", "ref": "IFRS S2.33",
            "action": "Set science-based climate target (SBTi) — enhances credibility of S2 disclosure",
        })
    if not internal_carbon_price:
        recommendations.append({
            "priority": "Low", "ref": "IFRS S2.29(b)(iv)",
            "action": "Consider adopting internal carbon price to signal transition readiness",
        })

    return {
        "company_name": company_name,
        "sector": sector,
        "readiness": readiness,
        "ghg_summary": {
            "scope1": scope1_tco2e,
            "scope2": scope2_tco2e,
            "scope3": scope3_tco2e,
            "total": total_ghg,
            "scope3_pct": scope3_pct,
        },
        "scenario_coverage": scenario_coverage,
        "scenarios_analysed": scenarios_analysed or [],
        "scenario_ready": scenario_ready,
        "has_sbti_target": has_sbti_target,
        "cross_industry_metrics": cross_industry,
        "recommendations": recommendations,
        "s1_pillars": S1_PILLARS,
        "s2_pillars": S2_PILLARS,
        "tcfd_crosswalk": TCFD_ISSB_CROSSWALK,
        "scenario_bands": SCENARIO_BANDS,
        "uk_srs_amendments": UK_SRS_AMENDMENTS,
        "issb_adoption_map": ISSB_ADOPTION_MAP,
        "standards": {
            "s1": "IFRS S1 — General Sustainability-related Financial Disclosures (June 2023)",
            "s2": "IFRS S2 — Climate-related Disclosures (June 2023)",
            "endorsed_by": "IOSCO (July 2023)",
            "adopted_by": ["UK SRS (FCA 2024)", "Japan (2025)", "Australia (2025)", "GCC (2025)", "Singapore (2025)"],
            "tcfd_supersedes": True,
        },
    }


# ── Demo result ────────────────────────────────────────────────────────────────
DEMO_RESULT = full_issb_assessment(
    company_name="Meridian Energy PLC",
    sector="Energy / Utilities",
    scope1_tco2e=12_400,
    scope2_tco2e=3_850,
    scope3_tco2e=48_200,
    pillar_scores={"governance": 72, "strategy": 58, "risk_management": 65, "metrics_targets": 54},
    scenarios_analysed=["2c", "3c"],
    has_sbti_target=True,
    internal_carbon_price=45.0,
    exec_pay_linked=True,
)
