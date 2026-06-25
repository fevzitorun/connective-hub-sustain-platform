"""Rapor şablonları API."""
from fastapi import APIRouter, Depends
from .auth import get_current_user
from ..models.report_template import BUILTIN_TEMPLATES

router = APIRouter(prefix="/templates", tags=["templates"])


@router.get("")
async def list_templates(current_user=Depends(get_current_user)):
    """Kullanılabilir rapor şablonları listesi."""
    return {
        "templates": [
            {
                "id": t["id"],
                "name": t["name"],
                "standard": t["standard"],
                "language": t["language"],
                "description": t["description"],
                "required_sections": t["required_sections"],
                "regulatory_refs": t["regulatory_refs"],
            }
            for t in BUILTIN_TEMPLATES
            if t["is_active"]
        ]
    }


@router.get("/{template_id}")
async def get_template(template_id: str, current_user=Depends(get_current_user)):
    """Belirli bir şablonun detayı."""
    tmpl = next((t for t in BUILTIN_TEMPLATES if t["id"] == template_id), None)
    if not tmpl:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Şablon bulunamadı")
    return tmpl
