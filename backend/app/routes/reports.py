import asyncio
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func
from pydantic import BaseModel
from typing import Optional
from ..database import get_db, AsyncSessionLocal
from ..models import Report, EmissionRecord, Company, User, ReportDraft
from ..services.ai_report_writer import generate_tsrs_report
from ..services.calculation_engine import SECTOR_BENCHMARKS, calculate_tsrs_compliance
from .auth import get_current_user

router = APIRouter(prefix="/reports", tags=["reports"])


class GenerateReportRequest(BaseModel):
    emission_id: str
    standard: str = "tsrs"
    language: str = "tr"
    assurance_firm: Optional[str] = "PwC"


class DraftRequest(BaseModel):
    standard: str = "tsrs"
    language: str = "tr"
    assurance_firm: Optional[str] = None
    form_data: Optional[dict] = None


async def _run_report_generation(
    report_id: str,
    emission_id: str,
    company_id: str,
    assurance_firm: str,
):
    """Background task with its own DB session — avoids closed-session bug."""
    async with AsyncSessionLocal() as db:
        try:
            emission = await db.get(EmissionRecord, emission_id)
            company = await db.get(Company, company_id)

            if not emission or not company:
                raise ValueError("Emisyon verisi veya şirket bulunamadı")

            sector_avg = SECTOR_BENCHMARKS.get(company.sector or "manufacturing", 2.4)

            # Run blocking Anthropic call in thread pool — never blocks event loop
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


# ─── Draft endpoints (must come before /{report_id} routes) ──────────────────

@router.post("/drafts")
async def save_draft(
    body: DraftRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ReportDraft).where(ReportDraft.user_id == current_user.id)
    )
    draft = result.scalar_one_or_none()

    if draft:
        draft.standard = body.standard
        draft.language = body.language
        draft.assurance_firm = body.assurance_firm
        draft.form_data = body.form_data
        draft.updated_at = datetime.now(timezone.utc)
    else:
        draft = ReportDraft(
            user_id=current_user.id,
            company_id=current_user.company_id,
            standard=body.standard,
            language=body.language,
            assurance_firm=body.assurance_firm,
            form_data=body.form_data,
        )
        db.add(draft)

    await db.commit()
    await db.refresh(draft)
    return {"id": draft.id, "updated_at": draft.updated_at.isoformat()}


@router.get("/drafts/latest")
async def get_draft(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ReportDraft).where(ReportDraft.user_id == current_user.id)
    )
    draft = result.scalar_one_or_none()
    if not draft:
        raise HTTPException(404, "Taslak bulunamadı")
    return {
        "id": draft.id,
        "standard": draft.standard,
        "language": draft.language,
        "assurance_firm": draft.assurance_firm,
        "form_data": draft.form_data,
        "updated_at": draft.updated_at.isoformat(),
    }


@router.delete("/drafts", status_code=204)
async def delete_draft(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ReportDraft).where(ReportDraft.user_id == current_user.id)
    )
    draft = result.scalar_one_or_none()
    if draft:
        await db.delete(draft)
        await db.commit()


# ─── Version history ──────────────────────────────────────────────────────────

@router.get("/{report_id}/versions")
async def get_versions(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    report = await db.get(Report, report_id)
    if not report or report.company_id != current_user.company_id:
        raise HTTPException(404, "Rapor bulunamadı")

    root_id = report.version_of or report.id

    result = await db.execute(
        select(Report)
        .where(
            or_(Report.id == root_id, Report.version_of == root_id),
            Report.company_id == current_user.company_id,
        )
        .order_by(Report.version_number)
    )
    versions = result.scalars().all()

    return [
        {
            "id": r.id,
            "version_number": r.version_number,
            "status": r.status,
            "compliance_score": r.compliance_score,
            "compliance_grade": r.compliance_grade,
            "ai_model": r.ai_model,
            "created_at": r.created_at.isoformat(),
        }
        for r in versions
    ]


# ─── Generate (with versioning) ───────────────────────────────────────────────

@router.post("/generate", status_code=202)
async def generate(
    body: GenerateReportRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    em_result = await db.execute(
        select(EmissionRecord).where(EmissionRecord.id == body.emission_id)
    )
    emission = em_result.scalar_one_or_none()
    if not emission:
        raise HTTPException(404, "Emisyon verisi bulunamadı")

    co_result = await db.execute(
        select(Company).where(Company.id == current_user.company_id)
    )
    company = co_result.scalar_one_or_none()
    if not company:
        raise HTTPException(404, "Şirket bulunamadı")

    # Versioning: find existing root report for this emission + standard
    root_result = await db.execute(
        select(Report)
        .where(
            Report.company_id == current_user.company_id,
            Report.emission_data_id == body.emission_id,
            Report.standard == body.standard,
            Report.version_of.is_(None),
        )
        .order_by(Report.created_at.asc())
        .limit(1)
    )
    root_report = root_result.scalar_one_or_none()

    version_of_id = None
    version_number = 1

    if root_report:
        max_result = await db.execute(
            select(func.max(Report.version_number))
            .where(or_(Report.id == root_report.id, Report.version_of == root_report.id))
        )
        max_version = max_result.scalar() or 1
        version_of_id = root_report.id
        version_number = max_version + 1

    report = Report(
        company_id=current_user.company_id,
        emission_data_id=body.emission_id,
        standard=body.standard,
        language=body.language,
        status="generating",
        assurance_firm=body.assurance_firm,
        version_number=version_number,
        version_of=version_of_id,
    )
    db.add(report)
    await db.commit()
    await db.refresh(report)

    # Pass only IDs — background task creates its own session
    background_tasks.add_task(
        _run_report_generation,
        report.id,
        body.emission_id,
        current_user.company_id,
        body.assurance_firm or "PwC",
    )

    return {"id": report.id, "status": "generating", "version_number": version_number}


# ─── Status & listing ─────────────────────────────────────────────────────────

@router.get("/{report_id}/status")
async def get_status(
    report_id: str,
    current_user: User = Depends(get_current_user),  # noqa: ARG001 — auth guard
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
        "created_at": report.created_at.isoformat(),
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
            "created_at": r.created_at.isoformat(),
        }
        for r in reports
    ]
