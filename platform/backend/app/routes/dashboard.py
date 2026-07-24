"""
Dashboard özet KPI endpoint'i.
Şirkete ait gerçek emisyon ve rapor verilerini döndürür.
"""
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, asc
from ..database import get_db
from ..services.rbac import get_active_company_id
from ..models.company import Company
from ..models.emission import EmissionRecord
from ..models.report import Report
from ..models.user import User
from ..services.tsrs_engine import TSRS_DEADLINES

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

_TR_MONTHS = {
    "ocak": 1, "şubat": 2, "mart": 3, "nisan": 4, "mayıs": 5, "haziran": 6,
    "temmuz": 7, "ağustos": 8, "eylül": 9, "ekim": 10, "kasım": 11, "aralık": 12,
}


def _parse_tr_deadline(deadline: str) -> datetime | None:
    """'31 Mart 2025' → datetime. Parse edilemeyen ('2027+' gibi) girdiler için None."""
    parts = deadline.strip().split()
    if len(parts) != 3:
        return None
    day_str, month_str, year_str = parts
    month = _TR_MONTHS.get(month_str.lower())
    if not month or not day_str.isdigit() or not year_str.isdigit():
        return None
    return datetime(int(year_str), month, int(day_str), tzinfo=timezone.utc)


@router.get("/summary")
async def get_dashboard_summary(
    company_id: str = Depends(get_active_company_id),
    db: AsyncSession = Depends(get_db),
):
    """Şirkete ait güncel KPI özeti."""

    company = await db.get(Company, company_id)

    # Tüm emisyon geçmişi (trend grafiği için)
    history_q = await db.execute(
        select(EmissionRecord)
        .where(EmissionRecord.company_id == company_id)
        .order_by(asc(EmissionRecord.year))
    )
    emission_history = history_q.scalars().all()
    latest_emission = emission_history[-1] if emission_history else None

    # Toplam rapor sayısı
    report_count_q = await db.execute(
        select(func.count(Report.id)).where(Report.company_id == company_id)
    )
    report_count = report_count_q.scalar_one() or 0

    # Onaylı rapor sayısı
    approved_q = await db.execute(
        select(func.count(Report.id)).where(
            Report.company_id == company_id,
            Report.status == "approved",
        )
    )
    approved_count = approved_q.scalar_one() or 0

    # Son raporlar (5 adet)
    recent_reports_q = await db.execute(
        select(Report)
        .where(Report.company_id == company_id)
        .order_by(desc(Report.created_at))
        .limit(5)
    )
    recent_reports = recent_reports_q.scalars().all()

    # Emission verisinden KPI'lar
    if latest_emission:
        scope1 = float(latest_emission.scope1_co2e or 0)
        scope2 = float(latest_emission.scope2_location_co2e or 0)
        scope3 = float(latest_emission.scope3_co2e or 0)
        total = scope1 + scope2 + scope3
        year = latest_emission.year
        electricity_kwh = float(latest_emission.electricity_kwh or 0)
        renewable_ratio = float(latest_emission.renewable_ratio or 0) * 100
    else:
        scope1 = scope2 = scope3 = total = 0.0
        year = 2024
        electricity_kwh = 0.0
        renewable_ratio = 0.0

    # Uyum skoru + kontrol listesi: son tamamlanmış rapor
    compliance_q = await db.execute(
        select(Report.compliance_score, Report.compliance_grade, Report.compliance_detail)
        .where(
            Report.company_id == company_id,
            Report.status.in_(["completed", "approved", "published"]),
            Report.compliance_score.isnot(None),
        )
        .order_by(desc(Report.created_at))
        .limit(1)
    )
    compliance_row = compliance_q.first()
    compliance_score = compliance_row[0] if compliance_row else None
    compliance_grade = compliance_row[1] if compliance_row else None
    compliance_detail = compliance_row[2] if compliance_row else None
    compliance_checks = (
        (compliance_detail or {}).get("tsrs_checks", {}).get("checks")
        if compliance_detail else None
    )

    # Gerçek TSRS takvimi (tsrs_engine.TSRS_DEADLINES) — kurgusal tarih yok
    now = datetime.now(timezone.utc)
    deadlines = []
    for d in TSRS_DEADLINES:
        parsed = _parse_tr_deadline(d["deadline"])
        deadlines.append({
            "segment": d["segment"],
            "deadline": d["deadline"],
            "regulator": d["regulator"],
            "mandatory": d["mandatory"],
            "note": d["note"],
            "days_left": (parsed - now).days if parsed else None,
        })
    deadlines.sort(key=lambda x: (x["days_left"] is None, x["days_left"]))

    return {
        "company_id": company_id,
        "company": {
            "name": company.name if company else None,
            "sector": company.sector if company else None,
            "employee_count": company.employee_count if company else None,
        },
        "reporting_year": year,
        "emissions": {
            "scope1": round(scope1, 1),
            "scope2": round(scope2, 1),
            "scope3": round(scope3, 1),
            "total": round(total, 1),
            "unit": "ton CO₂e",
        },
        "emissions_history": [
            {
                "year": e.year,
                "scope1": round(float(e.scope1_co2e or 0), 1),
                "scope2": round(float(e.scope2_location_co2e or 0), 1),
                "scope3": round(float(e.scope3_co2e or 0), 1),
                "total": round(
                    float(e.scope1_co2e or 0) + float(e.scope2_location_co2e or 0) + float(e.scope3_co2e or 0), 1
                ),
            }
            for e in emission_history
        ],
        "energy": {
            "electricity_kwh": round(electricity_kwh, 0),
            "renewable_pct": round(renewable_ratio, 1),
        },
        "reports": {
            "total": report_count,
            "approved": approved_count,
            "recent": [
                {
                    "id": r.id,
                    "standard": r.standard,
                    "status": r.status,
                    "language": r.language,
                    "compliance_score": r.compliance_score,
                    "compliance_grade": r.compliance_grade,
                    "version_number": r.version_number,
                    "created_at": r.created_at.isoformat() if r.created_at else None,
                }
                for r in recent_reports
            ],
        },
        "compliance": {
            "score": compliance_score,
            "grade": compliance_grade,
            "checks": compliance_checks,
        },
        "deadlines": deadlines,
    }
