from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from ..services.tnfd_engine import assess_tnfd, DEMO_RESULT, LEAP_PHASES, TNFD_DISCLOSURES, NATURE_RISK_CATEGORIES, SECTOR_NATURE_DEPS

router = APIRouter(prefix="/api/tnfd", tags=["TNFD Nature-related Financial Disclosures"])


class TNFDAssessRequest(BaseModel):
    sector: str = "tekstil"
    completed_disclosures: list[str] = []
    leap_progress: Optional[dict[str, int]] = None


@router.post("/assess")
async def assess(body: TNFDAssessRequest):
    return assess_tnfd(
        sector=body.sector,
        completed_disclosures=body.completed_disclosures,
        leap_progress=body.leap_progress,
    )


@router.get("/demo")
async def get_demo():
    return DEMO_RESULT


@router.get("/leap-phases")
async def get_leap():
    return {"phases": LEAP_PHASES}


@router.get("/disclosures")
async def get_disclosures():
    return {"disclosures": TNFD_DISCLOSURES}


@router.get("/sectors")
async def get_sectors():
    return {"sectors": list(SECTOR_NATURE_DEPS.keys()), "risk_categories": NATURE_RISK_CATEGORIES}
