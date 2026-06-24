"""
Kredi Puanlama Servisi — Bankalar için ESG kredi risk değerlendirmesi.
Faktörler: Emisyon yoğunluğu, TSRS uyum skoru, sektör riski, coğrafi risk.
Sadece auditor/admin rolleri erişebilir.
"""
from dataclasses import dataclass
from typing import Optional

# Sektör bazlı temel risk skorları (düşük = daha riskli)
_SECTOR_BASE_SCORES: dict[str, int] = {
    "bankacılık": 72,
    "imalat": 55,
    "çimento": 35,
    "enerji": 42,
    "perakende": 65,
    "inşaat": 48,
    "sigorta": 70,
    "rafineri": 28,
    "gıda": 58,
    "teknoloji": 78,
    "diğer": 50,
}

# Coğrafi risk skorları (Türkiye il bazlı deprem bölgeleri)
_GEOGRAPHIC_RISK: dict[str, dict] = {
    "istanbul":  {"earthquake": 0.85, "flood": 0.60, "drought": 0.35},
    "ankara":    {"earthquake": 0.50, "flood": 0.30, "drought": 0.55},
    "izmir":     {"earthquake": 0.90, "flood": 0.45, "drought": 0.50},
    "bursa":     {"earthquake": 0.75, "flood": 0.40, "drought": 0.30},
    "antalya":   {"earthquake": 0.60, "flood": 0.55, "drought": 0.70},
    "konya":     {"earthquake": 0.30, "flood": 0.25, "drought": 0.80},
    "kocaeli":   {"earthquake": 0.88, "flood": 0.50, "drought": 0.30},
    "zurich":    {"earthquake": 0.15, "flood": 0.20, "drought": 0.10},
    "default":   {"earthquake": 0.55, "flood": 0.40, "drought": 0.45},
}


@dataclass
class CreditScore:
    company_id: str
    company_name: str
    sector: str
    total_score: int          # 0-100
    risk_category: str        # Düşük / Orta / Yüksek / Çok Yüksek
    rating: str               # AAA → D (borç derecelendirme ölçeği)
    components: dict
    recommendations: list[str]
    eligible_for_green_bond: bool
    eligible_for_sustainability_linked: bool


def calculate_credit_score(
    company_id: str,
    company_name: str,
    sector: str,
    carbon_intensity: float,
    sector_carbon_avg: float,
    tsrs_compliance_score: Optional[int] = None,
    total_emissions: float = 0,
    revenue_tl: float = 0,
    city: str = "default",
    renewable_pct: float = 0,
    has_sbti_commitment: bool = False,
    has_third_party_assurance: bool = False,
) -> CreditScore:
    """0-100 arası kredi puanı hesapla."""
    sector_key = sector.lower()
    base = _SECTOR_BASE_SCORES.get(sector_key, 50)
    geo = _GEOGRAPHIC_RISK.get(city.lower(), _GEOGRAPHIC_RISK["default"])

    # 1. Emisyon yoğunluğu skoru (0-30 puan)
    if sector_carbon_avg > 0:
        ratio = carbon_intensity / sector_carbon_avg
        if ratio <= 0.5:
            emission_score = 30
        elif ratio <= 0.75:
            emission_score = 24
        elif ratio <= 1.0:
            emission_score = 18
        elif ratio <= 1.5:
            emission_score = 10
        else:
            emission_score = 3
    else:
        emission_score = 15

    # 2. TSRS uyum skoru (0-25 puan)
    tsrs_score = 0
    if tsrs_compliance_score is not None:
        tsrs_score = int(tsrs_compliance_score / 100 * 25)
    elif has_third_party_assurance:
        tsrs_score = 18
    else:
        tsrs_score = 8

    # 3. Sektör riski (0-20 puan)
    sector_score = int(base / 100 * 20)

    # 4. Coğrafi risk (0-15 puan)
    geo_risk_avg = (geo["earthquake"] + geo["flood"] + geo["drought"]) / 3
    geo_score = int((1 - geo_risk_avg) * 15)

    # 5. Stratejik aksiyonlar (0-10 puan)
    action_score = 0
    if has_sbti_commitment:
        action_score += 5
    if renewable_pct >= 50:
        action_score += 3
    elif renewable_pct >= 25:
        action_score += 1
    if has_third_party_assurance:
        action_score += 2
    action_score = min(10, action_score)

    total = emission_score + tsrs_score + sector_score + geo_score + action_score
    total = max(0, min(100, total))

    # Risk kategorisi
    if total >= 75:
        risk_category = "Düşük"
        rating = "AAA" if total >= 90 else ("AA" if total >= 82 else "A")
    elif total >= 55:
        risk_category = "Orta"
        rating = "BBB" if total >= 65 else "BB"
    elif total >= 35:
        risk_category = "Yüksek"
        rating = "B" if total >= 45 else "CCC"
    else:
        risk_category = "Çok Yüksek"
        rating = "CC" if total >= 20 else "D"

    eligible_green_bond = total >= 65 and (renewable_pct >= 30 or has_sbti_commitment)
    eligible_sll = total >= 55 and tsrs_compliance_score is not None and tsrs_compliance_score >= 50

    recommendations = _build_credit_recommendations(
        emission_score, tsrs_score, geo_score, has_sbti_commitment, renewable_pct, total
    )

    return CreditScore(
        company_id=company_id,
        company_name=company_name,
        sector=sector,
        total_score=total,
        risk_category=risk_category,
        rating=rating,
        components={
            "emission_intensity": {"score": emission_score, "max": 30, "label": "Emisyon Yoğunluğu"},
            "tsrs_compliance": {"score": tsrs_score, "max": 25, "label": "TSRS Uyumu"},
            "sector_risk": {"score": sector_score, "max": 20, "label": "Sektör Riski"},
            "geographic_risk": {"score": geo_score, "max": 15, "label": "Coğrafi Risk"},
            "strategic_actions": {"score": action_score, "max": 10, "label": "Stratejik Aksiyonlar"},
        },
        recommendations=recommendations,
        eligible_for_green_bond=eligible_green_bond,
        eligible_for_sustainability_linked=eligible_sll,
    )


def _build_credit_recommendations(
    emission_score: int,
    tsrs_score: int,
    geo_score: int,
    has_sbti: bool,
    renewable_pct: float,
    total: int,
) -> list[str]:
    recs = []
    if emission_score < 15:
        recs.append("Emisyon yoğunluğu kredi notunu düşürüyor. Kapsam 1 azaltım planı oluşturun.")
    if tsrs_score < 15:
        recs.append("TSRS raporlaması yetersiz. KGK uyumlu rapor ve bağımsız güvence alın.")
    if not has_sbti:
        recs.append("SBTi taahhüdü vererek 5-8 puan kazanabilir, Sürdürülebilir Bağlantılı Kredi faiz avantajı elde edebilirsiniz.")
    if renewable_pct < 30:
        recs.append(f"Yenilenebilir enerji oranı (%{renewable_pct:.0f}) düşük. %50+ ile yeşil tahvil ihraç edebilirsiniz.")
    if geo_score < 8:
        recs.append("Yüksek coğrafi risk bölgesindesiniz. Fiziksel risk adaptasyon planı (TCFD) hazırlayın.")
    if total >= 65:
        recs.append("Yeşil Tahvil / KKM Yeşil Mevduat ihracı için uygun profile sahipsiniz.")
    return recs
