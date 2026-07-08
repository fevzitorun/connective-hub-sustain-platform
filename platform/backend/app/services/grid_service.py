"""
Sustain Grid+ Energy & Smart Meter Integration Engine.
"""
from typing import Dict, Any, List
import random
from datetime import datetime, timezone

# Official shebeke emisyon katsayilari (kgCO2e / kWh)
GRID_FACTORS = {
    "TR": 0.4166,  # TEİAŞ 2024
    "UK": 0.2117,  # DESNZ 2024
    "DEFAULT": 0.3500
}

def generate_live_meter_reading(company_id: str) -> Dict[str, Any]:
    """
    Simulates real-time 3-phase smart meter telemetry.
    """
    # Seed based on company_id to keep values semi-consistent
    seed = sum(ord(c) for c in company_id) % 100
    random.seed(seed + int(datetime.now(timezone.utc).timestamp() // 10))

    voltage_l1 = round(228.4 + random.uniform(-2.0, 2.0), 1)
    voltage_l2 = round(230.1 + random.uniform(-2.0, 2.0), 1)
    voltage_l3 = round(229.5 + random.uniform(-2.0, 2.0), 1)
    
    current_l1 = round(120.0 + random.uniform(-10.0, 15.0), 1)
    current_l2 = round(118.5 + random.uniform(-10.0, 15.0), 1)
    current_l3 = round(122.2 + random.uniform(-10.0, 15.0), 1)
    
    # Cos phi (power factor) - ideally >= 0.95 to avoid reactive penalty in Turkey
    power_factor = round(0.92 + random.uniform(-0.04, 0.06), 2)
    power_factor = min(1.0, max(0.7, power_factor))
    
    # Calculate active power: P = V * I * Cos(phi) * 3 / 1000 (kW)
    avg_v = (voltage_l1 + voltage_l2 + voltage_l3) / 3
    avg_i = (current_l1 + current_l2 + current_l3) / 3
    active_power_kw = round((avg_v * avg_i * 3 * power_factor) / 1000, 2)
    
    # Calculate reactive power: Q = P * tan(acos(pf))
    import math
    try:
        reactive_power_kvar = round(active_power_kw * math.tan(math.acos(power_factor)), 2)
    except Exception:
        reactive_power_kvar = round(active_power_kw * 0.3, 2)

    # Cumulative kWh simulation (increases over time)
    now = datetime.now(timezone.utc)
    seconds_in_day = (now.hour * 3600) + (now.minute * 60) + now.second
    cumulative_kwh = round(152400.0 + (seconds_in_day * (active_power_kw / 3600.0)), 2)

    return {
        "timestamp": now.isoformat(),
        "voltages": {"L1": voltage_l1, "L2": voltage_l2, "L3": voltage_l3},
        "currents": {"L1": current_l1, "L2": current_l2, "L3": current_l3},
        "active_power_kw": active_power_kw,
        "reactive_power_kvar": reactive_power_kvar,
        "power_factor": power_factor,
        "frequency_hz": 50.0,
        "cumulative_kwh": cumulative_kwh,
    }

def calculate_energy_efficiency(cumulative_kwh: float, country_code: str = "TR") -> Dict[str, Any]:
    """
    Computes ISO 50001-style energy efficiency rating and recommendations.
    """
    factor = GRID_FACTORS.get(country_code.upper(), GRID_FACTORS["DEFAULT"])
    carbon_emissions_t = round((cumulative_kwh * factor) / 1000, 3)

    # Simulated production units and intensity
    production_units = 150000  # pieces/tons
    current_intensity = round(cumulative_kwh / production_units, 3) # kWh per unit
    baseline_intensity = 1.25 # Historical baseline

    intensity_improvement_pct = round(((baseline_intensity - current_intensity) / baseline_intensity) * 100, 1)

    # Calculate 0-100 score
    # Factors: Intensity improvement (40%), Power Factor (30%), Peak Load Optimization (30%)
    intensity_score = max(0, min(40, int(intensity_improvement_pct * 2 + 20)))
    
    # We will simulate a sample power factor of 0.93
    sample_pf = 0.93
    pf_score = 30 if sample_pf >= 0.95 else (15 if sample_pf >= 0.90 else 5)
    
    peak_score = 25 # Good peak shaving
    
    total_score = intensity_score + pf_score + peak_score
    total_score = min(100, max(0, total_score))

    # Recommendations list
    recommendations = []
    if sample_pf < 0.95:
        recommendations.append(
            f"Güç faktörü (Cos φ = {sample_pf}) reaktif sınırın altında. Reaktif ceza ödememek için kompanzasyon panosundaki kondansatör kademelerini kontrol edin."
        )
    if intensity_improvement_pct < 5:
        recommendations.append(
            "Enerji yoğunluğu azaltım hızı yavaş. Motor sürücülerinde (VFD) frekans ayarlarını optimize edin veya verimli motorlara geçişi planlayın."
        )
    else:
        recommendations.append(
            "Verimlilik eğriniz olumlu. Isı geri kazanım sistemleri yatırımı ile doğalgaz/buhar yoğunluğunu da düşürmeyi değerlendirin."
        )

    return {
        "efficiency_score": total_score,
        "energy_intensity_kwh_per_unit": current_intensity,
        "baseline_intensity": baseline_intensity,
        "improvement_pct": intensity_improvement_pct,
        "grid_factor_applied": factor,
        "carbon_equivalent_tco2e": carbon_emissions_t,
        "recommendations": recommendations
    }
