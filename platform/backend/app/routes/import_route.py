"""
Magic Import API — Excel/CSV akıllı içe aktarma.
"""
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid
from datetime import datetime, timezone

from .auth import get_current_user
from ..database import get_db
from ..models import EmissionRecord, User
from ..services.import_engine import parse_import_file, apply_mapping

router = APIRouter(prefix="/import", tags=["import"])

MAX_FILE_SIZE_MB = 10


class ColumnConfirm(BaseModel):
    original_name: str
    target_field: Optional[str] = None


class ImportConfirmRequest(BaseModel):
    filename: str
    year: int = 2024
    sector: str = "manufacturing"
    reporting_boundary: str = "operational_control"
    column_mappings: list[ColumnConfirm]
    raw_rows: list[dict]


@router.post("/preview")
async def preview_import(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """
    Dosyayı analiz et, sütun eşlemesini döndür.
    Kullanıcı eşlemeyi onaylamadan hiçbir şey kaydedilmez.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="Dosya adı gerekli.")

    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"Dosya {MAX_FILE_SIZE_MB}MB sınırını aşıyor.")

    try:
        preview = parse_import_file(file_bytes, file.filename)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    return {
        "filename": preview.filename,
        "row_count": preview.row_count,
        "mapped_count": preview.mapped_count,
        "unmapped_columns": preview.unmapped_columns,
        "column_mappings": [
            {
                "original_name": m.original_name,
                "mapped_field": m.mapped_field,
                "confidence": m.confidence,
                "sample_values": m.sample_values,
                "unit_hint": m.unit_hint,
            }
            for m in preview.column_mappings
        ],
    }


@router.post("/confirm")
async def confirm_import(
    body: ImportConfirmRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Kullanıcının onayladığı sütun eşlemesini uygula ve emisyon kaydı oluştur.
    Birden fazla satır varsa her satır ayrı kayıt olarak eklenir.
    """
    confirmed: dict[str, str] = {
        c.original_name: c.target_field or ''
        for c in body.column_mappings
        if c.target_field
    }

    if not confirmed:
        raise HTTPException(status_code=422, detail="En az bir sütun eşlenmeli.")

    records = apply_mapping(body.raw_rows, confirmed)
    if not records:
        raise HTTPException(status_code=422, detail="Veri dönüştürülemedi. Sütun eşlemesini kontrol edin.")

    # Her satır için ayrı EmissionRecord oluştur (ya da tek kayıt toplu)
    # Basit: tüm satırları ortalayarak tek kayıt yap (çok tesisli için Sprint 17'de ayrıştır)
    merged: dict = {
        "company_id": str(current_user.company_id),
        "year": body.year,
        "sector": body.sector,
        "reporting_boundary": body.reporting_boundary,
    }
    numeric_fields: dict[str, list[float]] = {}
    for rec in records:
        for k, v in rec.items():
            if k in ('year', 'sector', 'reporting_boundary'):
                continue
            if isinstance(v, (int, float)):
                numeric_fields.setdefault(k, []).append(float(v))

    for k, vals in numeric_fields.items():
        merged[k] = sum(vals)  # toplam (genellikle tek yıllık veri)

    emission = EmissionRecord(**merged)
    db.add(emission)
    await db.commit()
    await db.refresh(emission)

    return {
        "success": True,
        "record_id": str(emission.id),
        "records_processed": len(records),
        "message": f"{len(records)} satır işlendi, 1 emisyon kaydı oluşturuldu.",
    }
