"""
SBTi (Science Based Targets initiative) Corporate Manual v2.0 Engine
Near-term (2030) + Long-term (2050/net-zero) targets
FLAG (Forest, Land and Agriculture) module
Temperature alignment scoring
"""
from dataclasses import dataclass, field
from typing import Any

# ── SBTi Commitment Stages ────────────────────────────────────────────────────
COMMITMENT_STAGES = [
    {"id": "not_committed", "label": "Taahhüt Yok",      "icon": "⭕", "color": "#ef4444", "desc": "Henüz SBTi taahhüdü verilmedi"},
    {"id": "committed",     "label": "Taahhüt Edildi",   "icon": "✍️", "color": "#f59e0b", "desc": "SBTi'ye taahhüt mektubu gönderildi (24 ay içinde hedef belirlenmeli)"},
    {"id": "targets_set",   "label": "Hedef Belirlendi", "icon": "🎯", "color": "#3b82f6", "desc": "Hedefler belirlendi, SBTi onayı bekleniyor"},
    {"id": "approved",      "label": "SBTi Onaylı",      "icon": "✅", "color": "#10b981", "desc": "Hedefler SBTi tarafından doğrulandı ve onaylandı"},
    {"id": "achieved",      "label": "Hedefe Ulaşıldı",  "icon": "🏆", "color": "#8b5cf6", "desc": "Onaylanan hedeflere ulaşıldı — Net Sıfır Lideri"},
]

# ── Sector Decarbonization Pathways (SDA — Sectoral Decarbonization Approach) ──
SECTOR_PATHWAYS = {
    "steel": {
        "label": "Çelik Üretimi", "icon": "🏗️",
        "method": "SDA", "unit": "tCO₂e/ton çelik",
        "2020_intensity": 1.85, "2030_target": 1.22, "2050_target": 0.05,
        "reduction_pct_2030": 34, "pathway": "1.5°C aligned",
        "notes": "DRI-EAF yeşil hidrojen geçişi, hurda oranı artışı",
    },
    "cement": {
        "label": "Çimento Üretimi", "icon": "🏭",
        "method": "SDA", "unit": "kgCO₂/ton çimento",
        "2020_intensity": 630, "2030_target": 520, "2050_target": 150,
        "reduction_pct_2030": 17, "pathway": "well-below 2°C",
        "notes": "Klinker-çimento oranı azaltımı, CCUS teknolojileri",
    },
    "tekstil": {
        "label": "Tekstil & Giyim", "icon": "👕",
        "method": "Absolute", "unit": "tCO₂e",
        "2020_intensity": None, "2030_target": None, "2050_target": None,
        "reduction_pct_2030": 42, "pathway": "1.5°C aligned",
        "notes": "Mutlak azaltma yöntemi; Kapsam 1+2+3 dahil. RE100 uyumu kritik.",
    },
    "gıda_içecek": {
        "label": "Gıda & İçecek", "icon": "🌾",
        "method": "SDA+FLAG", "unit": "tCO₂e",
        "2020_intensity": None, "2030_target": None, "2050_target": None,
        "reduction_pct_2030": 42, "pathway": "1.5°C aligned",
        "notes": "Tarımsal emisyonlar için FLAG ek hedefleri zorunlu (2024 itibariyle)",
    },
    "enerji": {
        "label": "Enerji Üretimi", "icon": "⚡",
        "method": "SDA", "unit": "gCO₂e/kWh",
        "2020_intensity": 415, "2030_target": 100, "2050_target": 5,
        "reduction_pct_2030": 76, "pathway": "1.5°C aligned",
        "notes": "Türkiye şebeke faktörü 2022: 415 gCO₂e/kWh (ETKB). Net sıfır için <5 gCO₂e/kWh.",
    },
    "finans": {
        "label": "Finans & Bankacılık", "icon": "🏦",
        "method": "PCAF-SBTi", "unit": "tCO₂e finanse edilen emisyon",
        "2020_intensity": None, "2030_target": None, "2050_target": None,
        "reduction_pct_2030": 50, "pathway": "Paris Aligned",
        "notes": "PCAF finanse edilen emisyonlar için SBTi Financial Institutions guidance (v2.0)",
    },
    "ulaşım": {
        "label": "Ulaşım & Lojistik", "icon": "🚛",
        "method": "SDA", "unit": "gCO₂e/tkm",
        "2020_intensity": 95, "2030_target": 65, "2050_target": 10,
        "reduction_pct_2030": 32, "pathway": "well-below 2°C",
        "notes": "EV geçişi, yakıt verimliliği, moddan moda kaymalar",
    },
    "inşaat": {
        "label": "İnşaat & Gayrimenkul", "icon": "🏢",
        "method": "SDA", "unit": "kgCO₂e/m²",
        "2020_intensity": 55, "2030_target": 30, "2050_target": 5,
        "reduction_pct_2030": 45, "pathway": "1.5°C aligned",
        "notes": "Binaların operasyonel + gömülü emisyonları dahil. CRREM uyumu.",
    },
}

# ── FLAG (Forest, Land and Agriculture) Module ────────────────────────────────
FLAG_SECTORS = ["gıda_içecek", "tekstil", "kağıt_orman", "kimya", "tüketici_ürünleri"]
FLAG_CATEGORIES = [
    {"id": "deforestation", "title": "Ormansızlaşma Kesme Tarihi", "target": "2025 ve sonrası sıfır ormansızlaşma"},
    {"id": "land_removal",  "title": "Arazi Karbon Tutma (Kaldırma)", "target": "Biyo-arazi ekosistemlerinde karbon tutma artırımı"},
    {"id": "ag_emissions",  "title": "Tarımsal Emisyon Azaltma", "target": "Enterik fermantasyon, gübre emisyonları azaltma"},
]

# ── Temperature Alignment Calculator ──────────────────────────────────────────
def calculate_temperature_alignment(
    current_emissions_tco2e: float,
    reduction_rate_pct_per_year: float,
    start_year: int = 2024,
) -> dict[str, Any]:
    """Calculate temperature alignment based on linear reduction trajectory."""
    trajectories: dict[str, float] = {
        "1.5C":         4.2,   # % annual reduction for 1.5°C alignment
        "well_below_2C": 2.5,
        "2C":            1.5,
    }
    alignment = "4°C+ (Paris Dışı)"
    alignment_color = "#ef4444"
    temp_label = "> 4°C"

    for label, required_rate in sorted(trajectories.items(), key=lambda x: x[1]):
        if reduction_rate_pct_per_year >= required_rate:
            if label == "1.5C":
                alignment, alignment_color, temp_label = "1.5°C Uyumlu ✅", "#10b981", "1.5°C"
            elif label == "well_below_2C":
                alignment, alignment_color, temp_label = "2°C Altı Uyumlu", "#3b82f6", "<2°C"
            elif label == "2C":
                alignment, alignment_color, temp_label = "2°C Uyumlu", "#f59e0b", "2°C"

    # Project emissions to 2030 and 2050
    def project(years: int) -> float:
        return round(current_emissions_tco2e * ((1 - reduction_rate_pct_per_year / 100) ** years), 1)

    years_to_2030 = 2030 - start_year
    years_to_2050 = 2050 - start_year

    return {
        "alignment": alignment,
        "alignment_color": alignment_color,
        "temp_label": temp_label,
        "current_tco2e": current_emissions_tco2e,
        "reduction_rate_pct": reduction_rate_pct_per_year,
        "projected_2030": project(years_to_2030),
        "projected_2050": project(years_to_2050),
        "required_1_5C": round(current_emissions_tco2e * ((1 - 0.042) ** years_to_2030), 1),
        "required_2C":   round(current_emissions_tco2e * ((1 - 0.015) ** years_to_2030), 1),
        "gap_to_1_5C":   round(project(years_to_2030) - current_emissions_tco2e * ((1 - 0.042) ** years_to_2030), 1),
    }


# ── Near-term Target Calculator ────────────────────────────────────────────────
def calculate_near_term_target(
    base_year: int,
    base_year_emissions_tco2e: float,
    scope1_pct: float = 40.0,
    scope2_pct: float = 20.0,
    scope3_pct: float = 40.0,
    sector: str = "tekstil",
    method: str = "absolute",
) -> dict[str, Any]:
    """
    Calculate near-term SBTi targets (2025–2030).
    method: 'absolute' | 'intensity'
    """
    pathway = SECTOR_PATHWAYS.get(sector, {})
    reduction_pct = pathway.get("reduction_pct_2030", 42)  # default 42% for 1.5°C

    target_year = base_year + min(10, 2030 - base_year)
    target_emissions = round(base_year_emissions_tco2e * (1 - reduction_pct / 100), 1)

    scope1_2_base = base_year_emissions_tco2e * (scope1_pct + scope2_pct) / 100
    scope3_base = base_year_emissions_tco2e * scope3_pct / 100

    return {
        "base_year": base_year,
        "target_year": target_year,
        "method": method,
        "sector": sector,
        "sector_label": pathway.get("label", sector),
        "pathway": pathway.get("pathway", "1.5°C aligned"),
        "base_emissions": base_year_emissions_tco2e,
        "target_emissions": target_emissions,
        "reduction_pct": reduction_pct,
        "annual_reduction_needed": round(reduction_pct / (target_year - base_year), 1),
        "scope1_2_target": round(scope1_2_base * (1 - 0.42), 1),
        "scope3_target": round(scope3_base * (1 - 0.25), 1),  # Scope 3: min 25% reduction
        "flag_required": sector in FLAG_SECTORS,
        "notes": pathway.get("notes", ""),
        "milestones": _milestones(base_year, base_year_emissions_tco2e, reduction_pct, target_year),
    }


def _milestones(base_year: int, base: float, reduction_pct: float, target_year: int) -> list[dict]:
    years = list(range(base_year + 1, target_year + 1, 2))
    total_years = target_year - base_year
    return [
        {
            "year": y,
            "emissions": round(base * (1 - reduction_pct / 100 * (y - base_year) / total_years), 1),
            "reduction_pct_achieved": round(reduction_pct * (y - base_year) / total_years, 1),
        }
        for y in years
    ]


# ── Long-term Net Zero Target ─────────────────────────────────────────────────
def calculate_net_zero_target(
    base_year_emissions_tco2e: float,
    sector: str = "tekstil",
) -> dict[str, Any]:
    return {
        "net_zero_year": 2050,
        "residual_emissions_pct": 5,
        "residual_tco2e": round(base_year_emissions_tco2e * 0.05, 1),
        "neutralization_needed_tco2e": round(base_year_emissions_tco2e * 0.05, 1),
        "long_term_reduction_pct": 90,
        "standard": "SBTi Corporate Net-Zero Standard (2021)",
        "abatement_pathway": "Kapsam 1+2+3'te %90 mutlak azaltma → Kalan %5 kalıcı karbon kaldırma ile nötralize",
        "removal_options": ["Direkt hava tutma (DAC)", "Biyo-enerji + CCS (BECCS)", "Doğal çözümler (orman/toprak)"],
    }


# ── Full SBTi Assessment ───────────────────────────────────────────────────────
def full_sbti_assessment(
    company_name: str,
    sector: str,
    base_year: int,
    total_emissions_tco2e: float,
    current_annual_reduction_pct: float = 2.0,
    commitment_stage: str = "committed",
    has_flag: bool = False,
) -> dict[str, Any]:
    near_term = calculate_near_term_target(base_year, total_emissions_tco2e, sector=sector)
    net_zero = calculate_net_zero_target(total_emissions_tco2e, sector)
    temp_align = calculate_temperature_alignment(total_emissions_tco2e, current_annual_reduction_pct)
    stage_info = next((s for s in COMMITMENT_STAGES if s["id"] == commitment_stage), COMMITMENT_STAGES[0])
    sector_path = SECTOR_PATHWAYS.get(sector, {})

    return {
        "company_name": company_name,
        "sector": sector,
        "base_year": base_year,
        "total_emissions_tco2e": total_emissions_tco2e,
        "commitment_stage": commitment_stage,
        "stage_info": stage_info,
        "near_term": near_term,
        "net_zero": net_zero,
        "temperature_alignment": temp_align,
        "sector_pathway": sector_path,
        "flag_module": {
            "required": sector in FLAG_SECTORS or has_flag,
            "categories": FLAG_CATEGORIES if (sector in FLAG_SECTORS or has_flag) else [],
            "note": "FLAG hedefleri 2024 yılı itibarıyla gıda, tekstil ve kağıt-orman sektörlerinde zorunludur.",
        } if (sector in FLAG_SECTORS or has_flag) else {"required": False},
        "commitment_stages": COMMITMENT_STAGES,
        "sector_pathways": list(SECTOR_PATHWAYS.values()),
        "next_actions": _next_actions(commitment_stage, temp_align, sector),
    }


def _next_actions(stage: str, align: dict, sector: str) -> list[str]:
    actions = []
    if stage == "not_committed":
        actions.append("SBTi taahhüt mektubunu imzalayın — sbti.org/companies üzerinden ücretsiz başvuru yapabilirsiniz")
    if stage in ("not_committed", "committed"):
        actions.append(f"Baz yılı emisyonlarını GHG Protocol metodolojisiyle doğrulayın (Kapsam 1+2+3)")
    if align["temp_label"] not in ("1.5°C", "<2°C"):
        actions.append(f"Mevcut yıllık azaltma hızı (%{align['reduction_rate_pct']:.1f}) 1.5°C hedefi için yetersiz — %4.2/yıl hedefleyin")
    if sector in FLAG_SECTORS:
        actions.append("FLAG hedefleri zorunlu: 2025 sıfır ormansızlaşma taahhüdü ekleyin")
    actions.append("RE100 ile yenilenebilir enerji taahhüdü Kapsam 2 emisyonlarını hızla azaltır")
    return actions[:5]


DEMO_RESULT = full_sbti_assessment(
    company_name="Yıldız Tekstil A.Ş.",
    sector="tekstil",
    base_year=2021,
    total_emissions_tco2e=12840.0,
    current_annual_reduction_pct=2.5,
    commitment_stage="committed",
)
