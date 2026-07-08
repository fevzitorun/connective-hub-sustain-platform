from fastapi import APIRouter
from pydantic import BaseModel
from ..services.gri_engine import score_gri_completeness, DEMO_RESULT, GRI_STANDARDS, demo_completed_ids

router = APIRouter(prefix="/api/gri", tags=["GRI Universal Standards 2021"])


class GRIAssessRequest(BaseModel):
    completed_ids: list[str] = []
    maturity_score: float = 50.0


@router.post("/assess")
async def assess_gri(body: GRIAssessRequest):
    if not body.completed_ids and body.maturity_score:
        body.completed_ids = demo_completed_ids(body.maturity_score)
    return score_gri_completeness(body.completed_ids, body.maturity_score)


@router.get("/demo")
async def get_demo():
    return DEMO_RESULT


@router.get("/standards")
async def get_standards():
    return {"standards": GRI_STANDARDS}
