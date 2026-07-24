from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from ..database import get_db
from ..models.taxonomy_engine import calculate_full_taxonomy, NACE_DB
from ..models.taxonomy_schema import TaxonomyCalculationRequest, TaxonomyResult
from ..models.taxonomy_assessment import TaxonomyAssessment
from ..services.rbac import get_active_company_id, verify_tenant
from .auth import get_current_user
from ..models.user import User

router = APIRouter(
    prefix="/api/taxonomy",
    tags=["EU Taxonomy"],
    responses={404: {"description": "Not found"}},
)


async def save_taxonomy_assessment(db: AsyncSession, result: TaxonomyResult, nace_code: str) -> TaxonomyAssessment:
    """TaxonomyResult'ı company_id+yıl bazında upsert eder (EmissionRecord/MaterialityAssessment deseni)."""
    existing_q = await db.execute(
        select(TaxonomyAssessment).where(
            TaxonomyAssessment.company_id == result.company_id,
            TaxonomyAssessment.assessment_year == result.year,
        )
    )
    row = existing_q.scalar_one_or_none()
    if row is None:
        row = TaxonomyAssessment(company_id=result.company_id, assessment_year=result.year)
        db.add(row)

    row.nace_code = nace_code
    row.eligibility_percent = result.eligibility_percent
    row.alignment_percent = result.alignment_percent
    row.objectives = result.objectives
    row.turnover_percent = result.turnover_percent
    row.capex_percent = result.capex_percent
    row.opex_percent = result.opex_percent
    row.recommendations = result.recommendations
    row.status = result.status
    await db.commit()
    await db.refresh(row)
    return row


@router.post("/calculate", response_model=TaxonomyResult, summary="Calculate full EU Taxonomy alignment")
async def calculate_taxonomy_alignment(
    request: TaxonomyCalculationRequest,
    company_id: str = Depends(get_active_company_id),
    db: AsyncSession = Depends(get_db),
):
    """
    Performs a full EU Taxonomy calculation including Eligibility, Alignment,
    DNSH, and Minimum Safeguards checks. Sonuç, kimliği doğrulanmış şirkete
    kalıcı olarak kaydedilir (body'deki company_id yok sayılır — tenant güvenliği).
    """
    request.company_id = company_id
    result = calculate_full_taxonomy(request)
    await save_taxonomy_assessment(db, result, nace_code=request.nace_code)
    return result


@router.get("/company/{company_id}", response_model=TaxonomyResult, summary="Get Taxonomy results for a company")
async def get_company_taxonomy_results(
    company_id: str,
    year: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    verify_tenant(company_id, current_user)

    query = select(TaxonomyAssessment).where(TaxonomyAssessment.company_id == company_id)
    if year is not None:
        query = query.where(TaxonomyAssessment.assessment_year == year)
    query = query.order_by(TaxonomyAssessment.assessment_year.desc()).limit(1)

    row = (await db.execute(query)).scalar_one_or_none()
    if not row:
        raise HTTPException(404, "Bu şirket için henüz kaydedilmiş bir Taksonomi değerlendirmesi yok.")

    return TaxonomyResult(
        company_id=row.company_id,
        year=row.assessment_year,
        eligibility_percent=row.eligibility_percent,
        alignment_percent=row.alignment_percent,
        objectives=row.objectives or {},
        turnover_percent=row.turnover_percent,
        capex_percent=row.capex_percent,
        opex_percent=row.opex_percent,
        recommendations=row.recommendations or [],
        status=row.status,
    )


@router.get("/nace/{code}", summary="Query NACE code details for Taxonomy")
async def get_nace_details(code: str):
    """Retrieves Taxonomy eligibility information for a given NACE code."""
    details = NACE_DB.get(code.upper())
    if not details:
        raise HTTPException(status_code=404, detail=f"NACE code '{code}' not found in Taxonomy database.")
    return details


@router.post("/report/{company_id}", summary="Generate EU Taxonomy Report Summary")
async def create_taxonomy_report(
    company_id: str,
    year: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Kaydedilmiş Taksonomi değerlendirmesinden yapılandırılmış bir özet üretir.
    Not: Bu, tam bir AI/PDF raporu DEĞİL — ham hesaplama sonucundan okunabilir
    bir özet. Tam rapor için mevcut `POST /reports/generate` akışı kullanılmalı
    (o akış zaten bu motoru dahili olarak çağırıp compliance_detail'e gömüyor).
    """
    verify_tenant(company_id, current_user)

    row = (
        await db.execute(
            select(TaxonomyAssessment).where(
                TaxonomyAssessment.company_id == company_id,
                TaxonomyAssessment.assessment_year == year,
            )
        )
    ).scalar_one_or_none()
    if not row:
        raise HTTPException(404, f"{year} yılı için kaydedilmiş bir Taksonomi değerlendirmesi bulunamadı.")

    nace_info = NACE_DB.get(row.nace_code, {})
    return {
        "company_id": row.company_id,
        "year": row.assessment_year,
        "nace_code": row.nace_code,
        "sector_label": nace_info.get("description", row.nace_code),
        "summary": (
            f"{row.assessment_year} yılı için AB Taksonomi uygunluk oranı %{row.eligibility_percent:.0f}, "
            f"uyum oranı %{row.alignment_percent:.0f} ({row.status})."
        ),
        "eligibility_percent": row.eligibility_percent,
        "alignment_percent": row.alignment_percent,
        "turnover_percent": row.turnover_percent,
        "capex_percent": row.capex_percent,
        "opex_percent": row.opex_percent,
        "objectives": row.objectives or {},
        "recommendations": row.recommendations or [],
        "status": row.status,
        "generated_at": row.updated_at.isoformat() if row.updated_at else None,
    }
