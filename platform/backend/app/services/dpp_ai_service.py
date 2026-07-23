"""
DPP AI — pasaport bağlamında Claude Q&A (Sürdürülebilirlik Asistanı).

Gemini önerileri:
- Kural koyucu değil, rehber ve yorumlayıcı
- Fallback: Claude yanıt vermezse statik metin
- Cache: aynı soru+bağlam tekrarında API'ye gitme

MVP: process-içi TTL cache. Prod'da Redis'e taşınabilir (redis paketi zaten
requirements.txt'de). Tek-worker deploy'da bu yeterli, çok-worker'da
Redis'e geçilmeli.
"""
from __future__ import annotations
import os
import json
import time
import hashlib
import logging
from typing import Optional
import httpx

logger = logging.getLogger(__name__)

_CACHE: dict[str, tuple[float, str]] = {}
_CACHE_TTL_SECONDS = 3600  # 1 saat


FALLBACK_ANSWERS = {
    "recycle": (
        "Bu ürünü geri dönüştürmek için: yerel belediyenizin ambalaj atığı "
        "toplama noktasına götürebilirsiniz. Ürün etiketindeki malzeme "
        "kodlarına göre ayrıştırın. Detaylı yönerge için ürün üreticisiyle "
        "iletişime geçin."
    ),
    "default": (
        "Sürdürülebilirlik asistanı şu an yanıt veremiyor. Pasaport üzerindeki "
        "malzeme bilgileri, karbon ayak izi ve uygunluk belgelerini inceleyebilirsiniz. "
        "Sorununuz devam ederse üreticiyle iletişime geçin."
    ),
}


def _cache_key(question: str, passport_id: str) -> str:
    h = hashlib.sha256(f"{passport_id}::{question.strip().lower()}".encode()).hexdigest()
    return h[:32]


def _cache_get(key: str) -> Optional[str]:
    entry = _CACHE.get(key)
    if not entry:
        return None
    ts, value = entry
    if time.time() - ts > _CACHE_TTL_SECONDS:
        _CACHE.pop(key, None)
        return None
    return value


def _cache_set(key: str, value: str) -> None:
    if len(_CACHE) > 500:  # naive bounded cache
        oldest = min(_CACHE.items(), key=lambda x: x[1][0])[0]
        _CACHE.pop(oldest, None)
    _CACHE[key] = (time.time(), value)


def _static_fallback(question: str) -> str:
    q = question.lower()
    if any(w in q for w in ("dönüş", "recycl", "iade", "atık", "çöp")):
        return FALLBACK_ANSWERS["recycle"]
    return FALLBACK_ANSWERS["default"]


async def ask_passport_assistant(
    question: str,
    passport_id: str,
    passport_context: dict,
) -> dict:
    """
    Kullanıcının pasaport hakkındaki sorusuna Claude ile yanıt.

    Returns:
        {"answer": str, "source": "claude" | "cache" | "fallback"}
    """
    key = _cache_key(question, passport_id)
    cached = _cache_get(key)
    if cached is not None:
        return {"answer": cached, "source": "cache"}

    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        answer = _static_fallback(question)
        return {"answer": answer, "source": "fallback"}

    context_json = json.dumps(passport_context, indent=2, ensure_ascii=False)
    system_prompt = (
        "Sen bir Sürdürülebilirlik Asistanısın. Kullanıcıya bir ürünün "
        "Dijital Ürün Pasaportu (AB ESPR) bağlamında yardım ediyorsun.\n\n"
        "Kurallar:\n"
        "- Sadece verilen pasaport verisine dayan. Yoksa bilmediğini söyle.\n"
        "- Kesin bir bilim/sertifika iddiasında bulunma; 'pasaporta göre' de.\n"
        "- Geri dönüşüm/kullanım/onarım sorularında pratik ve kısa cevap ver.\n"
        "- En fazla 2 paragraf, sade dil. Türkçe.\n\n"
        f"[PASAPORT VERİSİ]\n{context_json}"
    )

    payload = {
        "model": "claude-sonnet-5",
        "max_tokens": 600,
        "system": system_prompt,
        "messages": [{"role": "user", "content": question}],
    }
    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            r = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers=headers, json=payload,
            )
            r.raise_for_status()
            answer = r.json()["content"][0]["text"].strip()
            _cache_set(key, answer)
            return {"answer": answer, "source": "claude"}
    except Exception as e:
        logger.warning("DPP AI fallback triggered: %s", e)
        return {"answer": _static_fallback(question), "source": "fallback"}
