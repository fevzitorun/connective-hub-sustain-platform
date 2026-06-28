"""
Tedarikçi ESG Denetim Anketi.
RBA (Responsible Business Alliance) + ISO 26000 tabanlı 15 soru.
Otomatik puanlama + Red Flag tespiti.
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Dict, List, Optional
from .auth import get_current_user

router = APIRouter(prefix="/supplier-audit", tags=["supplier-audit"])

# 15 Soru — RBA v9.0 + ISO 26000 + GHG Protocol
AUDIT_QUESTIONS: List[Dict] = [
    # Çalışma Hakları
    {"id": "A1", "category": "Çalışma Hakları", "question": "Zorunlu / zorla çalıştırma politikanız var mı?",            "red_flag_if": "no",  "weight": 3},
    {"id": "A2", "category": "Çalışma Hakları", "question": "18 yaş altı çalıştırmama politikanız var mı?",              "red_flag_if": "no",  "weight": 3},
    {"id": "A3", "category": "Çalışma Hakları", "question": "Haftalık çalışma süreniz yasal sınır içinde mi?",           "red_flag_if": "no",  "weight": 2},
    {"id": "A4", "category": "Çalışma Hakları", "question": "Asgari ücretin üzerinde ödeme yapıyor musunuz?",            "red_flag_if": "no",  "weight": 1},
    # İş Sağlığı ve Güvenliği
    {"id": "B1", "category": "İSG",             "question": "ISO 45001 sertifikanız var mı?",                           "red_flag_if": None,  "weight": 2},
    {"id": "B2", "category": "İSG",             "question": "Son 12 ayda ölümlü iş kazası yaşandı mı? (Evet = Kötü)",   "red_flag_if": "yes", "weight": 3},
    {"id": "B3", "category": "İSG",             "question": "Çalışan güvenlik eğitim programınız var mı?",              "red_flag_if": "no",  "weight": 2},
    # Çevre
    {"id": "C1", "category": "Çevre",           "question": "ISO 14001 çevre yönetim sertifikanız var mı?",             "red_flag_if": None,  "weight": 2},
    {"id": "C2", "category": "Çevre",           "question": "Karbon emisyon envanteri yayımlıyor musunuz?",              "red_flag_if": None,  "weight": 2},
    {"id": "C3", "category": "Çevre",           "question": "Atık su / kimyasal atığı yasal limitlere uygun bertaraf ediyor musunuz?", "red_flag_if": "no", "weight": 3},
    # Etik
    {"id": "D1", "category": "Etik",            "question": "Anti-rüşvet ve yolsuzlukla mücadele politikanız var mı?",  "red_flag_if": "no",  "weight": 2},
    {"id": "D2", "category": "Etik",            "question": "Tedarikçi davranış kodu uyguluyor musunuz?",               "red_flag_if": None,  "weight": 1},
    {"id": "D3", "category": "Etik",            "question": "Kişisel veri koruma (KVKK/GDPR) uyumunuz var mı?",        "red_flag_if": "no",  "weight": 2},
    # Tedarik Zinciri
    {"id": "E1", "category": "Tedarik Zinciri", "question": "Kendi tedarikçilerinize ESG anketi uyguluyor musunuz?",    "red_flag_if": None,  "weight": 1},
    {"id": "E2", "category": "Tedarik Zinciri", "question": "Çatışma minerali (conflict mineral) politikanız var mı?",  "red_flag_if": None,  "weight": 2},
]


class AuditResponse(BaseModel):
    supplier_name: str
    responses: Dict[str, str]  # { "A1": "yes", "A2": "no", ... }
    notes: Optional[str] = None


@router.get("/questions")
async def get_questions():
    """Denetim soruları listesi — auth gerektirmez."""
    return {"questions": AUDIT_QUESTIONS}


@router.post("/score")
async def score_audit(data: AuditResponse, current_user=Depends(get_current_user)):
    """Anketi puanla, Red Flag'leri belirle."""
    red_flags: List[Dict] = []
    score = 0
    max_score = 0
    category_scores: Dict[str, Dict] = {}

    for q in AUDIT_QUESTIONS:
        qid = q["id"]
        answer = data.responses.get(qid, "").lower()
        weight = q["weight"]
        category = q["category"]

        if category not in category_scores:
            category_scores[category] = {"score": 0, "max": 0}

        max_score += weight * 3
        category_scores[category]["max"] += weight * 3

        if answer == "yes":
            pts = weight * 3
            score += pts
            category_scores[category]["score"] += pts
        elif answer == "partial":
            pts = weight * 1
            score += pts
            category_scores[category]["score"] += pts
        # "no" → 0 puan

        # Red Flag tespiti
        if q["red_flag_if"] and answer == q["red_flag_if"]:
            red_flags.append({
                "question_id": qid,
                "category": q["category"],
                "question": q["question"],
                "answer": answer,
                "severity": "critical" if weight >= 3 else "high",
            })

    pct = round((score / max_score) * 100) if max_score > 0 else 0

    if pct >= 80:
        grade, grade_color = "Düşük Risk", "#166534"
    elif pct >= 60:
        grade, grade_color = "Orta Risk", "#854d0e"
    elif pct >= 40:
        grade, grade_color = "Yüksek Risk", "#c2410c"
    else:
        grade, grade_color = "Kritik Risk", "#991b1b"

    critical_flags = [f for f in red_flags if f["severity"] == "critical"]

    return {
        "supplier_name": data.supplier_name,
        "score_pct": pct,
        "grade": grade,
        "grade_color": grade_color,
        "red_flags": red_flags,
        "critical_flag_count": len(critical_flags),
        "requires_immediate_action": len(critical_flags) > 0,
        "category_breakdown": {
            cat: round((v["score"] / v["max"]) * 100) if v["max"] > 0 else 0
            for cat, v in category_scores.items()
        },
        "recommendation": (
            "Bu tedarikçi ile çalışmayı durdurun ve iyileştirme planı isteyin."
            if len(critical_flags) >= 2 else
            "İyileştirme alanları için 90 günlük aksiyon planı talep edin."
            if len(critical_flags) == 1 else
            "6 ayda bir yeniden denetim önerin."
        ),
    }
