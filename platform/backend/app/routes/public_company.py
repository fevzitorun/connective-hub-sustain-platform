"""
Herkese Açık Şirket Profili (/p/{slug}).

Auth'lu yönetim endpoint'i (`/companies/me/public-profile`) + kamuya açık
görüntüleme endpoint'i (`/api/public/companies/{slug}`). Varsayılan olarak
kapalı (opt-in) — bir şirket slug belirleyip etkinleştirmeden hiçbir veri
dışarı sızmaz.

Tüm alanlar gerçek DB verisinden hesaplanır; sabit/kurgusal veri yok.
"""
import re
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from pydantic import BaseModel, Field

from ..database import get_db
from ..models import Company, EmissionRecord, Report
from ..services.rbac import require_role, get_active_company_id

router = APIRouter(prefix="/companies", tags=["companies"])
public_router = APIRouter(prefix="/api/public/companies", tags=["public-company-profile"])

SLUG_RE = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")


class PublicProfileSettings(BaseModel):
    slug: str = Field(min_length=3, max_length=80)
    enabled: bool


@router.patch("/me/public-profile")
async def update_public_profile(
    body: PublicProfileSettings,
    company_id: str = Depends(get_active_company_id),
    _admin=Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    """Şirketin herkese açık profil slug'ını ve etkinlik durumunu ayarlar (admin only)."""
    slug = body.slug.strip().lower()
    if len(slug) < 3:
        raise HTTPException(400, "Slug (baştaki/sondaki boşluklar hariç) en az 3 karakter olmalı.")
    if not SLUG_RE.match(slug):
        raise HTTPException(400, "Slug sadece küçük harf, rakam ve tire içerebilir (ör. 'koc-holding').")

    existing = await db.execute(select(Company).where(Company.slug == slug, Company.id != company_id))
    if existing.scalar_one_or_none():
        raise HTTPException(409, "Bu slug başka bir şirket tarafından kullanılıyor.")

    company = await db.get(Company, company_id)
    if not company:
        raise HTTPException(404, "Şirket bulunamadı")

    company.slug = slug
    company.public_profile_enabled = body.enabled
    await db.commit()

    return {"slug": company.slug, "public_profile_enabled": company.public_profile_enabled}


@public_router.get("/{slug}")
async def get_public_company_profile(slug: str, db: AsyncSession = Depends(get_db)):
    """Auth gerektirmez. Sadece public_profile_enabled=True olan şirketler için gerçek veri döner."""
    result = await db.execute(select(Company).where(Company.slug == slug.strip().lower()))
    company = result.scalar_one_or_none()
    if not company or not company.public_profile_enabled:
        raise HTTPException(404, "Bu profil bulunamadı veya herkese açık değil.")

    # En son yayınlanmış/onaylı rapordan uyum skoru + doğrulama bilgisi
    report_q = await db.execute(
        select(Report)
        .where(
            Report.company_id == company.id,
            Report.status.in_(["completed", "approved", "published"]),
        )
        .order_by(desc(Report.created_at))
        .limit(1)
    )
    latest_report = report_q.scalar_one_or_none()

    # En eski ve en yeni emisyon kaydından gerçek azaltım trendi
    emissions_q = await db.execute(
        select(EmissionRecord)
        .where(EmissionRecord.company_id == company.id)
        .order_by(EmissionRecord.year)
    )
    emissions = emissions_q.scalars().all()

    emissions_reduced_tco2e = None
    if len(emissions) >= 2:
        def _total(e: EmissionRecord) -> float:
            return float(e.scope1_co2e or 0) + float(e.scope2_location_co2e or 0) + float(e.scope3_co2e or 0)
        first_total, last_total = _total(emissions[0]), _total(emissions[-1])
        reduction = first_total - last_total
        # Sadece gerçek bir azaltım varsa göster — emisyonlar arttıysa "Karbon Azaltımı"
        # etiketiyle negatif bir sayı göstermek yanıltıcı olur; frontend bu durumda
        # dürüst boş-durumu ("Yeterli geçmiş veri yok") gösterir.
        if first_total > 0 and reduction > 0:
            emissions_reduced_tco2e = round(reduction, 1)

    latest_emission = emissions[-1] if emissions else None

    badges = []
    if latest_report and latest_report.standard == "tsrs" and latest_report.compliance_grade:
        badges.append("TSRS Uyumlu")
    if latest_emission is not None and latest_emission.renewable_ratio is not None and float(latest_emission.renewable_ratio) >= 1:
        badges.append("%100 Yenilenebilir Enerji (Kapsam 2)")

    return {
        "name": company.name,
        "sector": company.sector,
        "sustainScore": {
            "grade": latest_report.compliance_grade if latest_report else None,
            "score": latest_report.compliance_score if latest_report else None,
        },
        "emissionsReducedTco2e": emissions_reduced_tco2e,
        "netZeroTargetYear": company.net_zero_target_year,
        "verification": {
            "assuranceFirm": latest_report.assurance_firm if latest_report else None,
            "verified": bool(latest_report and latest_report.assurance_firm),
        },
        "badges": badges,
    }
