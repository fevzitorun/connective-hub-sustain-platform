"""
DPP servis katmanı — QR üretimi, JSON-LD serileştirme, GS1 Digital Link.

AB ESPR şeması nihai değil (2026 Q3–Q4 bekleniyor). Bu yüzden JSON-LD
payload'ında `data_json` alanı esnek bırakıldı; nihai şemaya eşleme
`to_espr_payload()` fonksiyonunda tek noktadan yapılabilir.
"""
from __future__ import annotations
from typing import Optional
from ..config import settings


def build_public_url(passport_id: str, base: Optional[str] = None) -> str:
    """QR kodun hedefi. Slug varsa çağrı yeri onu geçebilir."""
    base_url = base or getattr(settings, "public_url", None) or "https://sustaincomtr.vercel.app"
    return f"{base_url.rstrip('/')}/p/product/{passport_id}"


def build_gs1_digital_link(gtin: Optional[str], passport_id: str) -> Optional[str]:
    """
    GS1 Digital Link — GTIN varsa kanonik GS1 URL formatı.
    ref: https://ref.gs1.org/standards/digital-link/
    """
    if not gtin:
        return None
    gtin_norm = gtin.strip().replace("-", "").replace(" ", "")
    if not gtin_norm.isdigit() or len(gtin_norm) not in (8, 12, 13, 14):
        return None
    gtin_14 = gtin_norm.zfill(14)
    return f"https://id.gs1.org/01/{gtin_14}?linkType=gs1:pip&passport={passport_id}"


def generate_qr_svg(url: str, scale: int = 8) -> str:
    """
    QR kodu SVG string olarak döndürür. `segno` yoksa data URI fallback.

    Baskı için SVG tercih edilir (ölçeklenebilir, ince çizgi).
    """
    try:
        import segno  # pure python, no deps
        qr = segno.make(url, error="m")
        from io import BytesIO
        buf = BytesIO()
        qr.save(buf, kind="svg", scale=scale, dark="#0f172a", light="#ffffff")
        return buf.getvalue().decode("utf-8")
    except ImportError:
        return (
            f'<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">'
            f'<rect width="100%" height="100%" fill="#f1f5f9"/>'
            f'<text x="50%" y="50%" text-anchor="middle" '
            f'font-family="monospace" font-size="10">QR: {url[:32]}…</text>'
            f'</svg>'
        )


def to_jsonld(passport, product) -> dict:
    """
    Pasaportu JSON-LD (schema.org + DPP uzantıları) formatına dönüştürür.

    AB DPP data model kesinleşmediği için `dpp:*` özel namespace kullanıldı;
    nihai şema geldiğinde bu fonksiyon güncellenir, veritabanı değişmez.
    """
    return {
        "@context": [
            "https://schema.org",
            {
                "dpp": "https://sustaincomtr.vercel.app/dpp/ns#",
                "gs1": "https://gs1.org/voc/",
            },
        ],
        "@type": "Product",
        "@id": build_public_url(passport.id),
        "identifier": {
            "@type": "PropertyValue",
            "propertyID": "SKU",
            "value": product.sku,
        },
        "gs1:gtin": product.gtin,
        "name": product.name_tr,
        "alternateName": product.name_en,
        "category": product.category,
        "manufacturer": {
            "@type": "Organization",
            "@id": f"urn:company:{product.company_id}",
        },
        "countryOfOrigin": product.manufacturing_country,
        "dpp:version": passport.version,
        "dpp:status": passport.status,
        "dpp:issuedAt": passport.issued_at.isoformat() if passport.issued_at else None,
        "dpp:carbonFootprintKgCO2e": passport.carbon_footprint_kgco2e,
        "dpp:recycledContentPct": passport.recycled_content_pct,
        "dpp:repairabilityScore": passport.repairability_score,
        "dpp:materials": [
            {
                "name": m.material_name,
                "percentageByWeight": m.percentage_by_weight,
                "sourceCountry": m.source_country,
                "recycledContentPct": m.recycled_content_pct,
                "hazardous": m.is_hazardous,
            }
            for m in (passport.materials or [])
        ],
        "dpp:documents": [
            {
                "type": d.doc_type,
                "title": d.title,
                "url": d.file_url,
                "issuedBy": d.issued_by,
                "validUntil": d.valid_until.isoformat() if d.valid_until else None,
            }
            for d in (passport.documents or [])
        ],
    }


def make_public_snapshot(passport, product, lang: str = "tr") -> dict:
    """
    Kamuya açık görüntüleyici için sadeleştirilmiş payload (çok dilli).

    Kişisel/iç veri sızmaz: company_id, kullanıcı, email ve created_by yok.
    """
    from . import dpp_i18n

    display_name = dpp_i18n.product_name(product, lang)
    description = dpp_i18n.product_description(product, lang)

    return {
        "id": passport.id,
        "version": passport.version,
        "status": passport.status,
        "lang": dpp_i18n.normalize_lang(lang),
        "labels": dpp_i18n.labels(lang),
        "product": {
            "name": display_name,
            "name_tr": product.name_tr,
            "name_en": product.name_en,
            "description": description,
            "sku": product.sku,
            "gtin": product.gtin,
            "category": product.category,
            "subcategory": product.subcategory,
            "batch_number": product.batch_number,
            "manufactured_at": product.manufactured_at.isoformat() if product.manufactured_at else None,
            "country_of_origin": product.manufacturing_country,
            "manufacturing_site": product.manufacturing_site,
            "weight_kg": product.weight_kg,
            "dimensions": product.dimensions,
            "ce_marked": product.ce_marked,
            "energy_class": product.energy_class,
            "warranty_months": product.warranty_months,
        },
        "sustainability": {
            "carbon_footprint_kgco2e": passport.carbon_footprint_kgco2e,
            "recycled_content_pct": passport.recycled_content_pct,
            "repairability_score": passport.repairability_score,
            "green_score": passport.green_score,
            "green_score_grade": (passport.green_score_breakdown or {}).get("grade"),
            "green_score_breakdown": passport.green_score_breakdown,
        },
        "recycling_instructions": passport.recycling_instructions,
        "materials": [
            {
                "name": m.material_name,
                "pct": m.percentage_by_weight,
                "source": m.source_country,
                "recycled_pct": m.recycled_content_pct,
                "hazardous": m.is_hazardous,
            }
            for m in (passport.materials or [])
        ],
        "suppliers": [
            {
                "tier": s.tier,
                "name": s.name,
                "country": s.country,
                "role": s.role,
                "certifications": s.certifications or [],
            }
            for s in (passport.suppliers or [])
        ],
        "documents": [
            {
                "type": d.doc_type,
                "title": d.title,
                "url": d.file_url,
                "issued_by": d.issued_by,
                "valid_until": d.valid_until.isoformat() if d.valid_until else None,
            }
            for d in (passport.documents or [])
        ],
        "metrics": {
            "scan_count": passport.scan_count,
            "ai_query_count": passport.ai_query_count,
            "return_request_count": passport.return_request_count,
        },
        "issued_at": passport.issued_at.isoformat() if passport.issued_at else None,
        "gs1_digital_link": passport.gs1_digital_link,
    }
