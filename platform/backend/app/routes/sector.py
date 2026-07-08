from fastapi import APIRouter
from ..services.sector_factors import get_all_sector_factors

router = APIRouter(prefix="/sector-factors", tags=["sectors"])

@router.get("")
async def list_sector_factors():
    return get_all_sector_factors()
