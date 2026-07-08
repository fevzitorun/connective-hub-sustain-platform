"""
CSRD Double Materiality Servisi — ESRS standartları.
Etki Önemliliği (Impact) + Finansal Önemlilik (Financial) iki boyutlu analiz.
"""
from dataclasses import dataclass, field

# ESRS konuları (E1-E5, S1-S4, G1)
ESRS_TOPICS = [
    {"id": "E1", "name": "İklim Değişikliği",            "category": "Çevre",  "desc": "Kapsam 1/2/3 emisyonları, enerji geçişi"},
    {"id": "E2", "name": "Hava Kirliliği",               "category": "Çevre",  "desc": "NOx, SOx, partiküller, zararlı maddeler"},
    {"id": "E3", "name": "Su & Deniz Kaynakları",        "category": "Çevre",  "desc": "Su tüketimi, su kalitesi, deniz ekosistemleri"},
    {"id": "E4", "name": "Biyoçeşitlilik & Ekosistem",  "category": "Çevre",  "desc": "Arazi kullanımı, tür kaybı, TNFD"},
    {"id": "E5", "name": "Kaynak Kullanımı & Döngüsel", "category": "Çevre",  "desc": "Atık, malzeme verimliliği, döngüsel ekonomi"},
    {"id": "S1", "name": "Kendi İşgücü",                 "category": "Sosyal", "desc": "Çalışan hakları, ücretler, güvenlik"},
    {"id": "S2", "name": "Değer Zinciri İşçileri",      "category": "Sosyal", "desc": "Tedarik zinciri insan hakları"},
    {"id": "S3", "name": "Etkilenen Topluluklar",        "category": "Sosyal", "desc": "Yerel topluluklar, yerli halklar"},
    {"id": "S4", "name": "Tüketiciler & Müşteriler",    "category": "Sosyal", "desc": "Ürün güvenliği, gizlilik, veri koruma"},
    {"id": "G1", "name": "İş Yönetimi",                  "category": "Yönetim","desc": "Yolsuzlukla mücadele, lobi, vergi şeffaflığı"},
]

# Sektöre göre ön-doldurulmuş önemlilik değerleri (1-5 ölçeği)
_SECTOR_DEFAULTS: dict[str, dict[str, tuple[float, float]]] = {
    "bankacılık": {
        "E1": (3.5, 4.2), "E2": (1.5, 2.0), "E3": (1.8, 2.5), "E4": (2.0, 3.0),
        "E5": (2.2, 2.8), "S1": (3.0, 3.2), "S2": (3.8, 4.5), "S3": (2.5, 3.0),
        "S4": (4.0, 4.8), "G1": (4.5, 4.9),
    },
    "imalat": {
        "E1": (4.5, 4.0), "E2": (4.2, 3.8), "E3": (3.8, 3.5), "E4": (3.2, 3.0),
        "E5": (4.0, 3.6), "S1": (4.2, 3.8), "S2": (3.5, 3.2), "S3": (3.0, 2.8),
        "S4": (2.8, 3.0), "G1": (3.5, 3.8),
    },
    "çimento": {
        "E1": (5.0, 4.5), "E2": (4.8, 4.2), "E3": (4.5, 3.8), "E4": (4.0, 3.5),
        "E5": (4.2, 3.8), "S1": (4.0, 3.5), "S2": (3.2, 2.8), "S3": (3.8, 3.2),
        "S4": (2.5, 2.8), "G1": (3.2, 3.5),
    },
    "enerji": {
        "E1": (5.0, 5.0), "E2": (4.5, 4.2), "E3": (4.0, 3.8), "E4": (4.5, 4.0),
        "E5": (3.8, 3.5), "S1": (4.2, 3.8), "S2": (3.5, 3.2), "S3": (4.5, 4.0),
        "S4": (3.0, 3.2), "G1": (4.0, 4.2),
    },
    "default": {
        "E1": (3.5, 3.5), "E2": (2.5, 2.5), "E3": (3.0, 3.0), "E4": (2.5, 2.5),
        "E5": (3.0, 3.0), "S1": (3.5, 3.5), "S2": (3.0, 3.0), "S3": (2.5, 2.5),
        "S4": (3.0, 3.0), "G1": (3.5, 3.5),
    },
}

MATERIALITY_THRESHOLD = 3.0   # Bu değerin üzeri önemli kabul edilir


@dataclass
class MaterialityItem:
    topic_id: str
    topic_name: str
    category: str
    impact_score: float     # 1-5: şirketin toplum/çevre üzerindeki etkisi
    financial_score: float  # 1-5: konunun şirketi finansal olarak etkilemesi
    is_material: bool
    priority: str           # Düşük / Orta / Yüksek / Kritik


@dataclass
class MaterialityMatrix:
    company_id: str
    sector: str
    items: list[MaterialityItem] = field(default_factory=list)
    material_topics: list[str] = field(default_factory=list)
    top_priorities: list[str] = field(default_factory=list)


def assess_materiality(
    company_id: str,
    sector: str,
    custom_scores: dict | None = None,
) -> MaterialityMatrix:
    """
    Çift Önemlilik Matrisi üret.
    custom_scores: {"E1": {"impact": 4.0, "financial": 3.5}, ...}
    """
    sector_key = sector.lower()
    defaults = _SECTOR_DEFAULTS.get(sector_key, _SECTOR_DEFAULTS["default"])

    items: list[MaterialityItem] = []
    for topic in ESRS_TOPICS:
        tid = topic["id"]
        if custom_scores and tid in custom_scores:
            impact = float(custom_scores[tid].get("impact", defaults[tid][0]))
            financial = float(custom_scores[tid].get("financial", defaults[tid][1]))
        else:
            impact, financial = defaults.get(tid, (3.0, 3.0))

        is_material = impact >= MATERIALITY_THRESHOLD or financial >= MATERIALITY_THRESHOLD
        combined = (impact + financial) / 2
        if combined >= 4.5:
            priority = "Kritik"
        elif combined >= 3.5:
            priority = "Yüksek"
        elif combined >= MATERIALITY_THRESHOLD:
            priority = "Orta"
        else:
            priority = "Düşük"

        items.append(MaterialityItem(
            topic_id=tid,
            topic_name=topic["name"],
            category=topic["category"],
            impact_score=round(impact, 1),
            financial_score=round(financial, 1),
            is_material=is_material,
            priority=priority,
        ))

    material_topics = [i.topic_id for i in items if i.is_material]
    top_priorities = [i.topic_id for i in sorted(items, key=lambda x: -(x.impact_score + x.financial_score))[:3]]

    return MaterialityMatrix(
        company_id=company_id,
        sector=sector,
        items=items,
        material_topics=material_topics,
        top_priorities=top_priorities,
    )


def get_esrs_topics() -> list[dict]:
    return ESRS_TOPICS
