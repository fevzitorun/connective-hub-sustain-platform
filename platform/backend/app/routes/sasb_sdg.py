from fastapi import APIRouter
from pydantic import BaseModel
from typing import Any

from ..services.sasb_sdg_engine import (
    assess_sasb_sdg,
    SASB_SECTORS, UN_SDGS, SECTOR_SDG_MAP, DEMO_RESULT,
)

router = APIRouter(prefix="/sasb-sdg", tags=["SASB & SDG"])


class SASBAssessInput(BaseModel):
    company_name: str
    sector_id: str
    metric_values: dict[str, float] = {}
    relevant_sdgs: list[int] | None = None


@router.get("/demo")
async def sasb_sdg_demo() -> dict[str, Any]:
    return DEMO_RESULT


@router.post("/assess")
async def sasb_sdg_assess(body: SASBAssessInput) -> dict[str, Any]:
    return assess_sasb_sdg(
        company_name=body.company_name,
        sector_id=body.sector_id,
        metric_values=body.metric_values,
        relevant_sdgs=body.relevant_sdgs,
    )


@router.get("/sectors")
async def list_sectors() -> list[dict]:
    return SASB_SECTORS


@router.get("/sdgs")
async def list_sdgs() -> list[dict]:
    return UN_SDGS
