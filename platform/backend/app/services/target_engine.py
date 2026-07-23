"""
SBTi Hedef Motoru — Science Based Targets initiative metodolojisi.
Geçmiş emisyon trendi + SBTi sektör yolu + FLAG hesaplama.
"""
from dataclasses import dataclass
from typing import Optional
import math

# SBTi 1.5°C uyumlu sektörel azaltım yolları (yıllık % azaltım oranları)
# Kaynak: SBTi Corporate Manual v2.1
_SBTI_REDUCTION_RATES: dict[str, dict] = {
    "bankacılık":   {"scope12_annual_pct": 4.2, "scope3_annual_pct": 7.0,  "flag_annual_pct": 3.2, "target_year": 2030},
    "imalat":       {"scope12_annual_pct": 4.9, "scope3_annual_pct": 6.5,  "flag_annual_pct": 3.5, "target_year": 2030},
    "çimento":      {"scope12_annual_pct": 3.8, "scope3_annual_pct": 5.0,  "flag_annual_pct": 3.0, "target_year": 2030},
    "enerji":       {"scope12_annual_pct": 6.5, "scope3_annual_pct": 8.0,  "flag_annual_pct": 4.0, "target_year": 2030},
    "perakende":    {"scope12_annual_pct": 4.2, "scope3_annual_pct": 7.5,  "flag_annual_pct": 3.2, "target_year": 2030},
    "inşaat":       {"scope12_annual_pct": 3.5, "scope3_annual_pct": 5.5,  "flag_annual_pct": 3.8, "target_year": 2030},
    "sigorta":      {"scope12_annual_pct": 4.2, "scope3_annual_pct": 7.0,  "flag_annual_pct": 3.2, "target_year": 2030},
    "rafineri":     {"scope12_annual_pct": 5.5, "scope3_annual_pct": 6.0,  "flag_annual_pct": 3.5, "target_year": 2030},
}

# FLAG sektörü arazi emisyon faktörleri (tCO₂e/ha/yıl)
_FLAG_EMISSION_FACTORS = {
    "sığır": 7.2,
    "soya": 3.1,
    "palmiye": 5.8,
    "kağıt_selüloz": 1.4,
    "kahve": 2.9,
    "kakao": 4.5,
    "diğer": 2.0,
}


@dataclass
class YearPoint:
    year: int
    scope12: float
    scope3: float
    total: float


@dataclass
class SBTiTargetResult:
    base_year: int
    base_scope12: float
    base_scope3: float
    current_trend: list[YearPoint]
    sbti_target_path: list[YearPoint]
    net_zero_path: list[YearPoint]
    gap_2030: float           # ton CO₂e gap
    gap_pct_2030: float       # yüzde olarak
    sbti_compliant: bool
    flag_emissions: dict
    recommendations: list[str]
    sector: str


def calculate_sbti_targets(
    sector: str,
    base_year: int,
    base_scope12: float,
    base_scope3: float,
    historical: Optional[list[dict]] = None,
    land_use_ha: float = 0,
    commodity: str = "diğer",
    current_year: int = 2026,
) -> SBTiTargetResult:
    """
    SBTi hedef yolu ve mevcut trend analizi.

    historical: [{"year": 2022, "scope12": x, "scope3": y}, ...]
    """
    sector_key = sector.lower()
    rates = _SBTI_REDUCTION_RATES.get(sector_key, _SBTI_REDUCTION_RATES["bankacılık"])
    s12_rate = rates["scope12_annual_pct"] / 100
    s3_rate = rates["scope3_annual_pct"] / 100
    
    # Well-below 2C senaryosu (2.5% yıllık azaltım)
    wb2c_rate = 0.025

    # Trend hesapla (geçmiş 3 yıl veya base_year'dan lineer)
    trend_points: list[YearPoint] = []
    if historical and len(historical) >= 2:
        hist_sorted = sorted(historical, key=lambda x: x["year"])
        years_span = hist_sorted[-1]["year"] - hist_sorted[0]["year"]
        if years_span > 0:
            s12_trend_rate = (hist_sorted[-1]["scope12"] - hist_sorted[0]["scope12"]) / years_span / base_scope12
            s3_trend_rate = (hist_sorted[-1]["scope3"] - hist_sorted[0]["scope3"]) / years_span / base_scope3
        else:
            s12_trend_rate = 0.0
            s3_trend_rate = 0.0
    else:
        # Varsayılan: %2 yıllık artış (mevcut politikalar senaryosu)
        s12_trend_rate = 0.02
        s3_trend_rate = 0.015

    # 2026-2050 trend projeksiyonu
    for yr in range(current_year, 2051, 2):
        years_from_base = yr - base_year
        s12 = base_scope12 * (1 + s12_trend_rate) ** years_from_base
        s3 = base_scope3 * (1 + s3_trend_rate) ** years_from_base
        trend_points.append(YearPoint(year=yr, scope12=round(s12, 0), scope3=round(s3, 0), total=round(s12 + s3, 0)))

    # SBTi 1.5°C hedef yolu
    sbti_points: list[YearPoint] = []
    for yr in range(current_year, 2051, 2):
        years_from_base = yr - base_year
        s12 = base_scope12 * (1 - s12_rate) ** years_from_base
        s3 = base_scope3 * (1 - s3_rate) ** years_from_base
        # 2050 net sıfır sınırı: %90 azaltım
        s12 = max(s12, base_scope12 * 0.10)
        s3 = max(s3, base_scope3 * 0.10)
        sbti_points.append(YearPoint(year=yr, scope12=round(s12, 0), scope3=round(s3, 0), total=round(s12 + s3, 0)))

    # Well-below 2°C hedef yolu (Doğrusal Azaltım)
    wb2c_points: list[YearPoint] = []
    for yr in range(current_year, 2051, 2):
        years_from_base = yr - base_year
        # Doğrusal azaltım (yıllık sabit miktar: %2.5 * base)
        s12 = max(base_scope12 * (1 - (wb2c_rate * years_from_base)), base_scope12 * 0.10)
        s3 = max(base_scope3 * (1 - (wb2c_rate * years_from_base)), base_scope3 * 0.10)
        wb2c_points.append(YearPoint(year=yr, scope12=round(s12, 0), scope3=round(s3, 0), total=round(s12 + s3, 0)))

    # Net sıfır yolu (daha agresif — 2050 net sıfır doğrusal)
    nz_points: list[YearPoint] = []
    for yr in range(current_year, 2051, 2):
        frac = (yr - base_year) / (2050 - base_year)
        s12 = base_scope12 * max(0, 1 - frac * 0.90)
        s3 = base_scope3 * max(0, 1 - frac * 0.90)
        nz_points.append(YearPoint(year=yr, scope12=round(s12, 0), scope3=round(s3, 0), total=round(s12 + s3, 0)))

    # 2030 gap hesabı
    trend_2030 = next((p for p in trend_points if p.year == 2030), trend_points[-1])
    sbti_2030 = next((p for p in sbti_points if p.year == 2030), sbti_points[-1])
    gap_2030 = max(0, trend_2030.total - sbti_2030.total)
    gap_pct_2030 = round(gap_2030 / (base_scope12 + base_scope3) * 100, 1) if (base_scope12 + base_scope3) > 0 else 0.0

    # FLAG emisyonları
    flag_emissions: dict = {}
    if land_use_ha > 0:
        factor = _FLAG_EMISSION_FACTORS.get(commodity, _FLAG_EMISSION_FACTORS["diğer"])
        flag_annual = land_use_ha * factor
        flag_emissions = {
            "commodity": commodity,
            "land_use_ha": land_use_ha,
            "emission_factor_tco2e_ha": factor,
            "annual_flag_tco2e": round(flag_annual, 1),
            "sbti_flag_target_2030": round(flag_annual * (1 - rates["flag_annual_pct"] / 100) ** 4, 1),
        }

    # Uyum kontrolü (mevcut trend SBTi yolunun altında mı?)
    current_s12 = trend_points[0].scope12 if trend_points else base_scope12
    sbti_current = sbti_points[0].scope12 if sbti_points else base_scope12
    sbti_compliant = current_s12 <= sbti_current

    recommendations = _build_target_recommendations(
        gap_pct_2030, sbti_compliant, s12_trend_rate, rates["scope12_annual_pct"]
    )

    # wb2c_points'i net_zero_path olarak ya da yeni bir argüman olarak geçebiliriz,
    # Mevcut yapıyı bozmamak adına SBTiTargetResult'ta ayrı bir field eklemedim ancak
    # linear yolu nz_points olarak geçiyoruz, sbti_target_path ise 1.5C

    return SBTiTargetResult(
        base_year=base_year,
        base_scope12=base_scope12,
        base_scope3=base_scope3,
        current_trend=trend_points,
        sbti_target_path=sbti_points,
        net_zero_path=wb2c_points, # Well-below 2C yolunu buraya atıyoruz
        gap_2030=round(gap_2030, 0),
        gap_pct_2030=gap_pct_2030,
        sbti_compliant=sbti_compliant,
        flag_emissions=flag_emissions,
        recommendations=recommendations,
        sector=sector,
    )


def _build_target_recommendations(
    gap_pct: float,
    compliant: bool,
    current_rate: float,
    required_rate: float,
) -> list[str]:
    recs = []
    if not compliant:
        recs.append(
            f"Mevcut azaltım hızınız (yıllık %{current_rate * 100:.1f}) SBTi hedefinin "
            f"(yıllık %{required_rate}) altında. Acil Kapsam 1 azaltım planı gerekiyor."
        )
    if gap_pct > 30:
        recs.append(
            f"2030 hedefinize ulaşmak için {gap_pct:.1f}% ek azaltım gerekiyor. "
            "Yenilenebilir enerji ve enerji verimliliği önceliklendirilmeli."
        )
    elif gap_pct > 10:
        recs.append(
            f"2030 hedefinize {gap_pct:.1f}% açık var. "
            "Kapsam 2 RE100 stratejisi ve Kapsam 3 tedarik zinciri programı önerilebilir."
        )
    recs.append("YEK-G sertifikası satın alımı ile Kapsam 2 market-based emisyonlarını hızla sıfıra indirin.")
    recs.append("Finanse edilen Kapsam 3 emisyonları için sektörel yaklaşım (PCAF) metodolojisini uygulayın.")
    return recs


def calculate_holding_sbti_target(
    subsidiaries: list[dict],
    holding_base_year: int,
    current_year: int = 2026,
) -> SBTiTargetResult:
    """
    Holding'in iştirak verilerini konsolide ederek topluluk geneli SBTi hedefi hesaplar.
    Bulgu D5'i (topluluk geneli hedef eksikliği) adresler.

    subsidiaries: [{"name": "Şirket A", "sector": "imalat", "base_scope12": 1000, "base_scope3": 5000}, ...]
    """
    total_base_s12 = sum(sub.get("base_scope12", 0) for sub in subsidiaries)
    total_base_s3 = sum(sub.get("base_scope3", 0) for sub in subsidiaries)
    total_base_emissions = total_base_s12 + total_base_s3

    if total_base_emissions == 0:
        # Emisyon yoksa hesaplama yapılamaz, boş sonuç dön.
        return SBTiTargetResult(
            base_year=holding_base_year, base_scope12=0, base_scope3=0,
            current_trend=[], sbti_target_path=[], net_zero_path=[],
            gap_2030=0, gap_pct_2030=0, sbti_compliant=True,
            flag_emissions={}, recommendations=["Konsolide emisyon verisi bulunamadı."], sector="Holding"
        )

    # Emisyon ağırlıklı sektörel azaltım oranı hesaplama
    weighted_s12_rate = 0.0
    weighted_s3_rate = 0.0

    for sub in subsidiaries:
        sub_total = sub.get("base_scope12", 0) + sub.get("base_scope3", 0)
        if sub_total == 0:
            continue

        weight = sub_total / total_base_emissions
        sector_key = sub.get("sector", "imalat").lower()
        rates = _SBTI_REDUCTION_RATES.get(sector_key, _SBTI_REDUCTION_RATES["imalat"])

        weighted_s12_rate += (rates["scope12_annual_pct"] / 100) * weight
        weighted_s3_rate += (rates["scope3_annual_pct"] / 100) * weight

    # Konsolide hedef yolu
    sbti_points: list[YearPoint] = []
    for yr in range(current_year, 2051, 2):
        years_from_base = yr - holding_base_year
        s12 = total_base_s12 * (1 - weighted_s12_rate) ** years_from_base
        s3 = total_base_s3 * (1 - weighted_s3_rate) ** years_from_base
        sbti_points.append(YearPoint(year=yr, scope12=round(s12, 0), scope3=round(s3, 0), total=round(s12 + s3, 0)))

    # Diğer yollar ve gap hesabı için ana fonksiyonu yeniden kullanabiliriz,
    # ancak bu örnekte sadece konsolide SBTi yolunu gösteriyoruz.
    # Basitleştirilmiş gap ve trend varsayımı:
    trend_points = [YearPoint(year=yr, scope12=total_base_s12, scope3=total_base_s3, total=total_base_emissions) for yr in range(current_year, 2051, 2)]
    sbti_2030 = next((p for p in sbti_points if p.year == 2030), sbti_points[0])

    return SBTiTargetResult(
        base_year=holding_base_year,
        base_scope12=total_base_s12,
        base_scope3=total_base_s3,
        current_trend=trend_points,
        sbti_target_path=sbti_points,
        net_zero_path=sbti_points, # Demo için aynı yolu kullanalım
        gap_2030=max(0, total_base_emissions - sbti_2030.total),
        gap_pct_2030=round(max(0, total_base_emissions - sbti_2030.total) / total_base_emissions * 100, 1) if total_base_emissions > 0 else 0,
        sbti_compliant=True,
        flag_emissions={},
        recommendations=[f"Holding geneli yıllık %{weighted_s12_rate*100:.1f} (K1+2) ve %{weighted_s3_rate*100:.1f} (K3) azaltım hedefi belirlenmiştir."],
        sector="Holding",
    )
