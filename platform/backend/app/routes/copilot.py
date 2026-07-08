"""
Sustain Copilot — AI Assistant with Platform Context
Sprint 25 · Powered by Claude claude-sonnet-5
"""
import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import anthropic

router = APIRouter(prefix="/copilot", tags=["Sustain Copilot"])

# System prompt with live platform context (injected per request in production)
SYSTEM_PROMPT = """Sen SustainHub'ın yapay zeka destekli sürdürülebilirlik danışmanısın — Sustain Copilot.

Sürdürülebilirlik direktörlerine, CFO'lara ve banka yöneticilerine şu konularda yardım ediyorsun:
• Sera gazı hesaplama (Kapsam 1/2/3, GHG Protokolü, PCAF)
• Düzenleyici uyum: TSRS 1&2, CSRD/ESRS, GRI, TCFD, ISSB S1&S2, UK SRS, BDDK GAR
• AB Taksonomisi ve Yeşil Varlık Oranı (GAR) hesaplama
• Finanse edilen emisyonlar (PCAF Standardı v2 — Kapsam 3 Kat. 15)
• İklim riski: fiziksel + geçiş (IPCC AR6, IEA NZE 2050, NGFS senaryoları)
• COP31 hazırlık süreci ve Türk şirketleri için TSRS yol haritası

MEVCUT PLATFORM BAĞLAMI (kullanıcının hesap verileri):
- Kullanıcı: Kemal Yılmaz, Sürdürülebilirlik Direktörü — Akbank T.A.Ş.
- Yargı Bölgeleri: BDDK (Türkiye) + FCA (UK) + KKTC Merkez Bankası
- GAR Oranı: %59.8 (2025 Hedef: %65)
- PCAF Finanse Edilen Emisyonlar: 62.480 tCO₂e (Kapsam 3 Kat. 15)
- Son Emisyon Kaydı (2024): Kapsam 1: 12.450 tCO₂e | Kapsam 2: 8.320 tCO₂e
- Aktif Çerçeveler: TSRS 1&2, BDDK Sürdürülebilir Bankacılık 2023, TCFD/ISSB S2
- ESG Skor: 76/100 (Sektör Ort.: 62/100)
- Aktif Uyarı: 3 regülasyon son tarihi 90 gün içinde

KONUŞMA KURALLARI:
- Kullanıcı Türkçe yazıyorsa Türkçe yanıtla; İngilizce yazıyorsa İngilizce yanıtla
- Kısa, aksiyon odaklı, veriye dayalı yanıtlar ver
- Emisyonları tCO₂e cinsinden, finansal değerleri ₺/€/£ cinsinden belirt
- Her yanıt sonunda 1 somut "Sonraki Adım" öner
- Platforma yönlendir: "GAR sayfanıza gidin", "TCFD modülünde görüntüleyebilirsiniz" vb.
- Asla uydurma veri verme — belirsizse belirt ve platforma yönlendir
"""

_anthropic_client: anthropic.Anthropic | None = None


def _get_client() -> anthropic.Anthropic:
    global _anthropic_client
    if _anthropic_client is None:
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise HTTPException(503, "Copilot servisi şu an kullanılamıyor")
        _anthropic_client = anthropic.Anthropic(api_key=api_key)
    return _anthropic_client


class ChatMessage(BaseModel):
    role: str      # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    company_context: dict | None = None   # optional per-company context override


class ChatResponse(BaseModel):
    content: str
    role: str = "assistant"
    tokens_used: int = 0


# Quick prompt suggestions (returned by GET for UI chips)
QUICK_PROMPTS = [
    {"tr": "GAR oranım nedir ve nasıl artırabilirim?", "en": "What is my GAR ratio and how to improve it?", "icon": "🏦"},
    {"tr": "Bu çeyrekte finanse edilen emisyonlarım ne kadar?", "en": "How much are my financed emissions this quarter?", "icon": "🔬"},
    {"tr": "Hangi regülasyon son tarihim yaklaşıyor?", "en": "Which compliance deadlines are approaching?", "icon": "📅"},
    {"tr": "COP31 için ne hazırlamalıyım?", "en": "What should I prepare for COP31?", "icon": "🇹🇷"},
    {"tr": "TCFD senaryolarımı BDDK'ya nasıl sunarım?", "en": "How do I present TCFD scenarios to BDDK?", "icon": "🌡️"},
    {"tr": "Kapsam 3 Kategori 15'i nasıl hesaplayayım?", "en": "How do I calculate Scope 3 Category 15?", "icon": "📊"},
]


@router.get("/prompts")
async def get_quick_prompts():
    """Quick prompt suggestions for the Copilot UI."""
    return {"prompts": QUICK_PROMPTS}


@router.post("/chat", response_model=ChatResponse)
async def copilot_chat(payload: ChatRequest):
    """Send a message to Sustain Copilot."""
    if not payload.messages:
        raise HTTPException(422, "Mesaj listesi boş olamaz")
    if len(payload.messages) > 50:
        raise HTTPException(422, "Maksimum 50 mesaj geçmişi destekleniyor")

    last_msg = payload.messages[-1].content.strip()
    if not last_msg:
        raise HTTPException(422, "Mesaj içeriği boş olamaz")

    # Build context-enriched system prompt
    system = SYSTEM_PROMPT
    if payload.company_context:
        ctx_lines = "\n".join(f"- {k}: {v}" for k, v in payload.company_context.items())
        system += f"\n\nEK ŞİRKET BAĞLAMI:\n{ctx_lines}"

    client = _get_client()
    messages = [{"role": m.role, "content": m.content} for m in payload.messages]

    response = client.messages.create(
        model="claude-sonnet-5",
        max_tokens=1024,
        system=system,
        messages=messages,
    )

    return ChatResponse(
        content=response.content[0].text,
        role="assistant",
        tokens_used=response.usage.input_tokens + response.usage.output_tokens,
    )


@router.get("/health")
async def copilot_health():
    """Check if Copilot is operational."""
    key_set = bool(os.getenv("ANTHROPIC_API_KEY"))
    return {"status": "ok" if key_set else "degraded", "api_key_configured": key_set}
