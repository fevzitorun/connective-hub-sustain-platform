"""
FCA SDR (Sustainability Disclosure Requirements) + EU SFDR Compliance Engine.
FCA SDR: effective Dec 2023 (consumer-facing products Dec 2024)
EU SFDR: Regulation (EU) 2019/2088 + Delegated Regulation (EU) 2022/1288 (RTS)
"""
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field


# ── FCA SDR Labels (PS22/3, SRS labels) ─────────────────────────────────────
FCA_SDR_LABELS = {
    "Sustainability Impact": {
        "description": "Seeks to achieve a pre-defined positive sustainability outcome for people or planet.",
        "min_score": 80,
        "color": "#10b981",
        "requirements": [
            "Clear sustainability objective with measurable outcomes",
            "Evidence of real-world impact (additionality)",
            "Robust impact measurement methodology",
            "Annual impact report to FCA",
        ],
    },
    "Sustainability Focus": {
        "description": "Invests in assets that meet a robust, evidence-based sustainability standard.",
        "min_score": 60,
        "color": "#3b82f6",
        "requirements": [
            "Portfolio meets or exceeds defined sustainability standard",
            "At least 70% in assets with sustainability characteristics",
            "Regular independent verification of standard",
            "Clear disclosure of methodology",
        ],
    },
    "Sustainability Mixed Goals": {
        "description": "Allocates meaningfully to sustainable investments alongside other strategies.",
        "min_score": 40,
        "color": "#8b5cf6",
        "requirements": [
            "Clear proportion of sustainability-focused assets disclosed",
            "Both impact and focus elements clearly labelled",
            "Proportionate disclosure for each component",
        ],
    },
    "Sustainability Improvers": {
        "description": "Invests in assets that have the potential to improve sustainability over time.",
        "min_score": 25,
        "color": "#f59e0b",
        "requirements": [
            "Credible stewardship/engagement strategy",
            "Time-bound targets for improvement",
            "Evidence of investee progress",
        ],
    },
    "No Label (Article 6 Equivalent)": {
        "description": "No sustainability characteristics or objective. Must not use sustainability terms.",
        "min_score": 0,
        "color": "#64748b",
        "requirements": [
            "Cannot use sustainability, ESG, green, or similar terms in product name",
            "Anti-greenwashing rule still applies",
        ],
    },
}

# ── SFDR Article Classification ──────────────────────────────────────────────
SFDR_ARTICLES = {
    9: {
        "name": "Article 9 — Dark Green",
        "description": "Sustainable investment as the objective. Highest level of sustainability integration.",
        "color": "#10b981",
        "min_taxonomy_pct": 50,
        "min_sustainable_investment_pct": 80,
        "criteria": [
            "Sustainable investment objective clearly defined",
            "Minimum 80% sustainable investments",
            "Do No Significant Harm (DNSH) assessment for all investments",
            "Good governance practices verified",
            "Full Principal Adverse Impacts (PAI) reporting mandatory",
        ],
    },
    8: {
        "name": "Article 8 — Light Green",
        "description": "Promotes environmental or social characteristics (E/S characteristics).",
        "color": "#3b82f6",
        "min_taxonomy_pct": 20,
        "min_sustainable_investment_pct": 0,
        "criteria": [
            "Promotes E/S characteristics as binding element",
            "May include some sustainable investments",
            "PAI reporting recommended (mandatory from 2023)",
            "Taxonomy alignment disclosure required if >0%",
        ],
    },
    6: {
        "name": "Article 6 — Grey",
        "description": "Integrates sustainability risks but does not promote E/S characteristics.",
        "color": "#94a3b8",
        "min_taxonomy_pct": 0,
        "min_sustainable_investment_pct": 0,
        "criteria": [
            "Sustainability risk integration in investment process",
            "No specific sustainability characteristics promoted",
            "No PAI statement required (but recommended)",
        ],
    },
}

# ── Principal Adverse Impact (PAI) Indicators — SFDR RTS Annex 1 ─────────────
PAI_INDICATORS = [
    # Climate & Environment (mandatory)
    {"id": 1, "category": "Climate", "name": "GHG Emissions (Scope 1, 2, 3)",
     "unit": "tCO₂e / M€ invested", "mandatory": True, "eu_taxonomy": True},
    {"id": 2, "category": "Climate", "name": "Carbon Footprint",
     "unit": "tCO₂e / M€ market cap", "mandatory": True, "eu_taxonomy": True},
    {"id": 3, "category": "Climate", "name": "GHG Intensity of Investee Companies",
     "unit": "tCO₂e / M€ revenue", "mandatory": True, "eu_taxonomy": True},
    {"id": 4, "category": "Climate", "name": "Exposure to Fossil Fuel Companies",
     "unit": "% portfolio", "mandatory": True, "eu_taxonomy": False},
    {"id": 5, "category": "Energy", "name": "Non-Renewable Energy Consumption",
     "unit": "% energy mix", "mandatory": True, "eu_taxonomy": False},
    {"id": 6, "category": "Energy", "name": "Energy Consumption Intensity by Sector",
     "unit": "GWh / M€ revenue", "mandatory": True, "eu_taxonomy": False},
    {"id": 7, "category": "Biodiversity", "name": "Activities Negatively Affecting Biodiversity",
     "unit": "% portfolio exposed", "mandatory": True, "eu_taxonomy": False},
    {"id": 8, "category": "Water", "name": "Emissions to Water",
     "unit": "tonnes / M€ invested", "mandatory": True, "eu_taxonomy": False},
    {"id": 9, "category": "Waste", "name": "Hazardous Waste Ratio",
     "unit": "tonnes / M€ invested", "mandatory": True, "eu_taxonomy": False},
    # Social (mandatory)
    {"id": 10, "category": "Social", "name": "Violations of UNGC Principles / OECD Guidelines",
     "unit": "# companies in violation", "mandatory": True, "eu_taxonomy": False},
    {"id": 11, "category": "Social", "name": "Lack of UNGC/OECD Compliance Processes",
     "unit": "% companies without process", "mandatory": True, "eu_taxonomy": False},
    {"id": 12, "category": "Social", "name": "Unadjusted Gender Pay Gap",
     "unit": "%", "mandatory": True, "eu_taxonomy": False},
    {"id": 13, "category": "Governance", "name": "Board Gender Diversity",
     "unit": "% female board members", "mandatory": True, "eu_taxonomy": False},
    {"id": 14, "category": "Governance", "name": "Exposure to Controversial Weapons",
     "unit": "% portfolio", "mandatory": True, "eu_taxonomy": False},
]

# ── UK Green Taxonomy Objectives (aligned with EU Taxonomy, UK-specific) ─────
UK_TAXONOMY_OBJECTIVES = [
    "Climate change mitigation",
    "Climate change adaptation",
    "Sustainable use and protection of water and marine resources",
    "Transition to a circular economy",
    "Pollution prevention and control",
    "Protection and restoration of biodiversity and ecosystems",
]

# ── TCFD Pillar Gaps by Score Range ─────────────────────────────────────────
def _get_tcfd_gaps(score: int) -> List[str]:
    gaps = []
    if score < 70:
        gaps.append("Governance: Climate oversight at board level not evidenced")
    if score < 60:
        gaps.append("Strategy: Long-term climate scenario analysis (1.5°C / 4°C) missing")
    if score < 75:
        gaps.append("Risk Management: No formal climate risk register")
    if score < 80:
        gaps.append("Metrics: Scope 3 value chain emissions incomplete")
    if score < 85:
        gaps.append("Metrics: Executive remuneration not linked to climate KPIs")
    if score < 50:
        gaps.append("Strategy: Paris Agreement alignment not assessed")
    return gaps or ["All mandatory TCFD pillars covered — ready for enhanced disclosure"]


def assess_fca_sdr(
    maturity_score: int,
    scope1_co2e: float = 0,
    scope2_co2e: float = 0,
    scope3_co2e: float = 0,
    has_science_targets: bool = False,
    has_verified_data: bool = False,
    uk_revenue_pct: float = 0,
) -> Dict[str, Any]:
    """
    Full FCA SDR assessment for a company.
    maturity_score: 0–100 ESG maturity score
    """
    # Determine SDR label
    label = "No Label (Article 6 Equivalent)"
    for lname, ldata in FCA_SDR_LABELS.items():
        if maturity_score >= ldata["min_score"]:
            label = lname
            break

    label_data = FCA_SDR_LABELS[label]

    # Anti-greenwashing check
    greenwashing_flags = []
    if maturity_score < 40 and uk_revenue_pct > 10:
        greenwashing_flags.append("Using 'sustainable' / 'green' claims without evidence — FCA anti-greenwashing rule applies")
    if not has_verified_data and maturity_score > 60:
        greenwashing_flags.append("Unverified emissions data undermines sustainability claims")

    # Readiness score for each pillar
    pillars = {
        "Governance": min(100, maturity_score + 5),
        "Strategy": min(100, maturity_score - 5) if maturity_score > 30 else maturity_score,
        "Risk Management": min(100, maturity_score + 10 if has_science_targets else maturity_score - 10),
        "Metrics & Targets": min(100, maturity_score + (15 if has_verified_data else -10)),
    }

    total_co2e = scope1_co2e + scope2_co2e + scope3_co2e

    return {
        "label": label,
        "label_description": label_data["description"],
        "label_color": label_data["color"],
        "readiness_score": maturity_score,
        "total_co2e": total_co2e,
        "uk_revenue_pct": uk_revenue_pct,
        "tcfd_gaps": _get_tcfd_gaps(maturity_score),
        "tcfd_pillars": pillars,
        "anti_greenwashing_flags": greenwashing_flags,
        "requirements": label_data["requirements"],
        "next_label": _next_label(label),
        "action_plan": _sdr_action_plan(maturity_score, has_science_targets, has_verified_data),
    }


def _next_label(current_label: str) -> Optional[Dict[str, Any]]:
    labels_order = list(FCA_SDR_LABELS.keys())
    idx = labels_order.index(current_label)
    if idx == 0:
        return None
    next_lname = labels_order[idx - 1]
    return {
        "name": next_lname,
        "min_score": FCA_SDR_LABELS[next_lname]["min_score"],
        "description": FCA_SDR_LABELS[next_lname]["description"],
    }


def _sdr_action_plan(score: int, has_targets: bool, has_verified: bool) -> List[Dict[str, str]]:
    actions = []
    if not has_verified:
        actions.append({"priority": "HIGH", "action": "Obtain third-party verification for Scope 1/2 emissions (ISO 14064-3)", "deadline": "Q4 2026"})
    if not has_targets:
        actions.append({"priority": "HIGH", "action": "Set Science-Based Targets (SBTi) aligned with 1.5°C pathway", "deadline": "Q1 2027"})
    if score < 60:
        actions.append({"priority": "MEDIUM", "action": "Complete Scope 3 value chain emissions inventory (15 categories)", "deadline": "Q3 2026"})
        actions.append({"priority": "MEDIUM", "action": "Register for UK CBAM transitional registry (if applicable)", "deadline": "Q2 2026"})
    if score < 80:
        actions.append({"priority": "LOW", "action": "Link executive remuneration to net-zero KPIs", "deadline": "Q2 2027"})
        actions.append({"priority": "LOW", "action": "Obtain I-REC certificates for UK clients", "deadline": "Q3 2026"})
    actions.append({"priority": "INFO", "action": "Draft Anti-Greenwashing policy per FCA Consumer Duty guidelines", "deadline": "Ongoing"})
    return actions


def assess_sfdr(
    maturity_score: int,
    taxonomy_alignment_pct: float = 0,
    sustainable_investment_pct: float = 0,
    pai_responses: Optional[Dict[int, Any]] = None,
    has_dnsh_assessment: bool = False,
    entity_type: str = "corporate",  # corporate, fund, bank
) -> Dict[str, Any]:
    """
    EU SFDR Article 6/8/9 classification.
    For corporates: entity-level disclosure (SFDR Article 4 PAI statement).
    For funds/banks: product-level classification.
    """
    # Classify article
    article = 6
    if maturity_score >= 70 and sustainable_investment_pct >= 50:
        article = 9
    elif maturity_score >= 45 or taxonomy_alignment_pct >= 10:
        article = 8

    article_data = SFDR_ARTICLES[article]

    # PAI coverage
    total_pai = len(PAI_INDICATORS)
    covered_pai = len(pai_responses or {})
    pai_coverage_pct = round(covered_pai / total_pai * 100)

    # EU Taxonomy alignment
    meets_taxonomy_threshold = taxonomy_alignment_pct >= article_data["min_taxonomy_pct"]

    return {
        "article": article,
        "article_name": article_data["name"],
        "article_description": article_data["description"],
        "article_color": article_data["color"],
        "criteria": article_data["criteria"],
        "taxonomy_alignment_pct": taxonomy_alignment_pct,
        "meets_taxonomy_threshold": meets_taxonomy_threshold,
        "taxonomy_threshold_required": article_data["min_taxonomy_pct"],
        "sustainable_investment_pct": sustainable_investment_pct,
        "pai_coverage_pct": pai_coverage_pct,
        "pai_covered": covered_pai,
        "pai_total": total_pai,
        "has_dnsh_assessment": has_dnsh_assessment,
        "entity_type": entity_type,
        "upgrade_path": _sfdr_upgrade_path(article, maturity_score, taxonomy_alignment_pct, sustainable_investment_pct),
        "mandatory_disclosures": _sfdr_mandatory_disclosures(article, entity_type),
    }


def _sfdr_upgrade_path(article: int, score: int, taxonomy_pct: float, si_pct: float) -> Optional[Dict]:
    if article == 9:
        return None
    next_article = article + 1
    next_data = SFDR_ARTICLES[next_article]
    gaps = []
    if score < 70 and next_article == 9:
        gaps.append(f"Raise ESG maturity score to 70+ (currently {score})")
    if si_pct < next_data["min_sustainable_investment_pct"]:
        gaps.append(f"Increase sustainable investment to {next_data['min_sustainable_investment_pct']}% (currently {si_pct}%)")
    if taxonomy_pct < next_data["min_taxonomy_pct"]:
        gaps.append(f"Raise EU Taxonomy alignment to {next_data['min_taxonomy_pct']}% (currently {taxonomy_pct}%)")
    return {"target_article": next_article, "target_name": next_data["name"], "gaps": gaps}


def _sfdr_mandatory_disclosures(article: int, entity_type: str) -> List[str]:
    base = [
        "Website disclosure: sustainability risk integration policy",
        "Pre-contractual disclosure (prospectus/KID) — sustainability risk statement",
        "Periodic report — sustainability-related information",
    ]
    if article >= 8:
        base += [
            "PAI statement (Principal Adverse Impacts) — Annual (website)",
            "Taxonomy alignment % disclosure",
            "Environmental/social characteristics methodology",
        ]
    if article == 9:
        base += [
            "Sustainable investment % + DNSH assessment",
            "Reference benchmark alignment",
            "Net-zero pathway disclosure",
        ]
    if entity_type == "bank":
        base.append("SFDR Article 4 PAI statement at entity level (mandatory for >500 employees)")
    return base


def full_assessment(
    company_name: str,
    maturity_score: int,
    scope1_co2e: float = 0,
    scope2_co2e: float = 0,
    scope3_co2e: float = 0,
    uk_revenue_pct: float = 0,
    eu_revenue_pct: float = 0,
    taxonomy_alignment_pct: float = 0,
    sustainable_investment_pct: float = 0,
    has_science_targets: bool = False,
    has_verified_data: bool = False,
    entity_type: str = "corporate",
) -> Dict[str, Any]:
    """Combined FCA SDR + EU SFDR assessment."""
    sdr = assess_fca_sdr(
        maturity_score=maturity_score,
        scope1_co2e=scope1_co2e,
        scope2_co2e=scope2_co2e,
        scope3_co2e=scope3_co2e,
        has_science_targets=has_science_targets,
        has_verified_data=has_verified_data,
        uk_revenue_pct=uk_revenue_pct,
    )
    sfdr = assess_sfdr(
        maturity_score=maturity_score,
        taxonomy_alignment_pct=taxonomy_alignment_pct,
        sustainable_investment_pct=sustainable_investment_pct,
        has_dnsh_assessment=has_verified_data,
        entity_type=entity_type,
    )

    # Overall readiness
    overall = round((maturity_score * 0.4 + sfdr["pai_coverage_pct"] * 0.2 +
                     (taxonomy_alignment_pct * 2 if taxonomy_alignment_pct <= 50 else 100) * 0.2 +
                     (80 if has_verified_data else 30) * 0.2))

    return {
        "company": company_name,
        "overall_readiness_pct": min(100, overall),
        "uk_revenue_pct": uk_revenue_pct,
        "eu_revenue_pct": eu_revenue_pct,
        "fca_sdr": sdr,
        "eu_sfdr": sfdr,
        "pai_indicators": PAI_INDICATORS,
        "uk_taxonomy_objectives": UK_TAXONOMY_OBJECTIVES,
        "jurisdiction_summary": {
            "uk": {
                "framework": "FCA SDR (PS22/3)",
                "status": sdr["label"],
                "color": sdr["label_color"],
                "applicable": uk_revenue_pct > 0 or entity_type in ("fund", "bank"),
            },
            "eu": {
                "framework": f"EU SFDR {sfdr['article_name']}",
                "status": sfdr["article_name"],
                "color": sfdr["article_color"],
                "applicable": eu_revenue_pct > 0 or entity_type in ("fund", "bank"),
            },
        },
    }


# ── Demo: Türk tekstil ihracatçısı ───────────────────────────────────────────
DEMO_RESULT = full_assessment(
    company_name="Yıldız Tekstil A.Ş.",
    maturity_score=58,
    scope1_co2e=128.4,
    scope2_co2e=73.8,
    scope3_co2e=365.2,
    uk_revenue_pct=22,
    eu_revenue_pct=35,
    taxonomy_alignment_pct=12,
    sustainable_investment_pct=0,
    has_science_targets=False,
    has_verified_data=False,
    entity_type="corporate",
)
