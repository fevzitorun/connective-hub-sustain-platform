"""
CBAM (Carbon Border Adjustment Mechanism) Motoru.
Ürün bazlı gömülü emisyon hesaplama ve Sınır Karbon Vergisi (EU ETS) simülasyonu.
"""

# Sektörel Varsayılan Gömülü Emisyon Katsayıları (ton CO2e / ton ürün)
# Bu değerler, Avrupa Komisyonu'nun varsayılan CBAM değerlerine dayanır.
CBAM_SECTOR_FACTORS = {
    "çelik": 1.89,
    "alüminyum": 8.02,
    "çimento": 0.82,
    "gübre": 2.14,
    "elektrik": 0.0,
    "hidrojen": 8.9,
}

EU_ETS_DEFAULT_PRICE_EUR = 71.0  # Güncel EUA (European Emission Allowances) fiyatı

def calculate_product_footprint(total_emissions: float, goods_tons: float) -> float:
    """
    Şirketin ürettiği spesifik ürünlerin karbon yoğunluğunu (ton CO2e / ton ürün) hesaplar.
    Eğer ürün bazlı direkt ölçüm yoksa, toplam emisyonun üretim hacmine bölünmesiyle basit yoğunluk bulunur.
    """
    if goods_tons <= 0:
        return 0.0
    return total_emissions / goods_tons

def simulate_cbam_tax(
    goods_tons: float, 
    sector: str, 
    eu_ets_price: float = EU_ETS_DEFAULT_PRICE_EUR,
    custom_embedded_factor: float = None
) -> float:
    """
    AB sınırında ödenecek muhtemel karbon vergisini (EUR) simüle eder.
    """
    sector_key = sector.lower()
    
    # Kullanıcı kendi ürün karbon ayak izini girdiyse onu kullan, yoksa varsayılan sektörel katsayı.
    if custom_embedded_factor is not None and custom_embedded_factor > 0:
        embedded_factor = custom_embedded_factor
    else:
        embedded_factor = CBAM_SECTOR_FACTORS.get(sector_key, 0.0)
        
    embedded_emissions = goods_tons * embedded_factor
    
    # Vergi = Gömülü Emisyon * Karbon Fiyatı
    cbam_tax = embedded_emissions * eu_ets_price
    
    return cbam_tax

def get_cbam_summary(sector: str, goods_tons: float, total_emissions: float = None) -> dict:
    """
    Arayüz için kapsamlı SKDM özetini döndürür.
    """
    sector_key = sector.lower()
    custom_factor = calculate_product_footprint(total_emissions, goods_tons) if total_emissions else None
    tax_eur = simulate_cbam_tax(goods_tons, sector_key, EU_ETS_DEFAULT_PRICE_EUR, custom_factor)
    
    return {
        "sector": sector_key,
        "goods_tons": goods_tons,
        "embedded_factor_used": custom_factor if custom_factor else CBAM_SECTOR_FACTORS.get(sector_key, 0.0),
        "is_default_factor": custom_factor is None,
        "eu_ets_price": EU_ETS_DEFAULT_PRICE_EUR,
        "estimated_tax_eur": round(tax_eur, 2)
    }

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..models import EmissionRecord
from .calculation_engine import EmissionInput, calculate_iso14064

async def import_from_iso14064(db: AsyncSession, company_id: str, year: int) -> dict:
    stmt = select(EmissionRecord).where(
        EmissionRecord.company_id == company_id,
        EmissionRecord.year == year
    )
    res = await db.execute(stmt)
    record = res.scalar_one_or_none()
    
    if not record:
        return None
        
    input_data = EmissionInput(
        company_id=str(company_id),
        year=record.year,
        electricity_kwh=record.electricity_kwh or 0.0,
        natural_gas_m3=record.natural_gas_m3,
        diesel_liters=record.diesel_liters,
        lpg_kg=record.lpg_kg,
        coal_tons=record.coal_tons,
        company_vehicles_km=record.company_vehicles_km,
        fugitive_emissions_kg=record.fugitive_emissions_kg,
        business_travel_flight_km=record.business_travel_flight_km,
        employee_commute_km=record.employee_commute_km,
        waste_tons=record.waste_tons,
        financed_emissions_co2e=record.financed_emissions_co2e
    )
    
    result = calculate_iso14064(input_data)
    
    # Map to CBAM sectors roughly based on typical mapping if exact match fails
    sector_map = {
        "manufacturing": "çelik", 
        "cement": "çimento", 
        "energy": "elektrik"
    }
    mapped_sector = sector_map.get(record.sector, "çelik") # fallback to steel
    
    return {
        "year": year,
        "sector": mapped_sector,
        "direct_emissions": result.scope1_co2e,
        "indirect_emissions": result.scope2_location_co2e,
        "total_cbam_emissions": round(result.scope1_co2e + result.scope2_location_co2e, 2),
        "iso14064_record_id": record.id
    }

