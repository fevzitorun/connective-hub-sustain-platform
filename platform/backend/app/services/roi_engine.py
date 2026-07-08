"""
Green ROI Engine (Yeşil Yatırım Getiri Motoru).
Yatırım simülasyonları yaparak finansal ve çevresel getirileri (Amortisman, CBAM tasarrufu) hesaplar.
"""

from .cbam_engine import simulate_cbam_tax

# Varsayılan emisyon katsayıları
EF_ELECTRICITY = 0.4166  # kg CO2e / kWh
EF_NATURAL_GAS = 2.02    # kg CO2e / m3
EF_DIESEL = 2.68         # kg CO2e / litre

def calculate_investment_roi(
    investment_eur: float, 
    investment_type: str, 
    current_electricity_kwh: float,
    current_natural_gas_m3: float,
    current_diesel_liters: float,
    goods_tons: float, 
    cbam_sector: str
) -> dict:
    """
    Belirli bir yatırım tipi için emisyon tasarrufunu, CBAM vergisi düşüşünü ve ROI süresini hesaplar.
    """
    
    # Mevcut Emisyonlar (Ton)
    current_scope1 = (current_natural_gas_m3 * EF_NATURAL_GAS + current_diesel_liters * EF_DIESEL) / 1000.0
    current_scope2 = (current_electricity_kwh * EF_ELECTRICITY) / 1000.0
    total_current_emissions = current_scope1 + current_scope2
    
    # Mevcut CBAM Vergisi
    current_tax = 0.0
    if goods_tons > 0 and cbam_sector:
        current_tax = simulate_cbam_tax(goods_tons, cbam_sector, custom_embedded_factor=(total_current_emissions / goods_tons))
        
    # Yatırım Sonrası Senaryolar
    new_electricity_kwh = current_electricity_kwh
    new_natural_gas_m3 = current_natural_gas_m3
    new_diesel_liters = current_diesel_liters
    financial_savings_eur = 0.0 # Enerji faturasından tasarruf tahmini (basit)
    
    ELECTRICITY_PRICE_EUR = 0.10
    DIESEL_PRICE_EUR = 1.30
    GAS_PRICE_EUR = 0.40
    
    if investment_type == "solar":
        # Güneş paneli: 1 milyon EUR yatırımla tahmini 10.000.000 kWh üretim
        produced_kwh = investment_eur * 10
        new_electricity_kwh = max(0, current_electricity_kwh - produced_kwh)
        financial_savings_eur = min(current_electricity_kwh, produced_kwh) * ELECTRICITY_PRICE_EUR
        
    elif investment_type == "ev_fleet":
        # Dizel araçları elektrikliye çevirme
        # 1 milyon EUR ile 20 araç, her biri 5000 litre dizel tasarrufu
        saved_diesel = min(current_diesel_liters, investment_eur * 0.1)
        new_diesel_liters -= saved_diesel
        # EV için ek elektrik ihtiyacı (kaba hesap: 1 lt dizel = 3 kWh)
        added_kwh = saved_diesel * 3
        new_electricity_kwh += added_kwh
        financial_savings_eur = (saved_diesel * DIESEL_PRICE_EUR) - (added_kwh * ELECTRICITY_PRICE_EUR)
        
    elif investment_type == "waste_heat":
        # Atık Isı Kazanımı: Doğalgaz tüketimini %30'a kadar düşürür
        efficiency = min(0.30, (investment_eur / 5000000.0)) # 5M Euro'da max verim
        saved_gas = current_natural_gas_m3 * efficiency
        new_natural_gas_m3 -= saved_gas
        financial_savings_eur = saved_gas * GAS_PRICE_EUR

    # Yeni Emisyonlar
    new_scope1 = (new_natural_gas_m3 * EF_NATURAL_GAS + new_diesel_liters * EF_DIESEL) / 1000.0
    new_scope2 = (new_electricity_kwh * EF_ELECTRICITY) / 1000.0
    total_new_emissions = new_scope1 + new_scope2
    
    # Yeni CBAM Vergisi
    new_tax = 0.0
    if goods_tons > 0 and cbam_sector:
        new_tax = simulate_cbam_tax(goods_tons, cbam_sector, custom_embedded_factor=(total_new_emissions / goods_tons))
        
    # Tasarruflar ve Amortisman
    emission_reduction = total_current_emissions - total_new_emissions
    tax_savings = max(0, current_tax - new_tax)
    total_annual_savings = financial_savings_eur + tax_savings
    
    payback_years = investment_eur / total_annual_savings if total_annual_savings > 0 else 999.0
    
    return {
        "investment_type": investment_type,
        "investment_eur": investment_eur,
        "current_emissions_tco2e": round(total_current_emissions, 2),
        "new_emissions_tco2e": round(total_new_emissions, 2),
        "emission_reduction_tco2e": round(emission_reduction, 2),
        "current_cbam_tax_eur": round(current_tax, 2),
        "new_cbam_tax_eur": round(new_tax, 2),
        "tax_savings_eur": round(tax_savings, 2),
        "energy_savings_eur": round(financial_savings_eur, 2),
        "total_annual_savings_eur": round(total_annual_savings, 2),
        "payback_years": round(payback_years, 1)
    }

def generate_macc_curve() -> list[dict]:
    """
    Generates Marginal Abatement Cost Curve (MACC) data for CFO simulations.
    Returns a list of projects sorted by their marginal cost (from cheapest/most profitable to most expensive).
    """
    projects = [
        {
            "id": "led_lighting",
            "name": "LED Aydınlatma Dönüşümü",
            "abatement_potential": 150, # Ton CO2e tasarruf
            "cost_per_tco2e": -45,      # Negatif maliyet (kârlı)
            "category": "Enerji Verimliliği",
            "color": "#10B981" # Emerald 500
        },
        {
            "id": "solar",
            "name": "Güneş Paneli (GES) Kurulumu",
            "abatement_potential": 850,
            "cost_per_tco2e": -20,
            "category": "Yenilenebilir Enerji",
            "color": "#059669" # Emerald 600
        },
        {
            "id": "waste_heat",
            "name": "Atık Isı Geri Kazanımı",
            "abatement_potential": 420,
            "cost_per_tco2e": -5,
            "category": "Süreç Optimizasyonu",
            "color": "#34D399" # Emerald 400
        },
        {
            "id": "ev_fleet",
            "name": "Elektrikli Araç Filosu",
            "abatement_potential": 310,
            "cost_per_tco2e": 15,       # Pozitif maliyet (yatırım gerektirir)
            "category": "Lojistik",
            "color": "#3B82F6" # Blue 500
        },
        {
            "id": "heat_pumps",
            "name": "Endüstriyel Isı Pompaları",
            "abatement_potential": 600,
            "cost_per_tco2e": 40,
            "category": "Elektrifikasyon",
            "color": "#F59E0B" # Amber 500
        },
        {
            "id": "green_hydrogen",
            "name": "Yeşil Hidrojen Kullanımı",
            "abatement_potential": 1200,
            "cost_per_tco2e": 120,
            "category": "Yeni Teknolojiler",
            "color": "#EF4444" # Red 500
        }
    ]
    
    # Sort by marginal cost (lowest to highest)
    return sorted(projects, key=lambda x: x["cost_per_tco2e"])
