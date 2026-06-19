"""EMİR 1+3: Rapor oluşturma, versiyonlama ve onay workflow."""
import asyncio
import secrets
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
from ..database import get_db, AsyncSessionLocal
from ..models import Report, EmissionRecord, Company, User
from ..models.report import ShareLink
from ..services.ai_report_writer import generate_tsrs_report
from ..services.calculation_engine import SECTOR_BENCHMARKS, calculate_tsrs_compliance
from ..services.rbac import require_permission, can
from ..services.auth import hash_password, verify_password
from .auth import get_current_user

router = APIRouter(prefix="/reports", tags=["reports"])


class GenerateReportRequest(BaseModel):
    emission_id: str
    standard: str = "tsrs"
    language: str = "tr"
    assurance_firm: Optional[str] = "PwC"


class ApproveRequest(BaseModel):
    action: str  # "approve" | "reject"
    reason: Optional[str] = None


class ShareRequest(BaseModel):
    password: Optional[str] = None
    expires_days: Optional[int] = 7
    max_views: Optional[int] = None


async def _run_report_generation(
    report_id: str,
    emission_id: str,
    company_id: str,
    assurance_firm: str,
):
    async with AsyncSessionLocal() as db:
        try:
            emission = await db.get(EmissionRecord, emission_id)
            company = await db.get(Company, company_id)

            if not emission or not company:
                raise ValueError("Emisyon verisi veya şirket bulunamadı")

            sector_avg = SECTOR_BENCHMARKS.get(company.sector or "manufacturing", 2.4)

            text, usage = await asyncio.to_thread(
                generate_tsrs_report,
                company_name=company.name,
                sector=company.sector or "Bilinmiyor",
                sasb_volume=company.sasb_volume or "Belirsiz",
                employee_count=company.employee_count or 100,
                year=emission.year,
                reporting_boundary=emission.reporting_boundary,
                scope1_co2e=float(emission.scope1_co2e or 0),
                scope2_location_co2e=float(emission.scope2_location_co2e or 0),
                scope2_market_co2e=float(emission.scope2_market_co2e or 0),
                scope3_co2e=float(emission.scope3_co2e or 0),
                total_co2e=float(
                    (emission.scope1_co2e or 0)
                    + (emission.scope2_location_co2e or 0)
                    + (emission.scope3_co2e or 0)
                ),
                natural_gas_m3=float(emission.natural_gas_m3 or 0),
                diesel_liters=float(emission.diesel_liters or 0),
                electricity_kwh=float(emission.electricity_kwh or 0),
                electricity_source=emission.electricity_source,
                business_travel_km=float(emission.business_travel_flight_km or 0),
                waste_tons=float(emission.waste_tons or 0),
                earthquake_zone=emission.earthquake_zone or "Belirsiz",
                flood_risk=emission.flood_risk or "Orta",
                drought_risk=emission.drought_risk or "Düşük",
                is_regulated=company.is_regulated,
                is_public=company.is_public,
                assurance_firm=assurance_firm,
                sector_avg_intensity=sector_avg,
            )

            compliance = calculate_tsrs_compliance({
                "scope1_co2e": float(emission.scope1_co2e or 0),
                "scope2_location": float(emission.scope2_location_co2e or 0),
                "scope2_market": float(emission.scope2_market_co2e or 0),
                "has_scope3_analysis": bool(emission.scope3_co2e),
                "has_energy_metrics": bool(emission.electricity_kwh),
                "has_cross_industry_metrics": True,
                "has_sector_metrics": bool(company.sector),
                "has_risks_opportunities": True,
                "has_scenario_analysis": company.is_regulated or company.is_public,
                "has_transition_plan": company.net_zero_target_year is not None,
                "has_climate_targets": company.net_zero_target_year is not None,
                "has_board_oversight": True,
                "has_management_role": True,
                "has_incentive_mechanisms": company.is_public,
                "has_time_horizons": True,
                "has_business_model": True,
                "has_risk_process": True,
                "has_risk_integration": company.is_regulated,
                "has_tsrs_index": True,
                "has_assurance_statement": bool(assurance_firm),
            })

            report = await db.get(Report, report_id)
            if report:
                report.content_text = text
                report.status = "completed"
                report.ai_model = "claude-sonnet-4-6"
                report.prompt_tokens = usage.get("input_tokens", 0)
                report.completion_tokens = usage.get("output_tokens", 0)
                report.compliance_score = compliance["total_score"]
                report.compliance_grade = compliance["grade"]
                await db.commit()

        except Exception as e:
            async with AsyncSessionLocal() as err_db:
                report = await err_db.get(Report, report_id)
                if report:
                    report.status = "failed"
                    report.content_text = f"Hata: {str(e)}"
                    await err_db.commit()


@router.post("/generate", status_code=202)
async def generate(
    body: GenerateReportRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    _ = require_permission("reports:create")(current_user)

    em_result = await db.execute(select(EmissionRecord).where(EmissionRecord.id == body.emission_id))
    emission = em_result.scalar_one_or_none()
    if not emission:
        raise HTTPException(404, "Emisyon verisi bulunamadı")

    co_result = await db.execute(select(Company).where(Company.id == current_user.company_id))
    company = co_result.scalar_one_or_none()
    if not company:
        raise HTTPException(404, "Şirket bulunamadı")

    # Versiyonlama: aynı emission için önceki rapor var mı?
    existing_result = await db.execute(
        select(Report)
        .where(
            Report.company_id == current_user.company_id,
            Report.emission_data_id == body.emission_id,
            Report.version_of == None,  # noqa: E711 — kök raporlar
        )
        .order_by(Report.version_number.desc())
    )
    latest = existing_result.scalars().first()

    version_number = 1
    version_of = None
    if latest:
        version_number = latest.version_number + 1
        version_of = latest.id

    report = Report(
        company_id=current_user.company_id,
        emission_data_id=body.emission_id,
        standard=body.standard,
        language=body.language,
        status="generating",
        assurance_firm=body.assurance_firm,
        version_number=version_number,
        version_of=version_of,
    )
    db.add(report)
    await db.commit()
    await db.refresh(report)

    background_tasks.add_task(
        _run_report_generation,
        report.id,
        body.emission_id,
        current_user.company_id,
        body.assurance_firm or "PwC",
    )

    return {"id": report.id, "status": "generating", "version_number": version_number}


@router.get("/{report_id}/status")
async def get_status(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Report).where(Report.id == report_id))
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(404, "Rapor bulunamadı")

    return {
        "id": report.id,
        "status": report.status,
        "content_text": report.content_text if report.status in ("completed", "failed") else None,
        "ai_model": report.ai_model,
        "prompt_tokens": report.prompt_tokens,
        "completion_tokens": report.completion_tokens,
        "compliance_score": report.compliance_score,
        "compliance_grade": report.compliance_grade,
        "version_number": report.version_number,
        "version_of": report.version_of,
        "submitted_at": report.submitted_at.isoformat() if report.submitted_at else None,
        "approved_at": report.approved_at.isoformat() if report.approved_at else None,
        "created_at": report.created_at.isoformat(),
    }


@router.get("/{report_id}/versions")
async def get_versions(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """EMİR 1: Bir raporun tüm versiyonlarını listele."""
    # Önce bu raporun kök versiyonunu bul
    result = await db.execute(select(Report).where(Report.id == report_id))
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(404, "Rapor bulunamadı")

    root_id = report.version_of or report_id

    # Tüm versiyonları getir
    versions_result = await db.execute(
        select(Report)
        .where(
            (Report.id == root_id) | (Report.version_of == root_id),
            Report.company_id == current_user.company_id,
        )
        .order_by(Report.version_number.asc())
    )
    versions = versions_result.scalars().all()

    return [
        {
            "id": v.id,
            "version_number": v.version_number,
            "status": v.status,
            "compliance_score": v.compliance_score,
            "compliance_grade": v.compliance_grade,
            "created_at": v.created_at.isoformat(),
        }
        for v in versions
    ]


@router.post("/{report_id}/submit")
async def submit_for_approval(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """EMİR 3: Raporu onaya gönder."""
    result = await db.execute(
        select(Report).where(
            Report.id == report_id,
            Report.company_id == current_user.company_id,
        )
    )
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(404, "Rapor bulunamadı")
    if report.status not in ("completed", "rejected"):
        raise HTTPException(400, f"Bu durumdaki rapor onaya gönderilemez: {report.status}")

    report.status = "pending"
    report.submitted_at = datetime.now(timezone.utc)
    await db.commit()
    return {"status": "pending", "submitted_at": report.submitted_at.isoformat()}


@router.post("/{report_id}/approve")
async def approve_or_reject(
    report_id: str,
    body: ApproveRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """EMİR 3: Onay ver veya reddet (admin/editor)."""
    _ = require_permission("reports:approve")(current_user)

    result = await db.execute(
        select(Report).where(
            Report.id == report_id,
            Report.company_id == current_user.company_id,
        )
    )
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(404, "Rapor bulunamadı")
    if report.status != "pending":
        raise HTTPException(400, "Sadece 'onay bekliyor' durumundaki raporlar işlenebilir")

    if body.action == "approve":
        report.status = "approved"
        report.approved_at = datetime.now(timezone.utc)
        report.approved_by = current_user.id
    elif body.action == "reject":
        report.status = "rejected"
        report.rejection_reason = body.reason
    else:
        raise HTTPException(400, "Geçersiz işlem. 'approve' veya 'reject' kullanın.")

    await db.commit()
    return {"status": report.status}


@router.post("/{report_id}/publish")
async def publish_report(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """EMİR 3: Onaylanan raporu yayınla (admin only)."""
    _ = require_permission("reports:publish")(current_user)

    result = await db.execute(
        select(Report).where(
            Report.id == report_id,
            Report.company_id == current_user.company_id,
        )
    )
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(404, "Rapor bulunamadı")
    if report.status != "approved":
        raise HTTPException(400, "Sadece onaylanmış raporlar yayınlanabilir")

    report.status = "published"
    report.published_at = datetime.now(timezone.utc)
    await db.commit()
    return {"status": "published", "published_at": report.published_at.isoformat()}


@router.post("/{report_id}/share")
async def create_share_link(
    report_id: str,
    body: ShareRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """EMİR 5: Şifre korumalı, süre sınırlı paylaşım linki oluştur."""
    _ = require_permission("reports:share")(current_user)

    result = await db.execute(
        select(Report).where(
            Report.id == report_id,
            Report.company_id == current_user.company_id,
        )
    )
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(404, "Rapor bulunamadı")

    from datetime import timedelta
    token = secrets.token_urlsafe(32)
    expires_at = None
    if body.expires_days:
        expires_at = datetime.now(timezone.utc) + timedelta(days=body.expires_days)

    link = ShareLink(
        report_id=report_id,
        token=token,
        password_hash=hash_password(body.password) if body.password else None,
        expires_at=expires_at,
        max_views=body.max_views,
        created_by=current_user.id,
    )
    db.add(link)
    await db.commit()

    return {
        "token": token,
        "url": f"/public/reports/{token}",
        "expires_at": expires_at.isoformat() if expires_at else None,
        "password_protected": bool(body.password),
    }


@router.get("/public/{token}")
async def view_shared_report(
    token: str,
    password: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """EMİR 5: Token ile paylaşılmış raporu görüntüle."""
    result = await db.execute(select(ShareLink).where(ShareLink.token == token, ShareLink.is_active == True))  # noqa: E712
    link = result.scalar_one_or_none()
    if not link:
        raise HTTPException(404, "Paylaşım linki bulunamadı veya geçersiz")

    now = datetime.now(timezone.utc)
    if link.expires_at and link.expires_at < now:
        raise HTTPException(410, "Bu paylaşım linkinin süresi dolmuş")
    if link.max_views and link.view_count >= link.max_views:
        raise HTTPException(410, "Bu link maksimum görüntüleme sayısına ulaşmış")
    if link.password_hash:
        if not password or not verify_password(password, link.password_hash):
            raise HTTPException(401, "Şifre gerekli veya hatalı")

    # View count artır
    link.view_count += 1
    report = await db.get(Report, link.report_id)
    await db.commit()

    if not report:
        raise HTTPException(404, "Rapor bulunamadı")

    return {
        "id": report.id,
        "status": report.status,
        "content_text": report.content_text,
        "compliance_score": report.compliance_score,
        "compliance_grade": report.compliance_grade,
        "created_at": report.created_at.isoformat(),
        "version_number": report.version_number,
    }


@router.get("")
async def list_reports(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Report)
        .where(Report.company_id == current_user.company_id)
        .order_by(Report.created_at.desc())
    )
    reports = result.scalars().all()
    return [
        {
            "id": r.id,
            "standard": r.standard,
            "language": r.language,
            "status": r.status,
            "ai_model": r.ai_model,
            "compliance_score": r.compliance_score,
            "compliance_grade": r.compliance_grade,
            "version_number": r.version_number,
            "version_of": r.version_of,
            "submitted_at": r.submitted_at.isoformat() if r.submitted_at else None,
            "approved_at": r.approved_at.isoformat() if r.approved_at else None,
            "created_at": r.created_at.isoformat(),
        }
        for r in reports
    ]
