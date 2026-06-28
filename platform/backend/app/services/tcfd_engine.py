"""
TCFD (Task Force on Climate-related Financial Disclosures) Senaryo Motoru.
3 senaryo: Paris 2°C · NDC · BAU 4°C
Çıktı: Fiziksel Risk + Geçiş Riski + Finansal Etki Matrisi
"""
from dataclasses import dataclass, field
from typing import Dict, List


# Karbon fiyat yörüngeleri (€/tCO2e) — IEA World Energy Outlook 2024
CARBON_PRICE_2030 = {
    "paris_2c": 130,   # NZE (Net Zero Emissions) senaryosu
    "ndc":       75,   # APS (Announced Pledges Scenario)
    "bau_4c":    25,   # STEPS (Stated Policies Scenario)
}
CARBON_PRICE_2050 = {
    "paris_2c": 250,
    "ndc":      140,
    "bau_4c":    40,
}

# Fiziksel risk çarpanları (1.0 = baz risk; yüksek = daha çok zarar)
PHYSICAL_RISK_MULTIPLIER = {
    "paris_2c": 1.2,   # Sınırlı ısınma → sınırlı fiziksel hasar
    "ndc":      1.8,   # Orta düzey ısınma
    "bau_4c":   3.5,   # 4°C ısınma → aşırı hava olayları çok artıyor
}

# Sektörel CAPEX uyum maliyeti katsayısı (% of annual revenue)
SECTOR_TRANSITION_COST_PCT = {
    "çelik":          0.08,
    "çimento":        0.07,
    "alüminyum":      0.06,
    "tekstil":        0.03,
    "gıda":           0.02,
    "bankacılık":     0.01,
    "enerji":         0.12,
    "lojistik":       0.05,
    "üretim":         0.04,
    "teknoloji":      0.01,
    "perakende":      0.02,
    "default":        0.03,
}


@dataclass
class ScenarioResult:
    scenario_id: str
    scenario_label: str
    temp_rise: str
    carbon_price_2030: int
    carbon_price_2050: int
    physical_risk_score: int           # 0-100
    transition_risk_score: int         # 0-100
    stranded_asset_risk: str           # low / medium / high / critical
    cbam_exposure_eur: float           # AB sınırında ödenecek tahmini vergi (yıllık)
    transition_capex_eur: float        # Uyum için gereken CAPEX
    physical_damage_eur: float         # Aşırı hava olaylarından beklenen zarar
    net_financial_impact_eur: float    # Toplam etki (negatif = zarar)
    opportunities: List[str]
    risks: List[str]
    recommendation: str


@dataclass
class TCFDMatrix:
    company_name: str
    sector: str
    annual_revenue_eur: float
    total_co2e: float
    scenarios: List[ScenarioResult]
    summary: str


def _stranded_asset_risk(transition_score: int) -> str:
    if transition_score >= 80: return "critical"
    if transition_score >= 60: return "high"
    if transition_score >= 40: return "medium"
    return "low"


def run_tcfd_scenarios(
    sector: str,
    annual_revenue_eur: float,
    total_co2e: float,
    physical_risk_base: int = 40,      # 0-100 fiziksel risk skoru (uydu/AFAD verisinden)
    goods_exported_tons: float = 0,    # CBAM kapsamı için ihracat hacmi
    eu_ets_price: float = 71.0,
) -> TCFDMatrix:

    sector_key = sector.lower()
    transition_cost_pct = SECTOR_TRANSITION_COST_PCT.get(sector_key, SECTOR_TRANSITION_COST_PCT["default"])

    scenarios: List[ScenarioResult] = []

    for sid, slabel, stemp in [
        ("paris_2c", "Paris Uyumlu (2°C)", "1.5–2°C"),
        ("ndc",      "Mevcut Taahhütler (NDC)", "2.5–3°C"),
        ("bau_4c",   "İş-Her-Zamanki-Gibi (BAU)", "3.5–4°C"),
    ]:
        cp_2030 = CARBON_PRICE_2030[sid]
        cp_2050 = CARBON_PRICE_2050[sid]
        phys_mult = PHYSICAL_RISK_MULTIPLIER[sid]

        # Geçiş riski skoru: yüksek karbon fiyatı → yüksek geçiş riski (yüksek emisyon şirketi için)
        carbon_intensity = total_co2e / max(annual_revenue_eur / 1_000_000, 0.1)  # tCO2e / M€
        transition_risk = min(100, int((cp_2030 / 130) * (carbon_intensity / 5) * 50))

        # Fiziksel risk skoru: BAU'da iklim hasar çok artar
        physical_risk = min(100, int(physical_risk_base * phys_mult))

        # CBAM maruziyeti: ihracat × karbon fiyatı farkı (AB ETS - Türkiye karbon fiyatı)
        tr_carbon_price = 8.0  # Türkiye gönüllü karbon piyasası ~€8
        cbam_gap = max(0, cp_2030 - tr_carbon_price)
        # Basitleştirilmiş: görevli emisyon = 1.5 tCO2e/ton ürün ortalama
        cbam_exposure = goods_exported_tons * 1.5 * cbam_gap if goods_exported_tons > 0 else total_co2e * 0.3 * cbam_gap * 0.1

        # Uyum CAPEX: 2°C'de yüksek, BAU'da düşük (hiç yatırım yapmıyorsunuz)
        capex_multiplier = {"paris_2c": 1.0, "ndc": 0.6, "bau_4c": 0.1}[sid]
        transition_capex = annual_revenue_eur * transition_cost_pct * capex_multiplier

        # Fiziksel hasar: BAU'da en yüksek (sel/kuraklık/fırtına)
        phys_damage_base = annual_revenue_eur * 0.005  # baz %0.5 hasar
        physical_damage = phys_damage_base * phys_mult

        # Net etki: 2°C'de CAPEX yüksek ama zarar az; BAU'da zarar yüksek
        net_impact = -(transition_capex + physical_damage + cbam_exposure)

        # Fırsatlar ve riskler senaryo bazında
        if sid == "paris_2c":
            opportunities = [
                "Yeşil tahvil ihracı için AAA ESG notu avantajı",
                "AB Taksonomisi uyumlu yatırımcı erişimi",
                "Erken geçiş yapanlar için yeşil CAPEX teşvikleri (IRA, CBAM muafiyeti)",
            ]
            risks = [
                f"Yüksek karbon vergisi (€{cp_2030}/tCO2e 2030'da) geçiş CAPEX'ini artırıyor",
                "Fosil yakıt varlıklarında değer kaybı (stranded assets)",
            ]
            rec = "Paris senaryosu en düşük uzun vadeli maliyeti sunar. SBTi hedefi belirleyin ve MACC planını uygulayın."
        elif sid == "ndc":
            opportunities = [
                "Orta vadeli karbon fiyat artışından korunma (hedging)",
                "Sektörel AB yeşil yatırım programlarına erişim",
            ]
            risks = [
                "Artan sel/kuraklık sıklığı operasyonel aksamalara yol açıyor",
                f"CBAM yükü yıllık €{cbam_exposure:,.0f} düzeyinde",
                "Tedarik zinciri iklim kesintileri",
            ]
            rec = "NDC senaryosunda geçiş planlaması acildir. Yenilenebilir enerji geçişini 2027'ye çekin."
        else:
            opportunities = [
                "Kısa vadede düşük karbon fiyatı maliyeti",
                "Fosil yakıt altyapısında geçici rekabet avantajı",
            ]
            risks = [
                f"2050'de €{cp_2050}/tCO2e karbon vergisi — hazırlıksız şirketler için varoluşsal risk",
                f"Aşırı hava olayları yıllık €{physical_damage:,.0f} hasara yol açıyor",
                "Yeşil finansa erişim kapanıyor — Londra ve AB sermayesi ESG şartı koşuyor",
                "CBAM + EUDR uyumsuzluğu ihracat lisansını riske atıyor",
                "Stranded asset riski: TESİS değeri %40-60 düşebilir",
            ]
            rec = "BAU senaryosu en yıkıcı uzun vadeli sonucu. Acil yeşil dönüşüm planı gereklidir."

        scenarios.append(ScenarioResult(
            scenario_id=sid,
            scenario_label=slabel,
            temp_rise=stemp,
            carbon_price_2030=cp_2030,
            carbon_price_2050=cp_2050,
            physical_risk_score=physical_risk,
            transition_risk_score=transition_risk,
            stranded_asset_risk=_stranded_asset_risk(transition_risk),
            cbam_exposure_eur=round(cbam_exposure, 0),
            transition_capex_eur=round(transition_capex, 0),
            physical_damage_eur=round(physical_damage, 0),
            net_financial_impact_eur=round(net_impact, 0),
            opportunities=opportunities,
            risks=risks,
            recommendation=rec,
        ))

    best = min(scenarios, key=lambda s: abs(s.net_financial_impact_eur))
    summary = (
        f"{sector.capitalize()} sektöründe yıllık {total_co2e:,.0f} tCO2e emisyon ile "
        f"en düşük finansal etki {best.scenario_label} senaryosunda "
        f"€{abs(best.net_financial_impact_eur):,.0f} toplam yük öngörülüyor. "
        "Paris uyumlu senaryo uzun vadede en düşük riski ve en yüksek yeşil finansman erişimini sağlar."
    )

    return TCFDMatrix(
        company_name="",
        sector=sector,
        annual_revenue_eur=annual_revenue_eur,
        total_co2e=total_co2e,
        scenarios=scenarios,
        summary=summary,
    )
