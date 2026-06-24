"""
Alert Engine (Anomali Tespiti).
ERP'den veya manuel girilen verilerdeki ani sapmaları (Örn: Geçen yıla/aya göre %30 artış) yakalar.
"""

def detect_anomalies(current_data: dict, historical_data: dict) -> list[dict]:
    """
    Şirketin mevcut (veya yeni girilen) verileriyle geçmiş verilerini karşılaştırarak anomalileri bulur.
    current_data format: {"electricity_kwh": 150000, "natural_gas_m3": 50000, ...}
    historical_data format: {"electricity_kwh": 100000, "natural_gas_m3": 55000, ...}
    """
    anomalies = []
    
    # Basit bir eşik (Threshold): %30'dan fazla artış varsa anomali sayılır
    THRESHOLD_PERCENT = 30.0
    
    metrics_to_check = {
        "electricity_kwh": "Elektrik Tüketimi (kWh)",
        "natural_gas_m3": "Doğalgaz Tüketimi (m³)",
        "diesel_liters": "Dizel Tüketimi (Litre)"
    }
    
    for key, label in metrics_to_check.items():
        curr_val = current_data.get(key, 0)
        hist_val = historical_data.get(key, 0)
        
        if hist_val > 0 and curr_val > 0:
            increase_percent = ((curr_val - hist_val) / hist_val) * 100
            
            if increase_percent > THRESHOLD_PERCENT:
                anomalies.append({
                    "metric": key,
                    "label": label,
                    "current": curr_val,
                    "historical": hist_val,
                    "increase_percent": round(increase_percent, 1),
                    "severity": "high" if increase_percent > 50 else "medium",
                    "message": f"{label} geçen döneme göre %{round(increase_percent, 1)} artış gösterdi."
                })
                
    return anomalies
