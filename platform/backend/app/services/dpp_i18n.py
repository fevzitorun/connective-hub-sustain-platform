"""
DPP çok dilli etiket sözlüğü — kamu görüntüleyici için.

Alanların (green_score, materials, carbon_footprint …) etiketlerini 4 dilde
sağlar. Ürün adı zaten Product.name_{tr,en,de,fr} kolonlarında; bu sözlük
UI etiketleri için.

Ekleme: yeni bir dil `_TRANSLATIONS`'e eklenir, `SUPPORTED_LANGS`
güncellenir.
"""
from __future__ import annotations
from typing import Literal

SupportedLang = Literal["tr", "en", "de", "fr"]
SUPPORTED_LANGS = ("tr", "en", "de", "fr")
DEFAULT_LANG = "tr"


_TRANSLATIONS = {
    "product_passport": {
        "tr": "Dijital Ürün Pasaportu",
        "en": "Digital Product Passport",
        "de": "Digitaler Produktpass",
        "fr": "Passeport Numérique du Produit",
    },
    "green_score": {
        "tr": "Yeşil Skor", "en": "Green Score",
        "de": "Grüne Bewertung", "fr": "Score Vert",
    },
    "carbon_footprint": {
        "tr": "Karbon Ayak İzi", "en": "Carbon Footprint",
        "de": "CO₂-Fußabdruck", "fr": "Empreinte Carbone",
    },
    "recycled_content": {
        "tr": "Geri Dönüştürülmüş İçerik", "en": "Recycled Content",
        "de": "Recycelter Anteil", "fr": "Contenu Recyclé",
    },
    "materials": {
        "tr": "Malzeme Bileşimi", "en": "Material Composition",
        "de": "Materialzusammensetzung", "fr": "Composition Matérielle",
    },
    "manufacturer": {
        "tr": "Üretici", "en": "Manufacturer",
        "de": "Hersteller", "fr": "Fabricant",
    },
    "origin_country": {
        "tr": "Menşei Ülke", "en": "Country of Origin",
        "de": "Herkunftsland", "fr": "Pays d'Origine",
    },
    "manufactured_at": {
        "tr": "Üretim Tarihi", "en": "Manufacturing Date",
        "de": "Herstellungsdatum", "fr": "Date de Fabrication",
    },
    "warranty": {
        "tr": "Garanti", "en": "Warranty",
        "de": "Garantie", "fr": "Garantie",
    },
    "repairability": {
        "tr": "Onarılabilirlik", "en": "Repairability",
        "de": "Reparierbarkeit", "fr": "Réparabilité",
    },
    "recycling_instructions": {
        "tr": "Geri Dönüşüm Talimatları", "en": "Recycling Instructions",
        "de": "Recycling-Anweisungen", "fr": "Instructions de Recyclage",
    },
    "compliance_documents": {
        "tr": "Uygunluk Belgeleri", "en": "Compliance Documents",
        "de": "Konformitätsdokumente", "fr": "Documents de Conformité",
    },
    "issued_on": {
        "tr": "Yayın Tarihi", "en": "Issued On",
        "de": "Ausgestellt am", "fr": "Émis le",
    },
    "revoked": {
        "tr": "Geri Çekildi", "en": "Revoked",
        "de": "Widerrufen", "fr": "Révoqué",
    },
    "return_button": {
        "tr": "İade & Geri Dönüşüm", "en": "Return & Recycle",
        "de": "Rückgabe & Recycling", "fr": "Retour & Recyclage",
    },
    "ask_assistant": {
        "tr": "Sürdürülebilirlik Asistanına Sor",
        "en": "Ask Sustainability Assistant",
        "de": "Nachhaltigkeitsassistent fragen",
        "fr": "Demander à l'Assistant Durabilité",
    },
    "no_data": {
        "tr": "Veri yok", "en": "No data",
        "de": "Keine Daten", "fr": "Aucune donnée",
    },
}


def normalize_lang(lang: str | None) -> str:
    """Girilen dilin desteklenip desteklenmediğini kontrol et, yoksa TR."""
    if not lang:
        return DEFAULT_LANG
    l = lang.strip().lower()[:2]
    return l if l in SUPPORTED_LANGS else DEFAULT_LANG


def labels(lang: str) -> dict:
    """Tüm UI etiketlerini seçili dilde döndür."""
    lang = normalize_lang(lang)
    return {k: v.get(lang, v["tr"]) for k, v in _TRANSLATIONS.items()}


def product_name(product, lang: str) -> str:
    """Ürünün seçili dildeki adı; yoksa TR'ye düş."""
    lang = normalize_lang(lang)
    getter = {
        "tr": lambda p: p.name_tr,
        "en": lambda p: getattr(p, "name_en", None) or p.name_tr,
        "de": lambda p: getattr(p, "name_de", None) or getattr(p, "name_en", None) or p.name_tr,
        "fr": lambda p: getattr(p, "name_fr", None) or getattr(p, "name_en", None) or p.name_tr,
    }
    return getter[lang](product)


def product_description(product, lang: str) -> str | None:
    """Ürün açıklaması TR/EN destekli; DE/FR yoksa EN'e düşer."""
    lang = normalize_lang(lang)
    if lang == "tr":
        return getattr(product, "description_tr", None)
    return getattr(product, "description_en", None) or getattr(product, "description_tr", None)
