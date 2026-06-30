from fastapi import APIRouter
from pydantic import BaseModel
from ..services.scope3_engine import calculate_scope3, SCOPE3_CATEGORIES, DEMO_RESULT, DEMO_INPUTS

router = APIRouter(prefix="/api/scope3", tags=["GHG Protocol Scope 3 Value Chain"])


class Scope3Request(BaseModel):
    category_inputs: dict[int, float] = {}
    total_scope1_2: float = 1000.0


@router.post("/calculate")
async def calculate(body: Scope3Request):
    return calculate_scope3(body.category_inputs, body.total_scope1_2)


@router.get("/demo")
async def get_demo():
    return DEMO_RESULT


@router.get("/categories")
async def get_categories():
    return {"categories": SCOPE3_CATEGORIES}
