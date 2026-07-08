"""EMİR 6: Akıllı veri doğrulama ve anomaly detection."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
from ..database import get_db
from ..models import User, Company, EmissionRecord
from ..services.validation_engine import validate_emission_data
from .auth import get_current_user

router = APIRouter(prefix="/validate", tags=["validation"])


class ValidateRequest(BaseModel):
    electricity_kwh: Optional[float] = None
    natural_gas_m3: Optional[float] = None
    diesel_liters: Optional[float] = None
    coal_tons: Optional[float] = None
    waste_tons: Optional[float] = None
    business_travel_flight_km: Optional[float] = None
    employee_commute_km: Optional[float] = None
    sector: Optional[str] = None
    employee_count: Optional[int] = None


@router.post("/emissions")
async def validate_emissions(
    body: ValidateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """EMİR 6: Veri girişinde gerçek zamanlı anomaly kontrolü."""
    sector = body.sector
    employee_count = body.employee_count

    if not sector or not employee_count:
        co_result = await db.execute(select(Company).where(Company.id == current_user.company_id))
        company = co_result.scalar_one_or_none()
        if company:
            sector = sector or company.sector or "manufacturing"
            employee_count = employee_count or company.employee_count

    data = {
        "electricity_kwh": body.electricity_kwh or 0,
        "natural_gas_m3": body.natural_gas_m3 or 0,
        "diesel_liters": body.diesel_liters or 0,
        "coal_tons": body.coal_tons or 0,
        "waste_tons": body.waste_tons or 0,
        "business_travel_flight_km": body.business_travel_flight_km or 0,
        "employee_commute_km": body.employee_commute_km or 0,
    }

    warnings = validate_emission_data(data, sector=sector or "manufacturing", employee_count=employee_count)
    return {
        "sector": sector,
        "warnings": [
            {
                "field": w.field,
                "value": w.value,
                "unit": w.unit,
                "message": w.message,
                "severity": w.severity,
            }
            for w in warnings
        ],
        "has_errors": any(w.severity == "error" for w in warnings),
        "has_warnings": len(warnings) > 0,
    }


@router.get("/emissions/{emission_id}")
async def validate_existing_emission(
    emission_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mevcut emisyon kaydını sektör referanslarına göre doğrula."""
    em_result = await db.execute(
        select(EmissionRecord).where(
            EmissionRecord.id == emission_id,
            EmissionRecord.company_id == current_user.company_id,
        )
    )
    emission = em_result.scalar_one_or_none()
    if not emission:
        raise HTTPException(404, "Emisyon verisi bulunamadı")

    co_result = await db.execute(select(Company).where(Company.id == current_user.company_id))
    company = co_result.scalar_one_or_none()

    data = {
        "electricity_kwh": float(emission.electricity_kwh or 0),
        "natural_gas_m3": float(emission.natural_gas_m3 or 0),
        "diesel_liters": float(emission.diesel_liters or 0),
        "coal_tons": float(emission.coal_tons or 0),
        "waste_tons": float(emission.waste_tons or 0),
        "business_travel_flight_km": float(emission.business_travel_flight_km or 0),
    }

    sector = company.sector if company else "manufacturing"
    employee_count = company.employee_count if company else None
    warnings = validate_emission_data(data, sector=sector or "manufacturing", employee_count=employee_count)

    return {
        "emission_id": emission_id,
        "year": emission.year,
        "sector": sector,
        "warnings": [
            {"field": w.field, "value": w.value, "unit": w.unit, "message": w.message, "severity": w.severity}
            for w in warnings
        ],
        "is_clean": len(warnings) == 0,
    }


# ── Sprint 3 eki: Düzenleme bazlı uyum doğrulaması ──────────────────────
# ANTIGRAVITY-PROMPT.md satır 333:
#   /validate/{regulation}/company/{id}  ← CBAM, EUDR, TSRS, CSRD uyum

REGULATION_REQUIREMENTS: dict[str, dict] = {
    "tsrs": {
        "name": "TSRS 1 & 2 (KGK)",
        "required_fields": [
            "scope1_total", "scope2_total", "electricity_kwh",
            "natural_gas_m3", "employee_count",
        ],
        "optional_fields": [
            "scope3_total", "waste_tons", "water_m3",
            "renewable_energy_pct",
        ],
        "min_sections": ["governance", "strategy", "risk", "metrics"],
        "description": "Türkiye Sürdürülebilirlik Raporlama Standartları — KGK, 29.12.2023",
    },
    "cbam": {
        "name": "CBAM (AB Sınırda Karbon Düzenleme Mekanizması)",
        "required_fields": [
            "scope1_total", "electricity_kwh", "export_quantity",
        ],
        "sectors": ["cement", "iron_steel", "aluminium", "fertilizers", "electricity", "hydrogen"],
        "de_minimis_threshold_tonnes": 50,
        "description": "AB CBAM — Ocak 2026 tam rejim, yıllık beyanname zorunlu",
    },
    "eudr": {
        "name": "EUDR (AB Ormansızlaşma Düzenlemesi)",
        "required_fields": [
            "supply_chain_entries", "gps_coordinates", "deforestation_declaration",
        ],
        "commodities": ["cocoa", "coffee", "soy", "palm_oil", "rubber", "wood", "cattle"],
        "description": "AB EUDR — Aralık 2026, tedarik zinciri kanıtı zorunlu",
    },
    "csrd": {
        "name": "CSRD (AB Kurumsal Sürdürülebilirlik Raporlama Direktifi)",
        "required_fields": [
            "materiality_assessment", "scope1_total", "scope2_total",
            "scope3_total", "governance_disclosure",
        ],
        "description": "CSRD Omnibus I — 1100 → 430 zorunlu veri noktası",
    },
    "bddk_gar": {
        "name": "BDDK GAR (Yeşil Varlık Oranı)",
        "required_fields": [
            "green_assets", "total_eligible_assets", "taxonomy_alignment",
        ],
        "description": "BDDK Yeşil Varlık Oranı — 34 banka zorunlu",
    },
}


@router.get("/{regulation}/company/{company_id}")
async def validate_regulation_compliance(
    regulation: str,
    company_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Düzenleme bazlı uyum doğrulaması.
    Desteklenen düzenlemeler: tsrs, cbam, eudr, csrd, bddk_gar
    """
    regulation = regulation.lower()
    if regulation not in REGULATION_REQUIREMENTS:
        raise HTTPException(400, f"Desteklenmeyen düzenleme: {regulation}. "
                            f"Desteklenen: {', '.join(REGULATION_REQUIREMENTS.keys())}")

    # Şirket ve son emisyon verilerini çek
    co_result = await db.execute(select(Company).where(Company.id == company_id))
    company = co_result.scalar_one_or_none()
    if not company:
        raise HTTPException(404, "Şirket bulunamadı")

    # Kullanıcının aynı şirkette olduğunu doğrula (admin hariç)
    if current_user.role != "admin" and current_user.company_id != company_id:
        raise HTTPException(403, "Bu şirketin verilerine erişim yetkiniz yok")

    em_result = await db.execute(
        select(EmissionRecord)
        .where(EmissionRecord.company_id == company_id)
        .order_by(EmissionRecord.year.desc())
        .limit(1)
    )
    latest_emission = em_result.scalar_one_or_none()

    reg = REGULATION_REQUIREMENTS[regulation]
    checks = []
    score = 0
    total_checks = 0

    # Genel veri varlığı kontrolleri
    for field in reg["required_fields"]:
        total_checks += 1
        has_data = False
        if latest_emission and hasattr(latest_emission, field):
            val = getattr(latest_emission, field)
            has_data = val is not None and val != 0
        elif field == "employee_count" and company.employee_count:
            has_data = True
        elif field == "export_quantity" and company.is_exporter:
            has_data = True  # Placeholder — gerçek kontrol CBAM tablosundan
        elif field in ("supply_chain_entries", "gps_coordinates", "deforestation_declaration"):
            has_data = False  # EUDR tablosundan kontrol edilecek
        elif field in ("materiality_assessment", "governance_disclosure"):
            has_data = False  # Materiality tablosundan kontrol edilecek
        elif field in ("green_assets", "total_eligible_assets", "taxonomy_alignment"):
            has_data = False  # GAR tablosundan kontrol edilecek

        if has_data:
            score += 1
            checks.append({
                "field": field,
                "status": "pass",
                "message": f"{field} verisi mevcut",
            })
        else:
            checks.append({
                "field": field,
                "status": "fail",
                "message": f"{field} verisi eksik — {reg['name']} için zorunlu",
            })

    # Sektör uyumu (CBAM)
    if regulation == "cbam" and company.sector:
        total_checks += 1
        cbam_sectors = reg.get("sectors", [])
        sector_match = company.sector.lower() in cbam_sectors
        if sector_match or company.is_exporter:
            score += 1
            checks.append({
                "field": "sector_eligibility",
                "status": "pass",
                "message": f"Şirket sektörü ({company.sector}) CBAM kapsamında",
            })
        else:
            checks.append({
                "field": "sector_eligibility",
                "status": "info",
                "message": f"Şirket sektörü ({company.sector}) CBAM zorunlu kategorisinde değil",
            })

    compliance_pct = round((score / total_checks * 100) if total_checks > 0 else 0, 1)
    compliance_grade = (
        "A" if compliance_pct >= 90 else
        "B" if compliance_pct >= 70 else
        "C" if compliance_pct >= 50 else
        "D" if compliance_pct >= 30 else "F"
    )

    return {
        "company_id": company_id,
        "company_name": company.name,
        "regulation": regulation,
        "regulation_name": reg["name"],
        "regulation_description": reg["description"],
        "compliance_score": compliance_pct,
        "compliance_grade": compliance_grade,
        "checks_passed": score,
        "checks_total": total_checks,
        "checks": checks,
        "has_emission_data": latest_emission is not None,
        "latest_year": latest_emission.year if latest_emission else None,
    }

