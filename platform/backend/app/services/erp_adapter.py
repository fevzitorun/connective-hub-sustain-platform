"""
Connective Hub ERP Adaptörü.
Dış sistemlerden (SAP, Logo vb.) gelen ham verileri harmonize edip sistem standartlarımıza çevirir.
"""

def normalize_payload(raw_data: dict) -> dict:
    """
    Farklı field isimleriyle gelebilecek ERP verilerini standartlaştırır.
    Örn: 'elektrik_mwh' -> { 'type': 'electricity', 'value': 100, 'unit': 'mwh' }
    """
    normalized = []
    
    # Çok temel bir mapping, geliştirilebilir.
    for key, value in raw_data.items():
        key_lower = key.lower()
        if not isinstance(value, (int, float)):
            continue
            
        if "elektrik" in key_lower or "electricity" in key_lower:
            unit = "mwh" if "mwh" in key_lower else "kwh" if "kwh" in key_lower else "joule" if "joule" in key_lower else "unknown"
            normalized.append({"type": "electricity", "value": value, "unit": unit})
            
        elif "dogalgaz" in key_lower or "naturalgas" in key_lower:
            unit = "m3" if "m3" in key_lower else "btu" if "btu" in key_lower else "unknown"
            normalized.append({"type": "natural_gas", "value": value, "unit": unit})
            
        elif "dizel" in key_lower or "diesel" in key_lower:
            unit = "lt" if "lt" in key_lower or "liter" in key_lower else "unknown"
            normalized.append({"type": "diesel", "value": value, "unit": unit})
            
    return {"data": normalized}

def convert_units(normalized_data: dict) -> dict:
    """
    Standartlaştırılan listeyi, sistemimizin beklediği net metrik birimlerine çevirir (kWh, m3, litre).
    """
    result = {
        "electricity_kwh": 0.0,
        "natural_gas_m3": 0.0,
        "diesel_liters": 0.0
    }
    
    for item in normalized_data.get("data", []):
        val = item["value"]
        unit = item["unit"]
        
        if item["type"] == "electricity":
            if unit == "mwh":
                result["electricity_kwh"] += val * 1000
            elif unit == "joule":
                result["electricity_kwh"] += val * 0.000000277778  # 1 J = 2.77e-7 kWh
            elif unit == "kwh":
                result["electricity_kwh"] += val
                
        elif item["type"] == "natural_gas":
            if unit == "btu":
                # Kaba çevrim: 1 m3 doğalgaz yaklaşık 35300 BTU'dur.
                result["natural_gas_m3"] += val / 35300.0
            elif unit == "m3":
                result["natural_gas_m3"] += val
                
        elif item["type"] == "diesel":
            if unit in ["lt", "liter", "litre"]:
                result["diesel_liters"] += val
                
    return result

def process_erp_sync(raw_payload: dict) -> dict:
    """Tam adaptör akışı"""
    normalized = normalize_payload(raw_payload)
    converted = convert_units(normalized)
    return converted
