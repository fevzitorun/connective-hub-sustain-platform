"""
Sustain-Copilot: AI ESG Analisti.
Claude 3.5 Sonnet tabanlı, şirketin verileri (RAG Context) ile konuşabilen ve aksiyon öneren chatbot.
"""
import os
import json
import httpx
import logging
from .supplier_intelligence import get_high_risk_suppliers

logger = logging.getLogger(__name__)

async def chat_with_data(user_message: str, company_context: dict, anomalies: list) -> str:
    """
    Şirket bağlamı ve anomali raporlarını kullanarak kullanıcıya tavsiyelerde bulunur.
    """
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        # Fallback for demo without API key
        return "Sustain-Copilot (Demo Modu): Bağlantı kurulamadı, ancak dökümhanedeki %35 elektrik artışı dikkat çekici. Acil bir enerji audit yaptırmanızı öneririm."

    # RAG Context Formatlama
    context_str = json.dumps(company_context, indent=2, ensure_ascii=False)
    anomalies_str = json.dumps(anomalies, indent=2, ensure_ascii=False) if anomalies else "Son dönemde tespit edilen bir anomali yok."
    
    high_risk_suppliers = get_high_risk_suppliers()
    supplier_str = ""
    if high_risk_suppliers:
        supplier_str = "\n[YÜKSEK RİSKLİ TEDARİKÇİLER]\n"
        for sup in high_risk_suppliers:
            supplier_str += f"- {sup['name']}: {sup['issue']} Öneri: {sup['action_required']}\n"

    system_prompt = f"""Sen Sustain-Copilot'sun. Kurumsal bir ESG (Çevresel, Sosyal, Yönetişim) ve Karbon Ayak İzi baş analistisin.
Sadece durum tespiti yapmaz, YÖNETİM KURULUNA AKSİYON ÖNERİSİ sunarsın. (Örn: "Bir enerji audit yaptırın", "Güneş paneli yatırımını hızlandırın").
Aşağıda şirketin anlık ESG Veri Bağlamı ve sistemin tespit ettiği Anomaliler yer almaktadır.

[ŞİRKET VERİ BAĞLAMI]
{context_str}

[ANOMALİLER]
{anomalies_str}
{supplier_str}

Ayrıca Sustain Intelligence Hub'daki en son küresel gelişmeleri bilerek tavsiyelerde bulunmalısın (örn: AB'nin güncel CBAM kuralları, TSRS gereksinimleri, veya yeni karbon teknolojileri). Kullanıcıyı gerektiğinde Simulator ekranına (What-if analizi için) yönlendirmelisin.

Kullanıcının sorusuna yukarıdaki veriler ışığında net, teknik ve çözüm odaklı yanıt ver. Pasif dil kullanma. Lütfen kısa ve öz (maksimum 2 paragraf) konuş.
"""

    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
    }
    
    payload = {
        "model": "claude-sonnet-5",
        "max_tokens": 1000,
        "system": system_prompt,
        "messages": [
            {"role": "user", "content": user_message}
        ]
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers=headers,
                json=payload,
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()
            return data["content"][0]["text"].strip()
    except Exception as e:
        print(f"Sustain-Copilot Error: {e}")
        return "Sustain-Copilot: Üzgünüm, şu an veri motoruma erişemiyorum."
