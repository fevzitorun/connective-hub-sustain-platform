"""
Dashboard özet KPI endpoint'i.
Şirkete ait gerçek emisyon ve rapor verilerini döndürür.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from ..database import get_db
from .auth import get_current_user
from ..models.emission import EmissionRecord
from ..models.report import Report
from ..models.user import User

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary")
async def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Şirkete ait güncel KPI özeti."""
    company_id = current_user.company_id

    # Son emisyon kaydı
    emission_q = await db.execute(
        select(EmissionRecord)
        .where(EmissionRecord.company_id == company_id)
        .order_by(desc(EmissionRecord.year))
        .limit(1)
    )
    latest_emission = emission_q.scalar_one_or_none()

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

    # Uyum skoru: son tamamlanmış rapor
    compliance_q = await db.execute(
        select(Report.compliance_score, Report.compliance_grade)
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

    return {
        "company_id": company_id,
        "reporting_year": year,
        "emissions": {
            "scope1": round(scope1, 1),
            "scope2": round(scope2, 1),
            "scope3": round(scope3, 1),
            "total": round(total, 1),
            "unit": "ton CO₂e",
        },
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
                    "compliance_score": r.compliance_score,
                    "version_number": r.version_number,
                    "created_at": r.created_at.isoformat() if r.created_at else None,
                }
                for r in recent_reports
            ],
        },
        "compliance": {
            "score": compliance_score,
            "grade": compliance_grade,
        },
    }
