"""Sector-based emission data validation with anomaly detection."""
from dataclasses import dataclass

@dataclass
class ValidationWarning:
    field: str
    value: float
    unit: str
    message: str
    severity: str  # "warning" | "error"

# Sector reference ranges: {sector: {field: (min, max, unit)}}
SECTOR_BASELINES: dict[str, dict[str, tuple]] = {
    "manufacturing": {
        "electricity_kwh": (50_000, 50_000_000, "kWh"),
        "natural_gas_m3": (1_000, 5_000_000, "m³"),
        "diesel_liters": (500, 500_000, "litre"),
        "waste_tons": (1, 10_000, "ton"),
        "employee_kwh_ratio": (500, 50_000, "kWh/çalışan"),
    },
    "banking": {
        "electricity_kwh": (10_000, 5_000_000, "kWh"),
        "natural_gas_m3": (100, 500_000, "m³"),
        "business_travel_flight_km": (1_000, 10_000_000, "km"),
        "employee_kwh_ratio": (200, 10_000, "kWh/çalışan"),
    },
    "retail": {
        "electricity_kwh": (100_000, 100_000_000, "kWh"),
        "natural_gas_m3": (1_000, 1_000_000, "m³"),
        "waste_tons": (10, 50_000, "ton"),
        "employee_kwh_ratio": (1_000, 30_000, "kWh/çalışan"),
    },
    "energy": {
        "electricity_kwh": (1_000_000, 10_000_000_000, "kWh"),
        "natural_gas_m3": (10_000, 100_000_000, "m³"),
        "diesel_liters": (10_000, 10_000_000, "litre"),
    },
    "construction": {
        "electricity_kwh": (10_000, 10_000_000, "kWh"),
        "diesel_liters": (5_000, 2_000_000, "litre"),
        "natural_gas_m3": (500, 500_000, "m³"),
        "waste_tons": (10, 100_000, "ton"),
    },
    "cement": {
        "electricity_kwh": (500_000, 500_000_000, "kWh"),
        "coal_tons": (1_000, 1_000_000, "ton"),
        "clinker_tons": (10_000, 5_000_000, "ton"),
    },
    "healthcare": {
        "electricity_kwh": (50_000, 20_000_000, "kWh"),
        "natural_gas_m3": (1_000, 2_000_000, "m³"),
        "waste_tons": (5, 5_000, "ton"),
    },
    "technology": {
        "electricity_kwh": (10_000, 50_000_000, "kWh"),
        "natural_gas_m3": (0, 200_000, "m³"),
        "business_travel_flight_km": (5_000, 20_000_000, "km"),
        "employee_kwh_ratio": (500, 20_000, "kWh/çalışan"),
    },
}

FIELD_LABELS = {
    "electricity_kwh": "Elektrik tüketimi",
    "natural_gas_m3": "Doğal gaz",
    "diesel_liters": "Motorin",
    "coal_tons": "Kömür",
    "waste_tons": "Atık miktarı",
    "business_travel_flight_km": "İş seyahati (uçuş)",
    "employee_commute_km": "Çalışan ulaşımı",
    "clinker_tons": "Klinker üretimi",
    "employee_kwh_ratio": "Çalışan başı elektrik",
}


def validate_emission_data(
    data: dict,
    sector: str,
    employee_count: int | None = None,
) -> list[ValidationWarning]:
    warnings: list[ValidationWarning] = []
    baselines = SECTOR_BASELINES.get(sector, SECTOR_BASELINES["manufacturing"])

    for field, (min_val, max_val, unit) in baselines.items():
        if field == "employee_kwh_ratio":
            if employee_count and employee_count > 0:
                kwh = data.get("electricity_kwh", 0) or 0
                ratio = kwh / employee_count
                if ratio < min_val:
                    warnings.append(ValidationWarning(
                        field="electricity_kwh",
                        value=ratio,
                        unit=unit,
                        message=f"Çalışan başı elektrik ({ratio:,.0f} kWh) sektör minimumunun ({min_val:,.0f} kWh) altında. Değerleri kontrol edin.",
                        severity="warning",
                    ))
                elif ratio > max_val:
                    warnings.append(ValidationWarning(
                        field="electricity_kwh",
                        value=ratio,
                        unit=unit,
                        message=f"Çalışan başı elektrik ({ratio:,.0f} kWh) sektör maksimumunun ({max_val:,.0f} kWh) üzerinde. Değerleri kontrol edin.",
                        severity="warning",
                    ))
            continue

        value = data.get(field)
        if value is None or value == 0:
            continue

        label = FIELD_LABELS.get(field, field)
        if value < min_val:
            warnings.append(ValidationWarning(
                field=field,
                value=float(value),
                unit=unit,
                message=f"{label} ({value:,.1f} {unit}), {sector} sektörü için beklenenden çok düşük (min: {min_val:,.0f} {unit}). Değeri kontrol edin.",
                severity="warning",
            ))
        elif value > max_val:
            warnings.append(ValidationWarning(
                field=field,
                value=float(value),
                unit=unit,
                message=f"{label} ({value:,.1f} {unit}), {sector} sektörü için beklenenden çok yüksek (max: {max_val:,.0f} {unit}). Değeri kontrol edin.",
                severity="error",
            ))

    return warnings
