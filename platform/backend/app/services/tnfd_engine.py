"""
TNFD (Taskforce on Nature-related Financial Disclosures) v1.0 Engine
LEAP Approach: Locate → Evaluate → Assess → Prepare
14 Recommended Disclosures in 4 pillars (Governance/Strategy/Risk&Impact/Metrics)
"""
from typing import Any

# ── LEAP Phases ────────────────────────────────────────────────────────────────
LEAP_PHASES = [
    {
        "id": "L", "title": "Locate", "tr": "Konumlandır",
        "icon": "📍", "color": "#10b981",
        "description": "Doğayla arayüz oluşturan lokasyonları ve değer zincirini belirle",
        "steps": [
            "İş faaliyetlerinin bulunduğu coğrafi lokasyonları haritala",
            "Biyoçeşitlilik hassasiyeti yüksek alanları (KBA, WDPA) tespit et",
            "Değer zincirinin doğayla arayüzlerini belirle",
            "Su havzası stresi analizini gerçekleştir",
        ],
        "tools": ["IBAT (Integrated Biodiversity Assessment Tool)", "WRI Aqueduct Water Risk Atlas", "ENCORE – Exploring Natural Capital Opportunities"],
    },
    {
        "id": "E", "title": "Evaluate", "tr": "Değerlendir",
        "icon": "🔬", "color": "#3b82f6",
        "description": "Doğa bağımlılıklarını ve etkilerini değerlendir",
        "steps": [
            "Doğa sermayesine olan bağımlılıkları analiz et (su, toprak, biyokütle)",
            "Biyoçeşitlilik üzerindeki olumsuz etkileri ölçümle",
            "Ekosistemlere olan etkileri değer zinciri boyunca değerlendir",
            "Kilit ekosistem hizmetleri ve varlıklarını belirle",
        ],
        "tools": ["ENCORE doğal sermaye analizi", "GBS (Global Biodiversity Score)", "SBTN doğal sermaye değerleme metodolojisi"],
    },
    {
        "id": "A", "title": "Assess", "tr": "Değerlendir & Risk",
        "icon": "⚠️", "color": "#f59e0b",
        "description": "Doğayla ilgili risk ve fırsatları değerlendir",
        "steps": [
            "Fiziksel riskleri değerlendir (ekosistem hizmetlerinin kaybı)",
            "Geçiş risklerini değerlendir (politika, pazar, teknoloji)",
            "Sistemik riskleri belirle (finansal istikrara etki)",
            "Doğa pozitif fırsatları tanımla",
        ],
        "tools": ["TCFD senaryo analizi (doğa boyutu)", "NbS (Nature-based Solutions) fırsat analizi"],
    },
    {
        "id": "P", "title": "Prepare", "tr": "Hazırlan",
        "icon": "📋", "color": "#8b5cf6",
        "description": "Strateji ve hedefleri hazırla, ifşa et",
        "steps": [
            "Doğa pozitif stratejisi ve taahhütleri belirle",
            "TNFD tavsiye edilen ifşaatları hazırla (4 sütun, 14 ifşaat)",
            "SBTN Science-Based Targets hedefleri belirle",
            "Raporlama entegrasyonu: GRI 304, CSRD/ESRS E4, CBD",
        ],
        "tools": ["TNFD FIND portal (finddisclosures.tnfd.global)", "SBTN Step 1-5 yaklaşımı"],
    },
]

# ── 14 Recommended Disclosures ─────────────────────────────────────────────────
TNFD_DISCLOSURES = [
    # Governance
    {"id": "G-A", "pillar": "Yönetişim", "pillar_icon": "🏛️", "pillar_color": "#10b981",
     "title": "Yönetim kurulunun doğayla ilgili risklere gözetimi",
     "description": "Yönetim kurulunun doğayla ilgili riskleri ve fırsatları gözetme prosedürleri",
     "esrs": "ESRS E4-1", "gri": "GRI 2-9"},
    {"id": "G-B", "pillar": "Yönetişim", "pillar_icon": "🏛️", "pillar_color": "#10b981",
     "title": "Yönetimin doğayla ilgili risklere rolü",
     "description": "Yönetimin doğayla ilgili risk ve fırsatları değerlendirme ve yönetme süreçleri",
     "esrs": "ESRS E4-1", "gri": "GRI 2-14"},
    # Strategy
    {"id": "S-A", "pillar": "Strateji", "pillar_icon": "🎯", "pillar_color": "#3b82f6",
     "title": "Tespit edilen kısa, orta ve uzun vadeli doğayla ilgili riskler ve fırsatlar",
     "description": "Organizasyonun kısa, orta ve uzun vadede karşılaşacağı doğayla ilgili riskler",
     "esrs": "ESRS E4-2", "gri": "GRI 304-2"},
    {"id": "S-B", "pillar": "Strateji", "pillar_icon": "🎯", "pillar_color": "#3b82f6",
     "title": "Doğayla ilgili risklerin işletme, strateji ve finansal planlamaya etkisi",
     "description": "Doğa riskleri ve fırsatlarının iş modeline, stratejiye ve finansal planlamaya nasıl etki ettiği",
     "esrs": "ESRS E4-2", "gri": None},
    {"id": "S-C", "pillar": "Strateji", "pillar_icon": "🎯", "pillar_color": "#3b82f6",
     "title": "Strateji ve iş modelinin doğayla ilgili riskler karşısındaki esnekliği",
     "description": "Farklı doğa senaryoları altında stratejinin dayanıklılığı",
     "esrs": "ESRS E4-3", "gri": None},
    {"id": "S-D", "pillar": "Strateji", "pillar_icon": "🎯", "pillar_color": "#3b82f6",
     "title": "Geçiş planı ve doğa pozitif ekonomiye geçiş",
     "description": "Doğa kaybını durdurmak ve tersine çevirmek için kuruluşun planı",
     "esrs": "ESRS E4-3", "gri": "GRI 304-3"},
    # Risk & Impact Management
    {"id": "R-A", "pillar": "Risk & Etki Yönetimi", "pillar_icon": "⚠️", "pillar_color": "#f59e0b",
     "title": "Doğayla ilgili risklerin ve etkilerin tespiti için kullanılan süreçler",
     "description": "LEAP yaklaşımı da dahil olmak üzere doğa risklerinin tespiti ve önceliklendirilmesi",
     "esrs": "ESRS E4-1", "gri": "GRI 304-1"},
    {"id": "R-B", "pillar": "Risk & Etki Yönetimi", "pillar_icon": "⚠️", "pillar_color": "#f59e0b",
     "title": "Doğayla ilgili risklerin ve etkilerin değerlendirilmesi için kullanılan süreçler",
     "description": "Doğa risklerinin önemsellik, olasılık ve büyüklük açısından değerlendirilmesi",
     "esrs": "ESRS E4-1", "gri": None},
    {"id": "R-C", "pillar": "Risk & Etki Yönetimi", "pillar_icon": "⚠️", "pillar_color": "#f59e0b",
     "title": "Doğayla ilgili risklerin ve etkilerin yönetimi için kullanılan süreçler",
     "description": "Azaltma, uyum ve transfer dahil yönetim stratejileri",
     "esrs": "ESRS E4-1", "gri": "GRI 304-3"},
    {"id": "R-D", "pillar": "Risk & Etki Yönetimi", "pillar_icon": "⚠️", "pillar_color": "#f59e0b",
     "title": "Doğayla ilgili risklerin genel risk yönetimiyle entegrasyonu",
     "description": "Doğa risklerinin ERM çerçevesine nasıl dahil edildiği",
     "esrs": None, "gri": None},
    # Metrics & Targets
    {"id": "M-A", "pillar": "Metrik & Hedefler", "pillar_icon": "📊", "pillar_color": "#8b5cf6",
     "title": "Organizasyonun doğaya olan bağımlılıklarını ve etkilerini değerlendirmek için kullanılan metrikler",
     "description": "Su tüketimi, arazi kullanımı, biyoçeşitlilik kaybı gibi temel metrikler",
     "esrs": "ESRS E3-4, E4-6", "gri": "GRI 303-5, 304-4"},
    {"id": "M-B", "pillar": "Metrik & Hedefler", "pillar_icon": "📊", "pillar_color": "#8b5cf6",
     "title": "Doğayla ilgili riskler ve fırsatlar için kullanılan metrikler",
     "description": "Risk maruziyetini ölçen ve izleyen finansal ve operasyonel metrikler",
     "esrs": "ESRS E4-5", "gri": None},
    {"id": "M-C", "pillar": "Metrik & Hedefler", "pillar_icon": "📊", "pillar_color": "#8b5cf6",
     "title": "Doğayla ilgili etkileri, bağımlılıkları, riskleri ve fırsatları yönetmek için kullanılan hedefler",
     "description": "Ölçülebilir doğa pozitif hedefler ve SBTN bilimsel temelli hedefler",
     "esrs": "ESRS E4-4", "gri": "GRI 304-2"},
    {"id": "M-D", "pillar": "Metrik & Hedefler", "pillar_icon": "📊", "pillar_color": "#8b5cf6",
     "title": "Hedeflere karşı performans",
     "description": "Doğa pozitif hedeflere ilerleme ve sapma analizi",
     "esrs": "ESRS E4-4", "gri": "GRI 304-4"},
]

# ── Nature Risk Categories ─────────────────────────────────────────────────────
NATURE_RISK_CATEGORIES = [
    {"id": "land_use",    "title": "Arazi Kullanımı Değişikliği", "icon": "🌾", "driver": "LUC",
     "description": "Tarım, kentleşme, madencilik kaynaklı habitat kaybı"},
    {"id": "freshwater",  "title": "Tatlı Su Kullanımı", "icon": "💧", "driver": "FWU",
     "description": "Su çekimi ve tüketimi, sulak alan tahribi"},
    {"id": "climate",     "title": "İklim Değişikliği", "icon": "🌡️", "driver": "CC",
     "description": "Tür dağılımı ve ekosistem işlevi üzerindeki etkiler"},
    {"id": "pollution",   "title": "Kirlilik", "icon": "☠️", "driver": "POL",
     "description": "Kimyasal kirlilik, plastik, ışık ve gürültü kirliliği"},
    {"id": "invasive",    "title": "İstilacı Türler", "icon": "🦠", "driver": "IAS",
     "description": "Ticaret ve ulaşımla yayılan istilacı türler"},
    {"id": "overexploit", "title": "Doğal Kaynakların Aşırı Kullanımı", "icon": "🪵", "driver": "OE",
     "description": "Balıkçılık, ormancılık, madencilikte sürdürülemez çıkarım"},
]

# ── Sector nature dependency scores ───────────────────────────────────────────
SECTOR_NATURE_DEPS: dict[str, dict] = {
    "tekstil":      {"land_use": 75, "freshwater": 85, "climate": 55, "pollution": 80, "invasive": 20, "overexploit": 40},
    "gıda":         {"land_use": 90, "freshwater": 88, "climate": 70, "pollution": 60, "invasive": 45, "overexploit": 75},
    "inşaat":       {"land_use": 85, "freshwater": 60, "climate": 40, "pollution": 70, "invasive": 30, "overexploit": 65},
    "enerji":       {"land_use": 65, "freshwater": 55, "climate": 90, "pollution": 75, "invasive": 15, "overexploit": 50},
    "kimya":        {"land_use": 45, "freshwater": 70, "climate": 60, "pollution": 90, "invasive": 10, "overexploit": 35},
    "finans":       {"land_use": 20, "freshwater": 15, "climate": 30, "pollution": 10, "invasive": 5,  "overexploit": 25},
    "perakende":    {"land_use": 55, "freshwater": 40, "climate": 35, "pollution": 45, "invasive": 20, "overexploit": 50},
    "ulaşım":       {"land_use": 60, "freshwater": 30, "climate": 75, "pollution": 80, "invasive": 35, "overexploit": 20},
    "manufacturing":{"land_use": 60, "freshwater": 65, "climate": 55, "pollution": 70, "invasive": 15, "overexploit": 45},
}


def assess_tnfd(
    sector: str = "tekstil",
    completed_disclosures: list[str] | None = None,
    leap_progress: dict[str, int] | None = None,
) -> dict[str, Any]:
    """
    Assess TNFD readiness and nature risk profile.
    completed_disclosures: list of disclosure IDs (e.g. ['G-A', 'G-B', ...])
    leap_progress: {'L': 75, 'E': 40, 'A': 20, 'P': 10} (%)
    """
    completed = set(completed_disclosures or [])
    leap = leap_progress or {"L": 60, "E": 35, "A": 20, "P": 10}

    # Disclosure completeness
    total_d = len(TNFD_DISCLOSURES)
    comp_d = sum(1 for d in TNFD_DISCLOSURES if d["id"] in completed)
    disclosure_pct = round(comp_d / total_d * 100)

    # Overall TNFD readiness
    leap_avg = round(sum(leap.values()) / len(leap))
    overall_readiness = round((disclosure_pct * 0.6 + leap_avg * 0.4))

    # Nature dependency profile
    nature_deps = SECTOR_NATURE_DEPS.get(sector, SECTOR_NATURE_DEPS["manufacturing"])
    top_risks = sorted(nature_deps.items(), key=lambda x: x[1], reverse=True)[:3]
    risk_cats = {r["id"]: r for r in NATURE_RISK_CATEGORIES}

    return {
        "sector": sector,
        "overall_readiness_pct": overall_readiness,
        "disclosure_pct": disclosure_pct,
        "completed_disclosures": comp_d,
        "total_disclosures": total_d,
        "leap_progress": leap,
        "leap_avg": leap_avg,
        "nature_dependencies": [
            {"id": k, "title": risk_cats[k]["title"], "icon": risk_cats[k]["icon"],
             "driver": risk_cats[k]["driver"], "score": v,
             "level": "Yüksek" if v >= 70 else "Orta" if v >= 40 else "Düşük",
             "color": "#ef4444" if v >= 70 else "#f59e0b" if v >= 40 else "#10b981"}
            for k, v in nature_deps.items()
        ],
        "top_nature_risks": [
            {"id": k, **risk_cats[k], "score": v}
            for k, v in top_risks
        ],
        "leap_phases": [
            {**p, "progress": leap.get(p["id"], 0)}
            for p in LEAP_PHASES
        ],
        "disclosures": [
            {**d, "completed": d["id"] in completed}
            for d in TNFD_DISCLOSURES
        ],
        "recommendations": _tnfd_recommendations(sector, overall_readiness, leap, completed),
        "sbtn_note": "SBTN Step 1: Önceliklendirme → Step 2: Ölçme → Step 3: Hedef belirleme → Step 4: Eylem → Step 5: İzleme",
    }


def _tnfd_recommendations(sector: str, readiness: int, leap: dict, completed: set) -> list[str]:
    recs = []
    if leap.get("L", 0) < 50:
        recs.append("IBAT ve WRI Aqueduct araçlarıyla coğrafi risk haritalaması gerçekleştirin (LEAP-L)")
    if leap.get("E", 0) < 40:
        recs.append("ENCORE metodolojisiyle doğal sermaye bağımlılıklarını değerlendirin (LEAP-E)")
    if "G-A" not in completed:
        recs.append("Yönetim kurulunda doğa riski gözetim politikasını resmileştirin (TNFD G-A)")
    if "M-C" not in completed:
        recs.append("SBTN bilimsel temelli doğa hedefleri belirleyin (TNFD M-C)")
    if sector in ("tekstil", "gıda", "inşaat") and "S-D" not in completed:
        recs.append("Sektörünüzün yüksek doğa etkisi nedeniyle geçiş planı (TNFD S-D) kritik öneme sahip")
    if readiness < 30:
        recs.append("TNFD beta pilot programına katılarak sektörel rehberden yararlanın (tnfd.global)")
    return recs[:5]


DEMO_RESULT = assess_tnfd(
    sector="tekstil",
    completed_disclosures=["G-A", "G-B", "S-A", "R-A", "M-A"],
    leap_progress={"L": 65, "E": 40, "A": 25, "P": 15},
)
