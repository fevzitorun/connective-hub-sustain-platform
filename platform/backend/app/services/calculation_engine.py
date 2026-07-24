"""
GHG Protocol uyumlu emisyon hesaplama motoru.
Kaynaklar: GHG Protocol, DEFRA 2024, TEİAŞ 2024, IPCC AR6.
"""
from dataclasses import dataclass, field
from typing import Optional

# ─── Emisyon faktörleri ────────────────────────────────────────────────────────
EMISSION_FACTORS: dict[str, float] = {
    # Türkiye ulusal elektrik şebeke faktörü (TEİAŞ)
    "electricity_TR_grid_2024": 0.4166,   # kg CO₂e/kWh
    "electricity_TR_grid_2023": 0.4489,
    "electricity_TR_grid_2022": 0.4816,
    "electricity_UK_grid_2024": 0.2117,   # UK DESNZ 2024
    
    # ETKB 2022
    "electricity_TR_grid_2022_ETKB": 0.435,

    # Yakıtlar (GHG Protocol)
    "natural_gas":    2.0404,  # kg CO₂e/m³
    "natural_gas_IPCC2006": 1.936,
    
    "diesel":         2.6762,  # kg CO₂e/litre
    "diesel_DEFRA2022": 2.68787,
    
    "lpg":            1.6318,  # kg CO₂e/kg
    "lpg_DEFRA2022":  1.55709,
    
    "coal_bituminous": 2.4248, # kg CO₂e/kg
    "coal_IPCC2006":   2.27,

    # Kara taşımacılığı (DEFRA 2024)
    "car_petrol":     0.17049, # kg CO₂e/km
    "car_diesel":     0.16394,
    "company_vehicle_avg": 0.16800,
    "company_vehicle_avg_DEFRA2022": 0.170,

    # Hava yolculuğu (DEFRA 2024)
    "flight_shorthaul": 0.15530,  # kg CO₂e/kişi-km
    "flight_longhaul":  0.19085,
    "flight_shorthaul_DEFRA2022": 0.153,

    # Atık (DEFRA 2024)
    "waste_landfill": 0.5858,  # kg CO₂e/kg
    "waste_recycled": 0.0213,
    "waste_landfill_DEFRA2022": 0.573,
    
    # Kaçak emisyon
    "fugitive_refrigerant_IPCC": 1430.0, # R134a default
}
SECTOR_BENCHMARKS: dict[str, float] = {
    "banking":      2.4,   # tCO₂e/çalışan
    "cement":     320.0,
    "energy":      45.0,
    "construction": 8.5,
    "retail":       4.2,
    "insurance":    2.1,
    "manufacturing": 12.3,
    "refinery":    180.0,
}


@dataclass
class EmissionInput:
    company_id: str
    year: int
    reporting_boundary: str = "operational_control"
    sector: str = "manufacturing"
    electricity_source: str = "grid"

    # Kapsam 1
    natural_gas_m3: Optional[float] = None
    diesel_liters: Optional[float] = None
    lpg_kg: Optional[float] = None
    coal_tons: Optional[float] = None
    company_vehicles_km: Optional[float] = None
    fugitive_emissions_kg: Optional[float] = None
    calculation_standard: str = "ghg_protocol"
    
    # Sektörel Aktivite (Ton ürün, m2 konaklama, öğrenci sayısı vs.)
    sector_activity_value: Optional[float] = None

    # Kapsam 2
    electricity_kwh: float = 0.0
    steam_gj: Optional[float] = None

    # Kapsam 3
    business_travel_flight_km: Optional[float] = None
    employee_commute_km: Optional[float] = None
    waste_tons: Optional[float] = None

    # Bankacılık
    financed_emissions_co2e: Optional[float] = None

    # Çimento
    clinker_tons: Optional[float] = None
    cement_production_tons: Optional[float] = None

    def __post_init__(self):
        # DB'den (SQLAlchemy Numeric) Decimal gelebilir; float'a normalize et.
        # Aksi halde emisyon faktörleriyle (float) çarpımda 'Decimal * float' TypeError.
        _num_fields = (
            "natural_gas_m3", "diesel_liters", "lpg_kg", "coal_tons",
            "company_vehicles_km", "fugitive_emissions_kg", "sector_activity_value",
            "electricity_kwh", "steam_gj", "business_travel_flight_km",
            "employee_commute_km", "waste_tons", "financed_emissions_co2e",
            "clinker_tons", "cement_production_tons",
        )
        for _f in _num_fields:
            _v = getattr(self, _f)
            if _v is not None:
                setattr(self, _f, float(_v))


@dataclass
class EmissionResult:
    scope1_co2e: float
    scope2_location_co2e: float
    scope2_market_co2e: float
    scope3_co2e: float
    total_co2e: float
    sectoral_estimated_co2e: Optional[float] = None
    breakdown: dict[str, float] = field(default_factory=dict)
    methodology_notes: list[str] = field(default_factory=list)

from .sector_factors import get_sector_factor



def _factor(year: int, source: str) -> float:
    key = f"electricity_TR_grid_{year}"
    return EMISSION_FACTORS.get(key, EMISSION_FACTORS["electricity_TR_grid_2024"])


def calculate_scope1(data: EmissionInput) -> tuple[float, dict[str, float]]:
    breakdown: dict[str, float] = {}

    if data.natural_gas_m3:
        v = data.natural_gas_m3 * EMISSION_FACTORS["natural_gas"] / 1000
        breakdown["Doğalgaz"] = round(v, 3)

    if data.diesel_liters:
        v = data.diesel_liters * EMISSION_FACTORS["diesel"] / 1000
        breakdown["Dizel"] = round(v, 3)

    if data.lpg_kg:
        v = data.lpg_kg * EMISSION_FACTORS["lpg"] / 1000
        breakdown["LPG"] = round(v, 3)

    if data.coal_tons:
        v = data.coal_tons * EMISSION_FACTORS["coal_bituminous"]
        breakdown["Kömür"] = round(v, 3)

    if data.company_vehicles_km:
        v = data.company_vehicles_km * EMISSION_FACTORS["company_vehicle_avg"] / 1000
        breakdown["Şirket araçları"] = round(v, 3)

    total = sum(breakdown.values())
    return round(total, 3), breakdown


def calculate_scope2(data: EmissionInput) -> tuple[float, float]:
    grid_factor = _factor(data.year, data.electricity_source)
    location_based = round(data.electricity_kwh * grid_factor / 1000, 3)

    if data.electricity_source == "renewable_certificate":
        market_based = 0.0
    else:
        market_based = location_based

    return location_based, market_based


def calculate_scope3(data: EmissionInput) -> tuple[float, dict[str, float]]:
    breakdown: dict[str, float] = {}

    if data.business_travel_flight_km:
        v = data.business_travel_flight_km * EMISSION_FACTORS["flight_shorthaul"] / 1000
        breakdown["İş seyahati (uçuş)"] = round(v, 3)

    if data.employee_commute_km:
        v = data.employee_commute_km * EMISSION_FACTORS["car_petrol"] / 1000
        breakdown["Çalışan ulaşımı"] = round(v, 3)

    if data.waste_tons:
        v = data.waste_tons * EMISSION_FACTORS["waste_landfill"]
        breakdown["Atık"] = round(v, 3)

    # Bankacılık — finanse edilmiş emisyonlar (PCAF Kapsam 3, Kategori 15)
    if data.financed_emissions_co2e:
        breakdown["Finanse edilmiş emisyonlar (PCAF)"] = round(data.financed_emissions_co2e, 3)

    total = sum(breakdown.values())
    return round(total, 3), breakdown


def calculate_emissions(data: EmissionInput) -> EmissionResult:
    scope1, s1_breakdown = calculate_scope1(data)
    scope2_loc, scope2_mkt = calculate_scope2(data)
    scope3, s3_breakdown = calculate_scope3(data)

    total = round(scope1 + scope2_loc + scope3, 3)

    breakdown = {
        "Kapsam 1": {**s1_breakdown, "_toplam": scope1},
        "Kapsam 2 (konum)": scope2_loc,
        "Kapsam 2 (piyasa)": scope2_mkt,
        "Kapsam 3": {**s3_breakdown, "_toplam": scope3},
    }

    notes = [
        f"TEİAŞ {data.year} Türkiye şebeke faktörü: {_factor(data.year, data.electricity_source)} kgCO₂e/kWh",
        "GHG Protocol Corporate Standard uygulandı",
        "DEFRA 2024 emisyon faktörleri kullanıldı",
    ]

    return EmissionResult(
        scope1_co2e=scope1,
        scope2_location_co2e=scope2_loc,
        scope2_market_co2e=scope2_mkt,
        scope3_co2e=scope3,
        total_co2e=total,
        breakdown=breakdown,
        methodology_notes=notes,
    )

def calculate_iso14064(data: EmissionInput) -> EmissionResult:
    """
    ISO 14064-1 standardına göre hesaplama (IPCC 2006, DEFRA 2022, ETKB 2022).
    """
    breakdown: dict[str, float] = {}
    
    # 1. Doğrudan Emisyonlar (Kapsam 1)
    s1_breakdown = {}
    if data.natural_gas_m3:
        s1_breakdown["Doğalgaz"] = round(data.natural_gas_m3 * EMISSION_FACTORS["natural_gas_IPCC2006"] / 1000, 3)
    if data.diesel_liters:
        s1_breakdown["Dizel"] = round(data.diesel_liters * EMISSION_FACTORS["diesel_DEFRA2022"] / 1000, 3)
    if data.lpg_kg:
        s1_breakdown["LPG"] = round(data.lpg_kg * EMISSION_FACTORS["lpg_DEFRA2022"] / 1000, 3)
    if data.coal_tons:
        s1_breakdown["Kömür"] = round(data.coal_tons * EMISSION_FACTORS["coal_IPCC2006"], 3)
    if data.company_vehicles_km:
        s1_breakdown["Şirket araçları"] = round(data.company_vehicles_km * EMISSION_FACTORS["company_vehicle_avg_DEFRA2022"] / 1000, 3)
    if data.fugitive_emissions_kg:
        s1_breakdown["Kaçak Emisyonlar"] = round(data.fugitive_emissions_kg * EMISSION_FACTORS["fugitive_refrigerant_IPCC"] / 1000, 3)
        
    scope1 = sum(s1_breakdown.values())
    
    # 2. Enerji Dolaylı Emisyonlar (Kapsam 2)
    s2_breakdown = {}
    # Use ETKB 2022 for grid electricity by default in ISO 14064 mode for TR
    grid_factor = EMISSION_FACTORS["electricity_TR_grid_2022_ETKB"]
    scope2_loc = round(data.electricity_kwh * grid_factor / 1000, 3)
    s2_breakdown["Satın Alınan Elektrik"] = scope2_loc
    
    scope2_mkt = 0.0 if data.electricity_source == "renewable_certificate" else scope2_loc

    # 3. Diğer Dolaylı Emisyonlar (Kapsam 3)
    s3_breakdown = {}
    if data.business_travel_flight_km:
        s3_breakdown["İş seyahati (uçuş)"] = round(data.business_travel_flight_km * EMISSION_FACTORS["flight_shorthaul_DEFRA2022"] / 1000, 3)
    if data.employee_commute_km:
        s3_breakdown["Çalışan ulaşımı"] = round(data.employee_commute_km * EMISSION_FACTORS["car_petrol"] / 1000, 3)
    if data.waste_tons:
        s3_breakdown["Atık"] = round(data.waste_tons * EMISSION_FACTORS["waste_landfill_DEFRA2022"], 3)
    if data.financed_emissions_co2e:
        s3_breakdown["Finanse edilmiş emisyonlar (PCAF)"] = round(data.financed_emissions_co2e, 3)

    scope3 = sum(s3_breakdown.values())
    
    total = round(scope1 + scope2_loc + scope3, 3)
    
    # Sektörel tahmin hesaplaması (eğer aktivite verisi girildiyse)
    sector_est = None
    if data.sector and data.sector_activity_value:
        sf = get_sector_factor(data.sector)
        if sf:
            sector_est = round(data.sector_activity_value * sf["factor"], 3)
    
    breakdown = {
        "1. Doğrudan Emisyonlar (Kapsam 1)": {**s1_breakdown, "_toplam": scope1},
        "2. Enerji Dolaylı Emisyonlar (Kapsam 2)": {**s2_breakdown, "_toplam": scope2_loc},
        "3. Diğer Dolaylı Emisyonlar (Kapsam 3)": {**s3_breakdown, "_toplam": scope3},
    }
    
    notes = [
        "ISO 14064-1 Kurumsal Karbon Ayak İzi Standardı",
        "IPCC 2006, DEFRA 2022, ETKB 2022 çarpanları kullanıldı"
    ]
    
    return EmissionResult(
        scope1_co2e=scope1,
        scope2_location_co2e=scope2_loc,
        scope2_market_co2e=scope2_mkt,
        scope3_co2e=scope3,
        total_co2e=total,
        sectoral_estimated_co2e=sector_est,
        breakdown=breakdown,
        methodology_notes=notes,
    )



# ─── TSRS uyumluluk skoru ─────────────────────────────────────────────────────
def calculate_tsrs_compliance(report_data: dict) -> dict:
    """
    TSRS 1 & 2 zorunlu maddelere göre uyumluluk skoru hesapla.
    16 gerçek rapordan çıkarılan kontrol listesi.
    """
    checks = {
        # YÖNETİŞİM — TSRS 1 §14-16
        "governance_body_oversight":     report_data.get("has_board_oversight", False),
        "governance_management_role":    report_data.get("has_management_role", False),
        "governance_incentives":         report_data.get("has_incentive_mechanisms", False),

        # STRATEJİ — TSRS 1 §18-25
        "strategy_risks_opportunities":  report_data.get("has_risks_opportunities", False),
        "strategy_time_horizons":        report_data.get("has_time_horizons", False),
        "strategy_business_model":       report_data.get("has_business_model", False),
        "strategy_scenario_analysis":    report_data.get("has_scenario_analysis", False),
        "strategy_transition_plan":      report_data.get("has_transition_plan", False),

        # RİSK YÖNETİMİ — TSRS 1 §26-28
        "risk_identification_process":   report_data.get("has_risk_process", False),
        "risk_integration":              report_data.get("has_risk_integration", False),

        # METRİK VE HEDEFLER — TSRS 2 §29-36
        "metrics_scope1":                report_data.get("scope1_co2e") is not None,
        "metrics_scope2_location":       report_data.get("scope2_location") is not None,
        "metrics_scope2_market":         report_data.get("scope2_market") is not None,
        "metrics_scope3":                report_data.get("has_scope3_analysis", False),
        "metrics_energy":                report_data.get("has_energy_metrics", False),
        "metrics_cross_industry":        report_data.get("has_cross_industry_metrics", False),
        "metrics_sector_specific":       report_data.get("has_sector_metrics", False),
        "targets_climate":               report_data.get("has_climate_targets", False),

        # EK
        "annex_tsrs_index":              report_data.get("has_tsrs_index", False),
        "annex_assurance":               report_data.get("has_assurance_statement", False),
    }

    passed = sum(1 for v in checks.values() if v)
    total = len(checks)
    score = round(passed / total * 100)
    grade = "A" if score >= 90 else "B" if score >= 75 else "C" if score >= 60 else "D"

    return {
        "total_score": score,
        "passed": passed,
        "total_checks": total,
        "missing": [k for k, v in checks.items() if not v],
        "grade": grade,
        "checks": checks,
    }


# ── GPC Kent Ölçeği Sera Gazı Envanteri ───────────────────────────────────────
# Global Protocol for Community-Scale GHG Inventories (C40 / ICLEI / CDP-ICLEI)
# municipality_library.md Bölüm 1. Belediye modülü için kent envanteri toplaması.
GPC_BASIC_SECTORS = ("stationary_energy", "transportation", "waste")
GPC_BASIC_PLUS_SECTORS = ("ippu", "afolu")
GPC_SECTOR_LABELS = {
    "stationary_energy": "Sabit Enerji",
    "transportation": "Ulaşım",
    "waste": "Atık",
    "ippu": "Endüstriyel Süreçler (IPPU)",
    "afolu": "Tarım/Orman/Arazi (AFOLU)",
}


def calculate_gpc_inventory(
    sectors_tco2e: dict[str, float],
    reporting_level: str = "basic",
) -> dict:
    """
    Kent ölçeğinde GPC envanteri toplaması.

    sectors_tco2e: {sector_key: ton CO₂e} — GPC_SECTOR_LABELS anahtarları.
    reporting_level: "basic" (Sabit Enerji + Ulaşım + Atık) veya
                     "basic_plus" (BASIC + IPPU + AFOLU).

    Dönüş: sektör kırılımı + toplam + kapsam seviyesi. Sahte veri üretmez;
    yalnızca verilen değerleri toplar (eksik sektör 0 sayılır).
    """
    active = list(GPC_BASIC_SECTORS)
    if reporting_level == "basic_plus":
        active += list(GPC_BASIC_PLUS_SECTORS)

    breakdown = []
    total = 0.0
    for key in active:
        val = float(sectors_tco2e.get(key) or 0.0)
        total += val
        breakdown.append({
            "sector": key,
            "label": GPC_SECTOR_LABELS[key],
            "tco2e": round(val, 2),
        })

    for item in breakdown:
        item["share_pct"] = round(item["tco2e"] / total * 100, 1) if total > 0 else 0.0

    return {
        "reporting_level": reporting_level,
        "reporting_level_label": "BASIC+" if reporting_level == "basic_plus" else "BASIC",
        "sectors": breakdown,
        "total_tco2e": round(total, 2),
        "standard": "GPC (Global Protocol for Community-Scale GHG Inventories)",
    }
