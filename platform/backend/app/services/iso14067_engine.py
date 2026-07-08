"""
ISO 14067:2018 — Product Carbon Footprint (PCF) Engine
Life Cycle Assessment (LCA) tabanlı ürün karbon ayak izi hesaplama.
Cradle-to-gate + Cradle-to-grave + CBAM embedded emissions mapping.
Referanslar: IPCC 2006 AR5 GWP100, DEFRA 2022, ETKB 2022, Ecoinvent 3.9
"""
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field


# ── Yaşam Döngüsü Aşamaları (EN 15978 / ISO 14044) ────────────────────────
LIFECYCLE_STAGES = {
    "A1": "Ham Madde Çıkarımı",
    "A2": "Ham Madde Nakliyesi",
    "A3": "Üretim / İşleme",
    "A4": "Teslimat Nakliyesi",
    "A5": "Kurulum / Montaj",
    "B1": "Kullanım",
    "B2": "Bakım",
    "B6": "Operasyonel Enerji",
    "C1": "Sökme / Yıkım",
    "C2": "Atık Nakliyesi",
    "C3": "Atık İşleme",
    "C4": "Depolama / Bertaraf",
    "D":  "Yeniden Kullanım / Geri Dönüşüm Potansiyeli",
}

# ── Emisyon Faktörleri ──────────────────────────────────────────────────────
EF = {
    # Enerji (ETKB 2022 + DEFRA 2022)
    "elektrik_tr_kwh":      0.41530,   # kg CO2e/kWh (Türkiye grid, ETKB 2022)
    "dogalgaz_m3":          2.01570,   # kg CO2e/m3 (IPCC 2006)
    "motorin_litre":        2.68100,   # kg CO2e/litre (DEFRA 2022)
    "benzin_litre":         2.34900,   # kg CO2e/litre (DEFRA 2022)
    "lpg_kg":               2.93400,   # kg CO2e/kg

    # Hammadde — Türkiye'den ihracat sektörleri (Ecoinvent 3.9 küresel ortalama)
    "celik_ton":           1850.0,     # kg CO2e/ton (BOF yöntemi, küresel ort.)
    "aluminyum_primer_ton":11500.0,    # kg CO2e/ton (elektroliz, küresel ort.)
    "aluminyum_sekonder_ton": 700.0,   # kg CO2e/ton (hurda + yeniden eritme)
    "pamuk_kg":               8.0,     # kg CO2e/kg (ham pamuk, sulama dahil)
    "polyester_kg":           5.5,     # kg CO2e/kg (PET elyaf)
    "kumas_dokuma_kg":        4.2,     # kg CO2e/kg (dokuma işlemi)
    "cimento_ton":          830.0,     # kg CO2e/ton (klinker bazlı, TSE)
    "cam_ton":              900.0,     # kg CO2e/ton (float cam)
    "kagit_ton":            900.0,     # kg CO2e/ton (kraft kağıdı)
    "plastik_pet_kg":         2.7,     # kg CO2e/kg
    "ahsap_m3":             100.0,     # kg CO2e/m3 (işlenmiş kereste)

    # Nakliye (DEFRA 2022 ton-km faktörleri)
    "kara_tir_tkm":         0.10695,   # kg CO2e/ton-km
    "denizyolu_tkm":        0.01620,   # kg CO2e/ton-km
    "havayolu_tkm":         0.60280,   # kg CO2e/ton-km
    "demiryolu_tkm":        0.02800,   # kg CO2e/ton-km

    # Atık / Son Kullanım
    "atik_duzenli_depolama_kg": 0.58500,  # kg CO2e/kg
    "atik_yakilma_kg":          0.21600,  # kg CO2e/kg
    "geri_donusum_kredi_kg":   -0.30000,  # kg CO2e/kg (negatif = kredi)
}

# ── Sektör Referans Değerleri (benchmark, kg CO2e / fonksiyonel birim) ───────
SECTOR_BENCHMARKS = {
    "tekstil_kg":           {"avg": 15.0, "best": 6.5,  "unit": "kg CO2e/kg ürün"},
    "aluminyum_profil_kg":  {"avg": 14.5, "best": 4.2,  "unit": "kg CO2e/kg"},
    "celik_boru_kg":        {"avg": 2.8,  "best": 1.4,  "unit": "kg CO2e/kg"},
    "cimento_ton":          {"avg": 830.0,"best": 650.0, "unit": "kg CO2e/ton"},
    "yiyecek_icecek_kg":    {"avg": 5.5,  "best": 2.0,  "unit": "kg CO2e/kg"},
    "elektronik_unit":      {"avg": 180.0,"best": 80.0,  "unit": "kg CO2e/adet"},
    "otomobil_unit":        {"avg": 18000.0,"best":9000.0,"unit": "kg CO2e/araç"},
    "mobilya_unit":         {"avg": 120.0,"best": 45.0,  "unit": "kg CO2e/adet"},
}

# ── Demo Ürünler (Türk ihracat sektörlerine göre) ────────────────────────────
DEMO_PRODUCTS = {
    "tekstil": {
        "product_name": "Pamuklu T-Shirt",
        "sector": "tekstil_kg",
        "functional_unit": "1 kg pamuklu kumaş",
        "system_boundary": "cradle-to-gate",
        "annual_production_units": 50000,
        "stages": {
            "A1": {"pamuk_kg": 1.2},                            # Ham pamuk
            "A2": {"kara_tir_tkm": 500},                        # TR içi nakliye
            "A3": {"elektrik_tr_kwh": 3.5, "dogalgaz_m3": 0.8}, # Üretim
            "A4": {"denizyolu_tkm": 1200},                      # AB'ye ihracat
            "C4": {"atik_duzenli_depolama_kg": 0.1},
        },
    },
    "aluminyum": {
        "product_name": "Alüminyum Profil",
        "sector": "aluminyum_profil_kg",
        "functional_unit": "1 kg alüminyum profil",
        "system_boundary": "cradle-to-gate",
        "annual_production_units": 10000,
        "stages": {
            "A1": {"aluminyum_primer_ton": 0.0012},             # 1.2 kg/kg ürün kayıp
            "A2": {"denizyolu_tkm": 800},
            "A3": {"elektrik_tr_kwh": 8.0, "dogalgaz_m3": 0.5},
            "A4": {"kara_tir_tkm": 300},
        },
    },
    "celik": {
        "product_name": "Çelik Boru",
        "sector": "celik_boru_kg",
        "functional_unit": "1 kg çelik boru",
        "system_boundary": "cradle-to-gate",
        "annual_production_units": 80000,
        "stages": {
            "A1": {"celik_ton": 0.001},
            "A2": {"kara_tir_tkm": 200},
            "A3": {"elektrik_tr_kwh": 0.4, "motorin_litre": 0.05},
            "A4": {"kara_tir_tkm": 400},
        },
    },
}


@dataclass
class PCFInput:
    product_name: str
    functional_unit: str                         # örn. "1 kg", "1 adet", "1 m²"
    functional_unit_quantity: float = 1.0
    system_boundary: str = "cradle-to-gate"      # cradle-to-gate | cradle-to-grave
    sector: Optional[str] = None
    annual_production_units: Optional[float] = None

    # Aşama bazlı girdiler: {aşama_kodu: {ef_anahtar: miktar}}
    stages: Dict[str, Dict[str, float]] = field(default_factory=dict)

    # CBAM için ek bilgi
    cbam_product_category: Optional[str] = None  # celik, aluminyum, cimento, gubre, elektrik, hidrojen


def _calculate_stage(stage_inputs: Dict[str, float]) -> Dict[str, float]:
    """Bir aşamadaki tüm girdilerin kg CO2e değerini hesaplar."""
    result = {}
    for ef_key, quantity in stage_inputs.items():
        factor = EF.get(ef_key)
        if factor is None:
            continue
        result[ef_key] = round(quantity * factor, 4)
    return result


def calculate_pcf(inp: PCFInput) -> Dict[str, Any]:
    """
    ISO 14067:2018 ürün karbon ayak izi hesaplama.
    Döndürür: toplam PCF, aşama kırılımı, CBAM haritalama, benchmark karşılaştırma.
    """
    stage_results: Dict[str, Any] = {}
    total_co2e = 0.0

    # Cradle-to-gate aşamaları (her zaman dahil)
    ctg_stages = ["A1", "A2", "A3", "A4", "A5"]
    # Cradle-to-grave ek aşamaları
    ctgv_stages = ["B1", "B2", "B6", "C1", "C2", "C3", "C4", "D"]

    active_stages = ctg_stages + (ctgv_stages if inp.system_boundary == "cradle-to-grave" else [])

    for stage_code in active_stages:
        if stage_code not in inp.stages:
            continue
        breakdown = _calculate_stage(inp.stages[stage_code])
        stage_total = sum(breakdown.values())
        stage_results[stage_code] = {
            "name": LIFECYCLE_STAGES.get(stage_code, stage_code),
            "inputs": breakdown,
            "total_co2e": round(stage_total, 4),
            "pct": 0.0,  # sonra hesaplanır
        }
        total_co2e += stage_total

    total_co2e = round(total_co2e, 4)

    # Yüzde hesapla
    for s in stage_results.values():
        s["pct"] = round(s["total_co2e"] / total_co2e * 100, 1) if total_co2e > 0 else 0.0

    # Sıcak nokta analizi (en yüksek 3 aşama)
    sorted_stages = sorted(stage_results.items(), key=lambda x: x[1]["total_co2e"], reverse=True)
    hotspots = [{"stage": k, "name": v["name"], "co2e": v["total_co2e"], "pct": v["pct"]} for k, v in sorted_stages[:3]]

    # CBAM gömülü emisyon (A1+A2+A3 — üretim sınırı)
    cbam_embedded = sum(
        stage_results.get(s, {}).get("total_co2e", 0)
        for s in ["A1", "A2", "A3"]
    )

    # Benchmark
    benchmark = None
    if inp.sector and inp.sector in SECTOR_BENCHMARKS:
        bm = SECTOR_BENCHMARKS[inp.sector]
        vs_avg_pct = round((total_co2e - bm["avg"]) / bm["avg"] * 100, 1) if bm["avg"] > 0 else 0
        benchmark = {
            "sector": inp.sector,
            "your_pcf": total_co2e,
            "sector_avg": bm["avg"],
            "sector_best": bm["best"],
            "unit": bm["unit"],
            "vs_avg_pct": vs_avg_pct,
            "performance": "İyi" if vs_avg_pct < -10 else ("Ortalama" if vs_avg_pct < 10 else "Gelişim Gerekli"),
        }

    # Yıllık toplam (eğer üretim adedi girilmişse)
    annual_total = None
    if inp.annual_production_units:
        annual_total = round(total_co2e * inp.annual_production_units / 1000, 2)  # tCO2e

    # EPD hazırlık
    epd_ready = (
        inp.system_boundary == "cradle-to-grave"
        and len(stage_results) >= 4
        and total_co2e > 0
    )

    return {
        "product_name": inp.product_name,
        "functional_unit": inp.functional_unit,
        "system_boundary": inp.system_boundary,
        "total_pcf_kg_co2e": total_co2e,
        "cbam_embedded_co2e": round(cbam_embedded, 4),
        "stage_breakdown": stage_results,
        "hotspots": hotspots,
        "benchmark": benchmark,
        "annual_total_tco2e": annual_total,
        "epd_ready": epd_ready,
        "cbam_product_category": inp.cbam_product_category,
        "methodology": [
            "ISO 14067:2018 Ürün Karbon Ayak İzi",
            "IPCC 2006 AR5 GWP100 değerleri",
            "DEFRA 2022 taşıma emisyon faktörleri",
            f"Elektrik: ETKB 2022 Türkiye grid faktörü ({EF['elektrik_tr_kwh']} kg CO₂e/kWh)",
        ],
    }


def calculate_pcf_from_demo(product_key: str) -> Dict[str, Any]:
    """Hazır demo ürünü hesapla."""
    demo = DEMO_PRODUCTS.get(product_key)
    if not demo:
        raise ValueError(f"Demo ürün bulunamadı: {product_key}")
    inp = PCFInput(
        product_name=demo["product_name"],
        functional_unit=demo["functional_unit"],
        system_boundary=demo["system_boundary"],
        sector=demo.get("sector"),
        annual_production_units=demo.get("annual_production_units"),
        stages=demo["stages"],
    )
    return calculate_pcf(inp)
