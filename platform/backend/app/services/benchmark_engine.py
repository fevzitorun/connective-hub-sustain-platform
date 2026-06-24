"""
Sektörel Benchmark Analizörü (Sprint 4-A)
EEA ve Türkiye Sanayi Odaları verilerinden (simüle) sektör ortalamaları.
"""
from typing import Dict, Any

# Simüle edilmiş sektör verileri (Karbon Yoğunluğu, Su Verimliliği, Enerji Karışımı, Atık Geri Dönüşümü, TSRS Uyum Skoru)
# Karbon Yoğunluğu (ton CO2e/Milyon TL ciro) - düşük daha iyi
# Su Verimliliği (m3/Milyon TL) - düşük daha iyi
# Enerji Karışımı (% Yenilenebilir) - yüksek daha iyi
# Atık Geri Dönüşümü (%) - yüksek daha iyi
# TSRS Uyum Skoru (0-100) - yüksek daha iyi
# TSRS Uyum Skoru (0-100) - yüksek daha iyi

# ---------------------------
# DEMO MOCK: UK Market Averages
# ---------------------------
UK_MARKET_AVERAGES = {
    "tekstil": {
        "tr_avg_intensity": 18.5,
        "uk_avg_intensity": 12.0,
        "best_in_class": 10.2,
        "average_renewable_share": 15,
        "uk_renewable_share": 45
    },
    "otomotiv": {
        "tr_avg_intensity": 12.0,
        "uk_avg_intensity": 8.5,
        "best_in_class": 6.8,
        "average_renewable_share": 25,
        "uk_renewable_share": 60
    },
    "çimento": {
        "tr_avg_intensity": 850.0,
        "uk_avg_intensity": 620.0,
        "best_in_class": 550.0,
        "average_renewable_share": 5,
        "uk_renewable_share": 20
    },
    "default": {
        "tr_avg_intensity": 25.0,
        "uk_avg_intensity": 15.0,
        "best_in_class": 12.0,
        "average_renewable_share": 10,
        "uk_renewable_share": 35
    }
}

SECTOR_DATA = {
    "çimento": {
        "karbon_yogunlugu": {"en_iyi_10": 120, "ortalama": 250},
        "su_verimliligi": {"en_iyi_10": 15, "ortalama": 40},
        "enerji_karisimi": {"en_iyi_10": 45, "ortalama": 15},
        "atik_geri_donusumu": {"en_iyi_10": 90, "ortalama": 60},
        "tsrs_skoru": {"en_iyi_10": 85, "ortalama": 45},
    },
    "tekstil": {
        "karbon_yogunlugu": {"en_iyi_10": 15, "ortalama": 45},
        "su_verimliligi": {"en_iyi_10": 25, "ortalama": 85},
        "enerji_karisimi": {"en_iyi_10": 60, "ortalama": 25},
        "atik_geri_donusumu": {"en_iyi_10": 95, "ortalama": 50},
        "tsrs_skoru": {"en_iyi_10": 80, "ortalama": 55},
    },
    "default": {
        "karbon_yogunlugu": {"en_iyi_10": 20, "ortalama": 50},
        "su_verimliligi": {"en_iyi_10": 20, "ortalama": 50},
        "enerji_karisimi": {"en_iyi_10": 50, "ortalama": 20},
        "atik_geri_donusumu": {"en_iyi_10": 80, "ortalama": 40},
        "tsrs_skoru": {"en_iyi_10": 85, "ortalama": 50},
    }
}

def get_radar_benchmark(sector: str, company_data: Dict[str, float]) -> Dict[str, Any]:
    """
    Şirket verilerini sektör ortalaması ve en iyi %10 ile kıyaslar.
    company_data = {
        "karbon_yogunlugu": value,
        "su_verimliligi": value,
        "enerji_karisimi": value,
        "atik_geri_donusumu": value,
        "tsrs_skoru": value
    }
    """
    sector_key = sector.lower() if sector.lower() in SECTOR_DATA else "default"
    benchmarks = SECTOR_DATA[sector_key]

    # Değerleri 0-100 arasına normalize edelim ki radar grafiğinde düzgün görünsün.
    def normalize_inverse(val, best, avg):
        worst = avg + (avg - best)
        if val <= best: return 100
        if val >= worst: return 0
        return int(100 - ((val - best) / (worst - best) * 100))

    def normalize_direct(val, best, avg):
        worst = max(0, avg - (best - avg))
        if val >= best: return 100
        if val <= worst: return 0
        return int(((val - worst) / (best - worst)) * 100)

    data = [
        {
            "metric": "Karbon Yoğunluğu",
            "Sirket": normalize_inverse(company_data.get("karbon_yogunlugu", benchmarks["karbon_yogunlugu"]["ortalama"]), benchmarks["karbon_yogunlugu"]["en_iyi_10"], benchmarks["karbon_yogunlugu"]["ortalama"]),
            "Ortalama": 50,
            "EnIyi": 100,
            "tip": "Yenilenebilir enerjiye geçiş ile karbon yoğunluğunuzu düşürebilirsiniz."
        },
        {
            "metric": "Su Verimliliği",
            "Sirket": normalize_inverse(company_data.get("su_verimliligi", benchmarks["su_verimliligi"]["ortalama"]), benchmarks["su_verimliligi"]["en_iyi_10"], benchmarks["su_verimliligi"]["ortalama"]),
            "Ortalama": 50,
            "EnIyi": 100,
            "tip": "Kapalı devre su sistemleri kullanarak su tüketimini azaltın."
        },
        {
            "metric": "Enerji Karışımı",
            "Sirket": normalize_direct(company_data.get("enerji_karisimi", benchmarks["enerji_karisimi"]["ortalama"]), benchmarks["enerji_karisimi"]["en_iyi_10"], benchmarks["enerji_karisimi"]["ortalama"]),
            "Ortalama": 50,
            "EnIyi": 100,
            "tip": "Güneş paneli yatırımı ile yenilenebilir enerji payınızı artırın."
        },
        {
            "metric": "Atık Geri Dönüşümü",
            "Sirket": normalize_direct(company_data.get("atik_geri_donusumu", benchmarks["atik_geri_donusumu"]["ortalama"]), benchmarks["atik_geri_donusumu"]["en_iyi_10"], benchmarks["atik_geri_donusumu"]["ortalama"]),
            "Ortalama": 50,
            "EnIyi": 100,
            "tip": "Üretim süreçlerindeki fire oranını düşürüp geri dönüşümü maksimize edin."
        },
        {
            "metric": "TSRS Uyum Skoru",
            "Sirket": normalize_direct(company_data.get("tsrs_skoru", benchmarks["tsrs_skoru"]["ortalama"]), benchmarks["tsrs_skoru"]["en_iyi_10"], benchmarks["tsrs_skoru"]["ortalama"]),
            "Ortalama": 50,
            "EnIyi": 100,
            "tip": "Yönetim kurulu seviyesinde iklim komitesi kurarak TSRS uyumunu artırın."
        }
    ]

    return {
        "sector": sector,
        "radar_data": data
    }

def get_uk_market_benchmark(sector: str, company_intensity: float) -> Dict[str, Any]:
    """
    Returns the UK Market Access Score for the dashboard, comparing the company's carbon intensity to the UK average.
    """
    sector_key = sector.lower() if sector.lower() in UK_MARKET_AVERAGES else "default"
    uk_data = UK_MARKET_AVERAGES[sector_key]
    
    uk_avg = uk_data["uk_avg_intensity"]
    
    # Calculate difference
    diff_percent = ((company_intensity - uk_avg) / uk_avg) * 100
    
    if diff_percent <= -10:
        status = "Excellent"
        message = f"Karbon yoğunluğunuz UK ortalamasından %{abs(diff_percent):.0f} daha düşük! İhracat avantajınız çok yüksek."
        score = 95
    elif diff_percent <= 5:
        status = "Good"
        message = f"Karbon yoğunluğunuz UK ortalaması ile rekabetçi seviyede (Fark: %{diff_percent:.0f})."
        score = 75
    else:
        status = "High Risk"
        message = f"Karbon yoğunluğunuz UK ortalamasının %{diff_percent:.0f} üzerinde. CBAM vergisi riski taşıyorsunuz."
        score = 45
        
    return {
        "uk_market_access_score": score,
        "status": status,
        "message": message,
        "uk_avg_intensity": uk_avg,
        "company_intensity": company_intensity
    }
