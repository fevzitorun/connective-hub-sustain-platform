"""CSRD Double Materiality API — ESRS Çift Önemlilik analizi."""
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional
from ..database import get_db
from ..models import Company, User
from ..services.materiality_service import assess_materiality, get_esrs_topics
from ..models.taxonomy_engine import calculate_full_taxonomy
from ..models.materiality_engine import calculate_double_materiality
from ..models.taxonomy_schema import TaxonomyCalculationRequest
from .auth import get_current_user

router = APIRouter(prefix="/materiality", tags=["materiality"])


class MaterialityAssessRequest(BaseModel):
    sector: Optional[str] = None
    custom_scores: Optional[dict] = None  # {"E1": {"impact": 4.0, "financial": 3.5}, ...}


@router.get("/topics")
async def list_esrs_topics(current_user: User = Depends(get_current_user)):
    """ESRS konu listesi (E1-E5, S1-S4, G1)."""
    return {"topics": get_esrs_topics()}


@router.post("/assess")
async def assess(
    body: MaterialityAssessRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Özel skorlarla çift önemlilik matrisi oluştur."""
    company = await db.get(Company, current_user.company_id)
    sector = body.sector or (company.sector if company else "bankacılık") or "bankacılık"

    matrix = assess_materiality(
        company_id=current_user.company_id,
        sector=sector,
        custom_scores=body.custom_scores,
    )
    return _serialize(matrix)


@router.get("/{company_id}/matrix")
async def get_matrix(
    company_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Şirketin mevcut çift önemlilik matrisini getir."""
    company = await db.get(Company, company_id)
    sector = (company.sector if company else "bankacılık") or "bankacılık"

    matrix = assess_materiality(
        company_id=company_id,
        sector=sector,
    )
    return _serialize(matrix)


@router.get("/my/matrix")
async def get_my_matrix(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Oturum açmış kullanıcının şirketine ait matris."""
    company = await db.get(Company, current_user.company_id)
    sector = (company.sector if company else "bankacılık") or "bankacılık"

    matrix = assess_materiality(
        company_id=current_user.company_id,
        sector=sector,
    )
    return _serialize(matrix)


@router.post("/calculate_with_taxonomy", summary="EU Taksonomi entegrasyonlu çift önemlilik")
async def calculate_materiality_with_taxonomy(
    taxonomy_request: TaxonomyCalculationRequest = Body(...),
    db: AsyncSession = Depends(get_db),
):
    """
    EU Taksonomi sonuçlarıyla entegre çift önemlilik değerlendirmesi.

    1. EU Taksonomi motorunu çalıştırıp uyum skorunu alır.
    2. Skoru çift önemlilik motoruna besleyerek finansal önemliliği ayarlar.
    3. Nihai çift önemlilik matrisini döndürür.
    """
    try:
        taxonomy_result = calculate_full_taxonomy(taxonomy_request)
        return calculate_double_materiality(
            company_id=taxonomy_request.company_id,
            year=taxonomy_request.year,
            taxonomy_result=taxonomy_result,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Hesaplama hatası: {str(e)}")


def _serialize(matrix) -> dict:
    return {
        "company_id": matrix.company_id,
        "sector": matrix.sector,
        "material_topics": matrix.material_topics,
        "top_priorities": matrix.top_priorities,
        "items": [
            {
                "topic_id": item.topic_id,
                "topic_name": item.topic_name,
                "category": item.category,
                "impact_score": item.impact_score,
                "financial_score": item.financial_score,
                "is_material": item.is_material,
                "priority": item.priority,
            }
            for item in matrix.items
        ],
    }
