"""Belediye (Municipality) Modülü API — GPC kent envanteri + Sürdürülebilirlik Endeksi.

Metodoloji: platform/backend/app/data/municipality_library.md.
Hesaplar yalnızca sağlanan girdiden üretilir — sahte/mock veri döndürülmez.
"""
from fastapi import APIRouter
from pydantic import BaseModel, Field

from ..services.municipality_index_engine import (
    calculate_municipality_index,
    INDEX_CRITERIA,
    DIMENSION_LABELS,
)
from ..services.calculation_engine import calculate_gpc_inventory, GPC_SECTOR_LABELS

router = APIRouter(prefix="/municipality", tags=["Belediye (Municipality)"])


class MunicipalityIndexRequest(BaseModel):
    municipality_name: str
    year: int | None = None
    scores: dict[str, int] = Field(
        default_factory=dict,
        description="Kriter kimliği → 0-4 puan (INDEX_CRITERIA). Eksik kriter 0 sayılır.",
    )


class GpcInventoryRequest(BaseModel):
    municipality_name: str
    year: int | None = None
    reporting_level: str = "basic"  # basic | basic_plus
    sectors_tco2e: dict[str, float] = Field(
        default_factory=dict,
        description="GPC sektör anahtarı → ton CO₂e (stationary_energy, transportation, waste, ippu, afolu).",
    )
    scores: dict[str, int] | None = Field(
        default=None,
        description="Opsiyonel: verilirse Belediye Endeksi de hesaplanıp sonuca eklenir.",
    )


@router.get("/criteria", summary="Belediye Endeksi kriter listesi (form için)")
async def list_criteria():
    """SDG-eşleşmeli 30 kriter (Ekonomik/Sosyal/Çevresel) + boyut etiketleri."""
    return {
        "dimensions": DIMENSION_LABELS,
        "criteria": INDEX_CRITERIA,
        "scale": {
            0: "Hiç açıklama yok",
            1: "Minimum seviye",
            2: "Detaylı + taahhüt",
            3: "Faaliyet + süreç",
            4: "Faaliyet + süreç + sorumluluk",
        },
    }


@router.post("/index-score", summary="Belediye Sürdürülebilirlik Endeksi hesapla")
async def index_score(body: MunicipalityIndexRequest):
    """Akan & Şendurur (2016) 0-4 metodolojisi → boyut skorları + A-D harf notu."""
    return calculate_municipality_index(
        municipality_name=body.municipality_name,
        scores=body.scores,
        year=body.year,
    )


@router.post("/calculate", summary="GPC kent sera gazı envanteri (+ opsiyonel endeks)")
async def calculate(body: GpcInventoryRequest):
    """
    GPC (Global Protocol for Community-Scale) kent envanteri toplaması.
    `scores` verilirse Belediye Endeksi de hesaplanıp `index` alanında döner.
    """
    inventory = calculate_gpc_inventory(
        sectors_tco2e=body.sectors_tco2e,
        reporting_level=body.reporting_level,
    )
    result = {
        "municipality_name": body.municipality_name,
        "year": body.year,
        **inventory,
    }
    if body.scores is not None:
        result["index"] = calculate_municipality_index(
            municipality_name=body.municipality_name,
            scores=body.scores,
            year=body.year,
        )
    return result


@router.get("/sectors", summary="GPC sektör anahtarları/etiketleri")
async def list_sectors():
    return {"sectors": GPC_SECTOR_LABELS}
