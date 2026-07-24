from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models.gar_engine import calculate_bank_gar
from ..services.integrations import IntegrationNotConfigured

router = APIRouter(
    prefix="/api/gar",
    tags=["BDDK Green Asset Ratio (GAR)"],
    responses={404: {"description": "Not found"}},
)

@router.get("/calculate/{bank_id}", summary="Calculate Green Asset Ratio for a Bank")
async def get_gar_calculation(bank_id: str, year: int, db: AsyncSession = Depends(get_db)):
    """
    Calculates the Green Asset Ratio (GAR) for a bank's portfolio by assessing
    each asset's alignment with the EU Taxonomy.
    """
    try:
        result = calculate_bank_gar(bank_id, year)
        return result
    except IntegrationNotConfigured as e:
        # Canlı portföy entegrasyonu bağlanana kadar — sahte veri döndürmüyoruz
        raise HTTPException(status_code=503, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
