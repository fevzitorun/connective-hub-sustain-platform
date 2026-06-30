"""
TSRS 1 — Sürdürülebilirlikle İlgili Finansal Açıklamalar (KGK, 2023)
TSRS 2 — İklimle İlgili Açıklamalar (KGK, 2023)
IFRS S1/S2'nin Türkçe uyarlaması; KGK (Kamu Gözetimi Kurumu) yayını.
BİST-100: 2024 rapor dönemi · BİST-tüm: 2025 · Büyük şirketler: 2026
"""
from typing import Any

# ── Zorunluluk takvimi ─────────────────────────────────────────────────────────
TSRS_DEADLINES = [
    {
        "segment": "BİST-100 şirketleri",
        "deadline": "31 Mart 2025",
        "report_period": "2024",
        "regulator": "SPK",
        "mandatory": True,
        "note": "Bağımsız sınırlı güvence zorunlu",
    },
    {
        "segment": "BİST-Tüm (BİST-100 dışı)",
        "deadline": "31 Mart 2026",
        "report_period": "2025",
        "regulator": "SPK",
        "mandatory": True,
        "note": "İlk rapor için gönüllü güvence yeterli",
    },
    {
        "segment": "Büyük şirketler (halka açık olmayan)",
        "deadline": "31 Mart 2027",
        "report_period": "2026",
        "regulator": "KGK",
        "mandatory": True,
        "note": "KGK kriterleri: aktif > 500M TL veya çalışan > 500",
    },
    {
        "segment": "Bankalar ve sigorta şirketleri",
        "deadline": "30 Haziran 2025",
        "report_period": "2024",
        "regulator": "BDDK",
        "mandatory": True,
        "note": "BDDK Yeşil Varlık Oranı raporlamasıyla entegre",
    },
    {
        "segment": "KOBİ'ler",
        "deadline": "2027+",
        "report_period": "2026+",
        "regulator": "KGK",
        "mandatory": False,
        "note": "Gönüllü; Ticaret Bakanlığı Sorumlu® programı ile uyumlu",
    },
]

# ── TSRS 1: Genel Sürdürülebilirlik Açıklamaları ──────────────────────────────
TSRS1_PILLARS = [
    {
        "id": "yonetisim",
        "label": "Yönetişim",
        "label_en": "Governance",
        "icon": "🏛️",
        "color": "#6366f1",
        "kgk_ref": "TSRS 1 Md.14–20",
        "description": "Sürdürülebilirlik risklerini ve fırsatlarını izleyen yönetim organları ve süreçleri",
        "requirements": [
            {"id": "y1", "ref": "TSRS 1 Md.15(a)", "text": "Sürdürülebilirlik gözetiminden sorumlu organ/kişi açıklaması"},
            {"id": "y2", "ref": "TSRS 1 Md.15(b)", "text": "Yönetimin rolü: strateji ve kararlar"},
            {"id": "y3", "ref": "TSRS 1 Md.16(a)", "text": "Yönetim organının bilgilendirilme süreçleri"},
            {"id": "y4", "ref": "TSRS 1 Md.16(b)", "text": "Sürdürülebilirliğin strateji ve risk gözetimine entegrasyonu"},
        ],
    },
    {
        "id": "strateji",
        "label": "Strateji",
        "label_en": "Strategy",
        "icon": "🧭",
        "color": "#f59e0b",
        "kgk_ref": "TSRS 1 Md.21–31",
        "description": "Sürdürülebilirlik riski/fırsatlarının iş modeli, strateji ve finansal performans üzerindeki etkileri",
        "requirements": [
            {"id": "s1", "ref": "TSRS 1 Md.22(a)", "text": "Makul ölçüde beklentileri etkileyebilecek risk ve fırsatlar"},
            {"id": "s2", "ref": "TSRS 1 Md.22(b)", "text": "İş modeli ve değer zinciri üzerindeki öngörülen etkiler"},
            {"id": "s3", "ref": "TSRS 1 Md.22(c)", "text": "Stratejide ve karar alma süreçlerinde yapılan değişiklikler"},
            {"id": "s4", "ref": "TSRS 1 Md.22(d)", "text": "Strateji ve iş modelinin esnekliği (senaryo analizi)"},
        ],
    },
    {
        "id": "risk_yonetimi",
        "label": "Risk Yönetimi",
        "label_en": "Risk Management",
        "icon": "🛡️",
        "color": "#ef4444",
        "kgk_ref": "TSRS 1 Md.32–38",
        "description": "Sürdürülebilirlik risklerini ve fırsatlarını belirleme, değerlendirme ve izleme süreçleri",
        "requirements": [
            {"id": "r1", "ref": "TSRS 1 Md.34(a)", "text": "Risk ve fırsatların belirlenmesi süreçleri"},
            {"id": "r2", "ref": "TSRS 1 Md.34(b)", "text": "Değerlendirme kriterleri ve önceliklendirme"},
            {"id": "r3", "ref": "TSRS 1 Md.34(c)", "text": "Genel risk yönetim çerçevesiyle entegrasyon"},
            {"id": "r4", "ref": "TSRS 1 Md.34(d)", "text": "İzleme yaklaşımı ve karar alma süreçleri"},
        ],
    },
    {
        "id": "metrikler_hedefler",
        "label": "Metrikler ve Hedefler",
        "label_en": "Metrics & Targets",
        "icon": "📊",
        "color": "#10b981",
        "kgk_ref": "TSRS 1 Md.39–54",
        "description": "Sürdürülebilirlik riskleri ve fırsatlarına ilişkin performans metrikleri ve hedefler",
        "requirements": [
            {"id": "m1", "ref": "TSRS 1 Md.44(a)", "text": "İlgili TSRS'lerin gerektirdiği metrikler"},
            {"id": "m2", "ref": "TSRS 1 Md.44(b)", "text": "Sektöre özgü metrikler (SASB sektör standartları)"},
            {"id": "m3", "ref": "TSRS 1 Md.44(c)", "text": "Şirkete özgü önemli risk/fırsat metrikleri"},
            {"id": "m4", "ref": "TSRS 1 Md.44(d)", "text": "Şirketin belirlediği hedefler ve ilerleme durumu"},
        ],
    },
]

# ── TSRS 2: İklimle İlgili Açıklamalar ────────────────────────────────────────
TSRS2_PILLARS = [
    {
        "id": "iklim_yonetisim",
        "label": "İklim Yönetişimi",
        "label_en": "Climate Governance",
        "icon": "🏛️",
        "color": "#6366f1",
        "kgk_ref": "TSRS 2 Md.6–8",
        "requirements": [
            {"id": "iy1", "ref": "TSRS 2 Md.6", "text": "Yönetim kurulunun iklim riski ve fırsatları gözetimi"},
            {"id": "iy2", "ref": "TSRS 2 Md.7", "text": "Yönetimin iklim risk değerlendirme ve yönetimindeki rolü"},
        ],
    },
    {
        "id": "iklim_strateji",
        "label": "İklim Stratejisi",
        "label_en": "Climate Strategy",
        "icon": "🌡️",
        "color": "#f59e0b",
        "kgk_ref": "TSRS 2 Md.9–24",
        "requirements": [
            {"id": "is1", "ref": "TSRS 2 Md.10(a)", "text": "Fiziksel ve geçiş iklim riskleri ile fırsatlar"},
            {"id": "is2", "ref": "TSRS 2 Md.10(b)", "text": "İş modeli ve stratejiye öngörülen etkiler (kısa/orta/uzun vadeli)"},
            {"id": "is3", "ref": "TSRS 2 Md.10(c)", "text": "Senaryo analizi ile stratejik esneklik (1,5°C dahil)"},
            {"id": "is4", "ref": "TSRS 2 Md.10(d)", "text": "Net sıfır veya iklim hedeflerinde karbon kredisi kullanımı"},
        ],
    },
    {
        "id": "iklim_risk",
        "label": "İklim Risk Yönetimi",
        "label_en": "Climate Risk Management",
        "icon": "⚠️",
        "color": "#ef4444",
        "kgk_ref": "TSRS 2 Md.25–27",
        "requirements": [
            {"id": "ir1", "ref": "TSRS 2 Md.25(a)", "text": "İklim risklerini belirleme, değerlendirme ve önceliklendirme süreçleri"},
            {"id": "ir2", "ref": "TSRS 2 Md.25(b)", "text": "İklim risklerinin genel risk yönetimiyle entegrasyonu"},
        ],
    },
    {
        "id": "iklim_metrikler",
        "label": "İklim Metrikleri ve Hedefler",
        "label_en": "Climate Metrics & Targets",
        "icon": "📏",
        "color": "#10b981",
        "kgk_ref": "TSRS 2 Md.28–36",
        "requirements": [
            {"id": "im1", "ref": "TSRS 2 Md.29(a)", "text": "Sera gazı emisyonları: Kapsam 1, 2, 3 (konsolidasyon yaklaşımı ile)"},
            {"id": "im2", "ref": "TSRS 2 Md.29(b)", "text": "Sektörler arası metrik kategorileri (geçiş riski, fiziksel risk, sermaye)"},
            {"id": "im3", "ref": "TSRS 2 Md.29(c)", "text": "Sektöre özgü metrikler"},
            {"id": "im4", "ref": "TSRS 2 Md.33",    "text": "İklim hedefleri: mutlak/yoğunluk bazlı, SBTi doğrulaması"},
        ],
    },
]

# ── KGK özgü kontrol listesi ────────────────────────────────────────────────────
KGK_CHECKLIST = [
    {"id": "k1",  "category": "Kapsam", "text": "Raporlama kapsamı belirlendi (şirket, konsolidasyon grubu, değer zinciri)"},
    {"id": "k2",  "category": "Kapsam", "text": "Önemlilik değerlendirmesi yapıldı (finansal etki + çevre/sosyal etki)"},
    {"id": "k3",  "category": "Emisyon", "text": "Kapsam 1 emisyonları hesaplandı (GHG Protokolü veya ISO 14064-1)"},
    {"id": "k4",  "category": "Emisyon", "text": "Kapsam 2 emisyonları hesaplandı — hem konum hem piyasa bazlı"},
    {"id": "k5",  "category": "Emisyon", "text": "Kapsam 3 emisyonları belirlendi (en az önemli kategoriler)"},
    {"id": "k6",  "category": "Emisyon", "text": "TEİAŞ 2024 grid faktörü kullanıldı (0,4166 kgCO₂e/kWh)"},
    {"id": "k7",  "category": "Senaryo", "text": "En az iki iklim senaryosu analiz edildi"},
    {"id": "k8",  "category": "Senaryo", "text": "1,5°C veya 2°C senaryosu dahil edildi"},
    {"id": "k9",  "category": "Hedef",   "text": "İklim hedefi belirlendi (mutlak veya yoğunluk bazlı)"},
    {"id": "k10", "category": "Hedef",   "text": "Hedef baz yılı ve referans emisyonları açıklandı"},
    {"id": "k11", "category": "Güvence", "text": "Bağımsız güvence (sınırlı) için hazırlık başlatıldı"},
    {"id": "k12", "category": "Güvence", "text": "Veri izleme ve denetim izi oluşturuldu"},
]

# ── KKTC Konsolidasyon Kuralı (TSRS 1 Md.20 + Uygulama Kılavuzu B38) ────────
# Kuzey Kıbrıs Türk Cumhuriyeti'nde faaliyet gösteren Türk banka/şirket iştirakleri
# tek raporlama birimi olarak ana ortaklığın TSRS raporuna konsolide edilir.
KKTC_CONSOLIDATION_RULE = {
    "rule_ref": "TSRS 1 Madde 20 + Uygulama Kılavuzu B38",
    "summary": "KKTC'deki iştiraklerin emisyonları ve sürdürülebilirlik verileri, Türkiye'deki ana ortaklığın TSRS raporuna Kapsam 3 Kategori 15 (Finanse Edilen Emisyonlar) kapsamında dahil edilir.",
    "jurisdiction": "KKTC",
    "applicable_to": [
        "Türk bankaların KKTC şubeleri",
        "Türk holdinglerin KKTC iştirakleri",
        "BİST-listeli şirketlerin KKTC bağlı ortaklıkları",
    ],
    "reporting_treatment": "Konsolide raporlama — tek raporlama birimi",
    "emissions_scope": "Kapsam 1+2 (KKTC operasyonları) + Kapsam 3 Kat.15 (finanse edilen)",
    "deadline": "Ana ortaklığın TSRS deadline'ı geçerli (bankalar: 30 Haziran 2025)",
    "note": "KKTC, CSRD veya UK SRS kapsamında değil; TSRS tek geçerli çerçeve.",
    "pcaf_dqs_note": "KKTC portföyleri için PCAF Veri Kalite Skoru ortalama 3.5–4.5 arası beklenmektedir (aktivite verisi bazlı).",
}

# ── TSRS vs UK SRS: Temel Farklar ────────────────────────────────────────────
TSRS_VS_UK_SRS = {
    "shared_base": "Her iki standart da IFRS S1 ve S2 temeline dayanır (IOSCO onaylı, Temmuz 2023)",
    "differences": [
        {
            "topic": "Yayımlayan Kuruluş",
            "tsrs": "KGK (Kamu Gözetimi Kurumu), Türkiye — 2023",
            "uk_srs": "FRC (Financial Reporting Council), UK — 2024",
        },
        {
            "topic": "Zorunluluk Başlangıcı",
            "tsrs": "BİST-100: 2024 · Bankalar: Haz 2025 · Büyük şirketler: 2026",
            "uk_srs": "Premium + Standard listeli: FYB Ocak 2025",
        },
        {
            "topic": "İlk Yıl Esnekliği",
            "tsrs": "TSRS 1 (Genel) + TSRS 2 (İklim) birlikte zorunlu",
            "uk_srs": "İklim-önce uygulama: Y1'de yalnızca UK SRS 2 yeterli",
        },
        {
            "topic": "Geçiş Planı",
            "tsrs": "TSRS 2 §B36 — iklim geçiş planı açıklaması zorunlu",
            "uk_srs": "UK CTPR (Climate Transition Plan Requirement) + TPT sektör yolları",
        },
        {
            "topic": "Küçük Şirket Rahatlığı",
            "tsrs": "KOBİ'lere 2027+ gönüllü geçiş; Ticaret Bakanlığı Sorumlu® programı",
            "uk_srs": "AIM/AQSE için 2 yıllık aşamalı geçiş imkânı",
        },
        {
            "topic": "Düzenleyici Uyum",
            "tsrs": "SPK Tebliği + BDDK düzenlemeleri (bankalar)",
            "uk_srs": "FCA Listeleme Kuralları (LR 9.8.6R) + TCFD çift uyum",
        },
    ],
    "tri_jurisdictional_note": (
        "Türk bankalar Türkiye + UK + KKTC'de faaliyet gösteriyorsa: "
        "Ana konsolide rapor TSRS'ye göre; UK şubesi için UK SRS ek açıklaması; "
        "KKTC operasyonları TSRS ana raporuna konsolide edilir."
    ),
}

# ── Hazırlık band'ları ─────────────────────────────────────────────────────────
TSRS_READINESS_BANDS = [
    {"min": 0,  "max": 25, "label": "Başlangıç",  "color": "#ef4444", "desc": "TSRS uyumu için acil hazırlık gerekiyor"},
    {"min": 25, "max": 50, "label": "Gelişiyor",   "color": "#f59e0b", "desc": "Temel süreçler var; önemli eksiklikler giderilmeli"},
    {"min": 50, "max": 75, "label": "Kurumsal",    "color": "#3b82f6", "desc": "Çoğu gereklilik karşılanıyor; senaryo analizi tamamlanmalı"},
    {"min": 75, "max": 101,"label": "İleri Düzey", "color": "#10b981", "desc": "TSRS'e hazır; bağımsız güvenceye geçilebilir"},
]

# ── Değerlendirme ─────────────────────────────────────────────────────────────
def full_tsrs_assessment(
    company_name: str,
    segment: str,
    pillar_scores: dict[str, float],
    checklist_done: list[str],
    scope1_tco2e: float,
    scope2_tco2e: float,
    scope3_tco2e: float,
    scenarios_count: int = 0,
    has_target: bool = False,
) -> dict[str, Any]:
    overall = round(sum(pillar_scores.values()) / max(len(pillar_scores), 1), 1)
    band = next((b for b in TSRS_READINESS_BANDS if b["min"] <= overall < b["max"]), TSRS_READINESS_BANDS[-1])

    checklist_score = round(len(checklist_done) / len(KGK_CHECKLIST) * 100, 1)
    deadline = next((d for d in TSRS_DEADLINES if segment.lower() in d["segment"].lower()), TSRS_DEADLINES[0])

    gaps = []
    if scope3_tco2e == 0:
        gaps.append({"oncelik": "Yüksek", "ref": "TSRS 2 Md.29(a)", "aksiyon": "Kapsam 3 emisyonları ölçülmeli — en az önemli kategoriler açıklanmalı"})
    if scenarios_count < 2:
        gaps.append({"oncelik": "Yüksek", "ref": "TSRS 2 Md.10(c)", "aksiyon": "En az 2 iklim senaryosu analiz edilmeli (1,5°C dahil)"})
    if not has_target:
        gaps.append({"oncelik": "Orta",   "ref": "TSRS 2 Md.33",    "aksiyon": "İklim azaltma hedefi belirlenmeli; SBTi doğrulaması tavsiye edilir"})
    if pillar_scores.get("yonetisim", 0) < 60:
        gaps.append({"oncelik": "Yüksek", "ref": "TSRS 1 Md.15",    "aksiyon": "Yönetim kurulu düzeyinde sürdürülebilirlik gözetim organı atanmalı"})

    return {
        "company_name": company_name,
        "segment": segment,
        "pillar_scores": pillar_scores,
        "overall_score": overall,
        "readiness_label": band["label"],
        "readiness_color": band["color"],
        "readiness_desc": band["desc"],
        "checklist_score": checklist_score,
        "checklist_done": checklist_done,
        "deadline": deadline,
        "ghg_summary": {
            "scope1": scope1_tco2e,
            "scope2": scope2_tco2e,
            "scope3": scope3_tco2e,
            "total": scope1_tco2e + scope2_tco2e + scope3_tco2e,
        },
        "gaps": gaps,
        "tsrs1_pillars": TSRS1_PILLARS,
        "tsrs2_pillars": TSRS2_PILLARS,
        "kgk_checklist": KGK_CHECKLIST,
        "deadlines": TSRS_DEADLINES,
        "disclosure_ready": overall >= 65 and checklist_score >= 75,
        "kktc_consolidation_rule": KKTC_CONSOLIDATION_RULE,
        "tsrs_vs_uk_srs": TSRS_VS_UK_SRS,
    }


DEMO_RESULT = full_tsrs_assessment(
    company_name="Arçelik A.Ş.",
    segment="BİST-100",
    pillar_scores={"yonetisim": 78, "strateji": 62, "risk_yonetimi": 70, "metrikler_hedefler": 58},
    checklist_done=["k1", "k2", "k3", "k4", "k6", "k9", "k10"],
    scope1_tco2e=18_200,
    scope2_tco2e=9_600,
    scope3_tco2e=124_000,
    scenarios_count=1,
    has_target=True,
)
