from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import json

from ..database import get_db
from ..models.taxonomy_engine import calculate_full_taxonomy, NACE_DB
from ..models.taxonomy_schema import TaxonomyCalculationRequest, TaxonomyResult

router = APIRouter(
    prefix="/api/taxonomy",
    tags=["EU Taxonomy"],
    responses={404: {"description": "Not found"}},
)

@router.post("/calculate", response_model=TaxonomyResult, summary="Calculate full EU Taxonomy alignment")
async def calculate_taxonomy_alignment(
    request: TaxonomyCalculationRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Performs a full EU Taxonomy calculation including Eligibility, Alignment,
    DNSH, and Minimum Safeguards checks.
    """
    result = calculate_full_taxonomy(request)
    # TODO: Save result to database
    return result

@router.get("/company/{company_id}", summary="Get Taxonomy results for a company")
async def get_company_taxonomy_results(company_id: str, year: int, db: AsyncSession = Depends(get_db)):
    # TODO: Fetch results from the database
    raise HTTPException(status_code=501, detail="Fetching saved results not yet implemented.")

@router.get("/nace/{code}", summary="Query NACE code details for Taxonomy")
async def get_nace_details(code: str):
    """Retrieves Taxonomy eligibility information for a given NACE code."""
    details = NACE_DB.get(code.upper())
    if not details:
        raise HTTPException(status_code=404, detail=f"NACE code '{code}' not found in Taxonomy database.")
    return details

@router.post("/report/{company_id}", summary="Generate EU Taxonomy Report (Not Implemented)")
async def create_taxonomy_report(company_id: str, year: int, db: AsyncSession = Depends(get_db)):
    raise HTTPException(status_code=501, detail="Report generation from Taxonomy results is not yet implemented.")