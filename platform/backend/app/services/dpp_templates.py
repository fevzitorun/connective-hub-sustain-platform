"""
DPP sektör şablonları — AB ESPR Delegated Act taslaklarına göre.

Her sektör için:
- required: yayın için mutlaka dolu olması gereken alanlar
- recommended: dolu değilse skor cezalanır ama yayın engellenmez
- required_documents: en az bir tanesi yüklü olmalı
- green_weights: Yeşil Skor'daki kalem ağırlıkları (toplam 100)

V1'de 3 sektör tam kapsanır: textile, battery, electronics. Diğerleri
"generic" şablona düşer. AB nihai şeması geldikçe güncellenir.
"""
from typing import Optional


GENERIC_TEMPLATE = {
    "required_fields": {
        "product.name_tr", "product.category",
        "product.manufacturing_country", "product.manufactured_at",
        "passport.carbon_footprint_kgco2e",
    },
    "recommended_fields": {
        "product.gtin", "product.name_en", "product.weight_kg",
        "product.batch_number", "product.warranty_months",
        "passport.recycled_content_pct", "passport.repairability_score",
        "passport.recycling_instructions",
    },
    "required_documents": set(),  # sektör-özel şablonda doldurulur
    "min_materials": 1,
    "min_suppliers_tier1": 0,
    "green_weights": {
        "material": 30, "carbon": 25, "hazard": 20,
        "documents": 15, "repairability": 10,
    },
}


SECTOR_TEMPLATES = {
    "textile": {
        "required_fields": {
            "product.name_tr", "product.category", "product.subcategory",
            "product.manufacturing_country", "product.manufactured_at",
            "product.weight_kg",
            "passport.carbon_footprint_kgco2e",
            "passport.recycling_instructions",
        },
        "recommended_fields": {
            "product.name_en", "product.gtin", "product.batch_number",
            "passport.repairability_score",
        },
        "required_documents": {"oekotex"},   # veya gots
        "alt_documents": {"gots", "epd"},
        "min_materials": 2,                   # fiber breakdown
        "min_suppliers_tier1": 1,             # en az kumaş/iplik tedarikçisi
        "green_weights": {                    # tekstilde malzeme + tehlike ağır
            "material": 35, "carbon": 20, "hazard": 25,
            "documents": 15, "repairability": 5,
        },
    },
    "battery": {
        "required_fields": {
            "product.name_tr", "product.category", "product.subcategory",
            "product.manufacturing_country", "product.manufactured_at",
            "product.weight_kg",
            "passport.carbon_footprint_kgco2e",
            "passport.recycling_instructions",
        },
        "recommended_fields": {
            "product.serial_number", "product.warranty_months",
            "product.energy_class",
        },
        "required_documents": {"ce", "energy_label"},
        "alt_documents": {"epd", "iso14067_pcf"},
        "min_materials": 3,                    # katot + anot + elektrolit
        "min_suppliers_tier1": 2,
        "green_weights": {                     # bataryada karbon + tehlike kritik
            "material": 20, "carbon": 35, "hazard": 25,
            "documents": 15, "repairability": 5,
        },
    },
    "electronics": {
        "required_fields": {
            "product.name_tr", "product.category",
            "product.manufacturing_country", "product.manufactured_at",
            "product.energy_class",
            "product.warranty_months",
            "passport.carbon_footprint_kgco2e",
            "passport.repairability_score",
            "passport.recycling_instructions",
        },
        "recommended_fields": {
            "product.serial_number", "product.gtin",
            "product.dimensions",
        },
        "required_documents": {"ce", "rohs"},
        "alt_documents": {"energy_label", "reach"},
        "min_materials": 2,
        "min_suppliers_tier1": 1,
        "green_weights": {                     # elektronikte onarılabilirlik + belge
            "material": 20, "carbon": 25, "hazard": 20,
            "documents": 15, "repairability": 20,
        },
    },
    "furniture": {
        "required_fields": {
            "product.name_tr", "product.category",
            "product.manufacturing_country", "product.manufactured_at",
            "product.weight_kg",
            "passport.carbon_footprint_kgco2e",
        },
        "recommended_fields": {
            "product.dimensions", "product.warranty_months",
            "passport.repairability_score", "passport.recycling_instructions",
        },
        "required_documents": set(),
        "alt_documents": {"epd", "ce"},
        "min_materials": 1,
        "min_suppliers_tier1": 0,
        "green_weights": {
            "material": 35, "carbon": 20, "hazard": 15,
            "documents": 15, "repairability": 15,
        },
    },
}


def get_template(category: str) -> dict:
    """Sektör şablonunu döndür; yoksa generic'e düş."""
    return SECTOR_TEMPLATES.get(category, GENERIC_TEMPLATE)


def _read_dotted(obj, path: str):
    """"product.name_tr" gibi noktalı yolu obj üzerinde çöz."""
    parts = path.split(".")
    cursor = obj
    for p in parts[1:]:  # ilk parça namespace (product/passport)
        cursor = getattr(cursor, p, None)
        if cursor is None:
            return None
    return cursor


def validate_passport(passport, product) -> dict:
    """
    Şablona göre tamamlanma raporu.

    Returns:
        {
            "completeness_pct": 0-100,
            "template_category": "textile" | "generic",
            "required_ok": bool,
            "missing_required": [ … ],
            "missing_recommended": [ … ],
            "documents_ok": bool,
            "materials_ok": bool,
            "suppliers_ok": bool,
            "ready_to_issue": bool,
            "recommendations": [ str, str … ],
        }
    """
    template = get_template(product.category)
    template_key = product.category if product.category in SECTOR_TEMPLATES else "generic"

    namespace_map = {"product": product, "passport": passport}

    def _get(path: str):
        ns = path.split(".", 1)[0]
        obj = namespace_map.get(ns)
        return _read_dotted(obj, path) if obj else None

    missing_required = [p for p in template["required_fields"] if not _get(p)]
    missing_recommended = [p for p in template["recommended_fields"] if not _get(p)]

    doc_types = {d.doc_type for d in (passport.documents or [])}
    required_docs = template["required_documents"] or set()
    alt_docs = template.get("alt_documents", set())
    documents_ok = (
        required_docs.issubset(doc_types)
        or bool(required_docs & doc_types) and bool(alt_docs & doc_types)
        or (not required_docs)
    )

    materials_ok = len(passport.materials or []) >= template["min_materials"]
    suppliers_ok = len(passport.suppliers or []) >= template["min_suppliers_tier1"]

    # Basit skor: required-eksiği ağır, recommended hafif, belge/malzeme/tedarikçi orta
    required_total = len(template["required_fields"]) or 1
    recommended_total = len(template["recommended_fields"]) or 1
    required_score = (1 - len(missing_required) / required_total) * 60
    recommended_score = (1 - len(missing_recommended) / recommended_total) * 20
    docs_score = 10 if documents_ok else 0
    mats_score = 5 if materials_ok else 0
    supp_score = 5 if suppliers_ok else 0
    completeness = round(required_score + recommended_score + docs_score + mats_score + supp_score, 1)

    recs = []
    if missing_required:
        recs.append(f"Zorunlu {len(missing_required)} alan eksik: {', '.join(sorted(missing_required)[:3])}…")
    if not documents_ok and required_docs:
        recs.append(f"Şu belgelerden en az biri gerekli: {', '.join(sorted(required_docs))}")
    if not materials_ok:
        recs.append(f"En az {template['min_materials']} malzeme kaydı olmalı")
    if not suppliers_ok and template["min_suppliers_tier1"] > 0:
        recs.append(f"En az {template['min_suppliers_tier1']} Tier 1 tedarikçi olmalı")

    return {
        "completeness_pct": completeness,
        "template_category": template_key,
        "required_ok": not missing_required,
        "missing_required": sorted(missing_required),
        "missing_recommended": sorted(missing_recommended),
        "documents_ok": documents_ok,
        "materials_ok": materials_ok,
        "suppliers_ok": suppliers_ok,
        "ready_to_issue": (
            not missing_required and documents_ok and materials_ok and suppliers_ok
        ),
        "recommendations": recs,
    }
