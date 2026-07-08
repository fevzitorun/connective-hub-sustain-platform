from fastapi import APIRouter
from pydantic import BaseModel
from typing import Any

from ..services.esg_benchmark_engine import (
    calculate_esg_benchmark,
    BENCHMARK_DIMENSIONS, SECTOR_BENCHMARKS, DEMO_RESULT,
)

router = APIRouter(prefix="/esg-benchmark", tags=["ESG Benchmark"])


class BenchmarkInput(BaseModel):
    company_name: str
    sector: str
    company_scores: dict[str, float]


@router.get("/demo")
async def esg_benchmark_demo() -> dict[str, Any]:
    return DEMO_RESULT


@router.post("/assess")
async def esg_benchmark_assess(body: BenchmarkInput) -> dict[str, Any]:
    return calculate_esg_benchmark(
        company_name=body.company_name,
        sector=body.sector,
        company_scores=body.company_scores,
    )


@router.get("/dimensions")
async def list_dimensions() -> list[dict]:
    return BENCHMARK_DIMENSIONS


@router.get("/sectors")
async def list_sectors() -> list[str]:
    return list(SECTOR_BENCHMARKS.keys())
