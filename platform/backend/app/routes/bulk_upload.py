"""EMİR 4: Toplu veri yükleme (Excel/CSV) ve şablon indirme."""
import io
import csv
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database import get_db
from ..models import User, EmissionRecord, Company
from ..services.rbac import require_permission
from ..services.validation_engine import validate_emission_data
from .auth import get_current_user

router = APIRouter(prefix="/emissions", tags=["emissions"])

TEMPLATE_FIELDS = [
    ("yil", "Yıl", "2024"),
    ("dogalgaz_m3", "Doğal Gaz (m³)", "50000"),
    ("motorin_litre", "Motorin (litre)", "10000"),
    ("lpg_kg", "LPG (kg)", ""),
    ("komur_ton", "Kömür (ton)", ""),
    ("arac_km", "Şirket Araçları (km)", "100000"),
    ("elektrik_kwh", "Elektrik (kWh)", "500000"),
    ("elektrik_kaynak", "Elektrik Kaynağı (grid/yenilenebilir)", "grid"),
    ("buhar_gj", "Buhar (GJ)", ""),
    ("is_seyahat_km", "İş Seyahati Uçuş (km)", "20000"),
    ("calisanulasim_km", "Çalışan Ulaşımı (km)", ""),
    ("atik_ton", "Atık (ton)", "50"),
    ("su_m3", "Su Tüketimi (m³)", "2000"),
]


def _parse_float(val: str) -> float | None:
    val = val.strip().replace(",", ".")
    if not val:
        return None
    try:
        return float(val)
    except ValueError:
        return None


@router.get("/template")
async def download_template(current_user: User = Depends(get_current_user)):
    """EMİR 4: Excel/CSV şablonu indir."""
    output = io.StringIO()
    writer = csv.writer(output)
    # Header satırı (Türkçe etiketler)
    writer.writerow([label for _, label, _ in TEMPLATE_FIELDS])
    # Örnek satır
    writer.writerow([example for _, _, example in TEMPLATE_FIELDS])

    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8-sig")),  # BOM for Excel
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=emisyon_sablonu.csv"},
    )


@router.post("/bulk-upload")
async def bulk_upload(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """EMİR 4: CSV yükle, parse et, validate et, kaydet."""
    _ = require_permission("emissions:create")(current_user)

    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(400, "Sadece .csv dosyası kabul edilmektedir")

    content = await file.read()
    try:
        text = content.decode("utf-8-sig")
    except UnicodeDecodeError:
        text = content.decode("latin-1")

    reader = csv.DictReader(io.StringIO(text))

    # Alan adı eşleştirme (Türkçe etiket → alan adı)
    label_to_field = {label: field for field, label, _ in TEMPLATE_FIELDS}

    co_result = await db.execute(select(Company).where(Company.id == current_user.company_id))
    company = co_result.scalar_one_or_none()
    if not company:
        raise HTTPException(404, "Şirket bulunamadı")

    results = []
    errors = []

    for row_num, row in enumerate(reader, start=2):  # 2: header=1, data=2+
        # Alan adlarını normalize et
        data = {}
        for col_name, value in row.items():
            if col_name in label_to_field:
                data[label_to_field[col_name]] = value
            else:
                data[col_name] = value

        yil_str = data.get("yil", "").strip()
        if not yil_str:
            errors.append({"row": row_num, "error": "Yıl alanı zorunludur"})
            continue
        try:
            year = int(yil_str)
        except ValueError:
            errors.append({"row": row_num, "field": "yil", "error": f"Geçersiz yıl: {yil_str}"})
            continue
        if year < 2015 or year > 2030:
            errors.append({"row": row_num, "field": "yil", "error": f"Yıl 2015-2030 arasında olmalı: {year}"})
            continue

        electricity_kwh = _parse_float(data.get("elektrik_kwh", ""))
        natural_gas_m3 = _parse_float(data.get("dogalgaz_m3", ""))
        diesel_liters = _parse_float(data.get("motorin_litre", ""))
        lpg_kg = _parse_float(data.get("lpg_kg", ""))
        coal_tons = _parse_float(data.get("komur_ton", ""))
        company_vehicles_km = _parse_float(data.get("arac_km", ""))
        steam_gj = _parse_float(data.get("buhar_gj", ""))
        business_travel_km = _parse_float(data.get("is_seyahat_km", ""))
        employee_commute_km = _parse_float(data.get("calisanulasim_km", ""))
        waste_tons = _parse_float(data.get("atik_ton", ""))
        water_m3 = _parse_float(data.get("su_m3", ""))
        electricity_source = data.get("elektrik_kaynak", "grid").strip() or "grid"

        # Validation
        validation_data = {
            "electricity_kwh": electricity_kwh or 0,
            "natural_gas_m3": natural_gas_m3 or 0,
            "diesel_liters": diesel_liters or 0,
            "waste_tons": waste_tons or 0,
            "business_travel_flight_km": business_travel_km or 0,
        }
        warnings = validate_emission_data(
            validation_data,
            sector=company.sector or "manufacturing",
            employee_count=company.employee_count,
        )
        row_warnings = [{"field": w.field, "message": w.message, "severity": w.severity} for w in warnings]

        # Mevcut kayıt var mı?
        existing_result = await db.execute(
            select(EmissionRecord).where(
                EmissionRecord.company_id == current_user.company_id,
                EmissionRecord.year == year,
            )
        )
        existing = existing_result.scalar_one_or_none()

        if existing:
            existing.natural_gas_m3 = natural_gas_m3
            existing.diesel_liters = diesel_liters
            existing.lpg_kg = lpg_kg
            existing.coal_tons = coal_tons
            existing.company_vehicles_km = company_vehicles_km
            existing.electricity_kwh = electricity_kwh
            existing.electricity_source = electricity_source
            existing.steam_gj = steam_gj
            existing.business_travel_flight_km = business_travel_km
            existing.employee_commute_km = employee_commute_km
            existing.waste_tons = waste_tons
            existing.water_m3 = water_m3
            record_id = existing.id
            action = "updated"
        else:
            record = EmissionRecord(
                company_id=current_user.company_id,
                year=year,
                natural_gas_m3=natural_gas_m3,
                diesel_liters=diesel_liters,
                lpg_kg=lpg_kg,
                coal_tons=coal_tons,
                company_vehicles_km=company_vehicles_km,
                electricity_kwh=electricity_kwh,
                electricity_source=electricity_source,
                steam_gj=steam_gj,
                business_travel_flight_km=business_travel_km,
                employee_commute_km=employee_commute_km,
                waste_tons=waste_tons,
                water_m3=water_m3,
            )
            db.add(record)
            await db.flush()
            record_id = record.id
            action = "created"

        results.append({
            "row": row_num,
            "year": year,
            "id": record_id,
            "action": action,
            "warnings": row_warnings,
        })

    await db.commit()

    return {
        "processed": len(results),
        "errors": len(errors),
        "results": results,
        "error_details": errors,
    }
