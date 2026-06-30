from fastapi import APIRouter
from pydantic import BaseModel
from typing import Any

from ..services.report_builder_engine import (
    build_report_outline,
    FRAMEWORKS, REPORT_TEMPLATES, SECTION_LIBRARY, DEMO_RESULT,
)

router = APIRouter(prefix="/report-builder", tags=["Report Builder"])


class BuildReportInput(BaseModel):
    company_name: str
    report_year: int
    frameworks: list[str]
    extra_sections: list[str] | None = None
    language: str = "tr"


@router.get("/demo")
async def report_builder_demo() -> dict[str, Any]:
    return DEMO_RESULT


@router.post("/build")
async def report_build(body: BuildReportInput) -> dict[str, Any]:
    return build_report_outline(
        company_name=body.company_name,
        report_year=body.report_year,
        frameworks=body.frameworks,
        extra_sections=body.extra_sections,
        language=body.language,
    )


@router.get("/frameworks")
async def list_frameworks() -> list[dict]:
    return FRAMEWORKS


@router.get("/templates")
async def list_templates() -> list[dict]:
    return REPORT_TEMPLATES


@router.get("/sections")
async def list_sections() -> list[dict]:
    return SECTION_LIBRARY
