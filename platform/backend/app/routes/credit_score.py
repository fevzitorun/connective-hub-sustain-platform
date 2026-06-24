"""Kredi Puanlama API — Bankalar için ESG kredi risk skoru. Sadece auditor/admin."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database import get_db
from ..models import Company, User, EmissionRecord, Report
from ..services.credit_scoring import calculate_credit_score
from ..services.rbac import require_role
from .auth import get_current_user

router = APIRouter(prefix="/credit-score", tags=["credit-score"])


@router.get("/{company_id}")
async def get_credit_score(
    company_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Şirketin ESG kredi puanını hesapla.
    Sadece auditor (rol>=30) ve admin (rol>=60) erişebilir.
    """
    require_role("auditor")(current_user)

    company = await db.get(Company, company_id)
    if not company:
        raise HTTPException(404, "Şirket bulunamadı")

    # Son onaylı rapordan TSRS uyum skoru
    report_result = await db.execute(
        select(Report)
        .where(Report.company_id == company_id, Report.status == "approved")
        .order_by(Report.created_at.desc())
        .limit(1)
    )
    last_report = report_result.scalar_one_or_none()
    tsrs_score = last_report.compliance_score if last_report else None

    # Son emisyon kaydı
    emission_result = await db.execute(
        select(EmissionRecord)
        .where(EmissionRecord.company_id == company_id)
        .order_by(EmissionRecord.reporting_year.desc())
        .limit(1)
    )
    emission = emission_result.scalar_one_or_none()

    carbon_intensity = 0.0
    sector_carbon_avg = 12.5
    total_emissions = 0.0
    renewable_pct = 0.0

    if emission:
        total_emissions = float((emission.scope1_direct or 0) + (emission.scope2_location or 0))
        employees = company.employee_count or 1
        carbon_intensity = total_emissions / employees
        renewable_pct = float(emission.renewable_energy_pct or 0)

    # Sektöre göre ortalama (benchmark_service ile paralel)
    from ..services.benchmark_service import SECTOR_BENCHMARKS
    sector_key = (company.sector or "bankacılık").lower()
    bench = SECTOR_BENCHMARKS.get(sector_key, SECTOR_BENCHMARKS["bankacılık"])
    sector_carbon_avg = bench["carbon_intensity_avg"]

    result = calculate_credit_score(
        company_id=company_id,
        company_name=company.name,
        sector=company.sector or "bankacılık",
        carbon_intensity=carbon_intensity,
        sector_carbon_avg=sector_carbon_avg,
        tsrs_compliance_score=tsrs_score,
        total_emissions=total_emissions,
        revenue_tl=float(company.annual_revenue_tl or 0),
        renewable_pct=renewable_pct,
        has_sbti_commitment=False,
        has_third_party_assurance=tsrs_score is not None,
    )

    return {
        "company_id": result.company_id,
        "company_name": result.company_name,
        "sector": result.sector,
        "total_score": result.total_score,
        "risk_category": result.risk_category,
        "rating": result.rating,
        "components": result.components,
        "recommendations": result.recommendations,
        "eligible_for_green_bond": result.eligible_for_green_bond,
        "eligible_for_sustainability_linked": result.eligible_for_sustainability_linked,
    }


@router.get("/demo/preview")
async def demo_credit_score(current_user: User = Depends(get_current_user)):
    """Demo kredi skoru — kendi şirketin için önizleme (tüm roller)."""
    result = calculate_credit_score(
        company_id="demo",
        company_name="Demo Şirket A.Ş.",
        sector="bankacılık",
        carbon_intensity=2.1,
        sector_carbon_avg=3.4,
        tsrs_compliance_score=78,
        renewable_pct=22,
        has_sbti_commitment=False,
        has_third_party_assurance=True,
    )
    return {
        "company_id": result.company_id,
        "company_name": result.company_name,
        "sector": result.sector,
        "total_score": result.total_score,
        "risk_category": result.risk_category,
        "rating": result.rating,
        "components": result.components,
        "recommendations": result.recommendations,
        "eligible_for_green_bond": result.eligible_for_green_bond,
        "eligible_for_sustainability_linked": result.eligible_for_sustainability_linked,
    }
