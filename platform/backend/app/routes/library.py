"""
Academic Library API — akademik makale bankası ve simülasyon bağlamlı öneri motoru.
"""
from fastapi import APIRouter, Query, Depends
from .auth import get_current_user
from ..services.library_service import ACADEMIC_PAPERS, get_research_recommendations

router = APIRouter(prefix="/library", tags=["library"])


@router.get("/papers")
async def list_papers(current_user=Depends(get_current_user)):
    """Tüm akademik makaleleri listele."""
    return {"papers": ACADEMIC_PAPERS, "total": len(ACADEMIC_PAPERS)}


@router.get("/recommend")
async def recommend_papers(
    topic: str = Query(..., description="Simülasyon konusu: solar_ges | battery | ev_fleet"),
    current_user=Depends(get_current_user),
):
    """Aktif simülasyon konusuna göre ilgili akademik makaleleri döndür."""
    results = get_research_recommendations(topic)
    return {"topic": topic, "papers": results, "count": len(results)}


@router.get("/papers/public")
async def list_papers_public():
    """Kimlik doğrulama gerektirmeyen genel makale listesi."""
    return {"papers": ACADEMIC_PAPERS, "total": len(ACADEMIC_PAPERS)}
