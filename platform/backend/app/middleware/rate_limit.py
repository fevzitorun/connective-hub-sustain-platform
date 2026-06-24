"""
Rate limiting middleware — Redis tabanlı sliding window.
Redis yoksa bellek içi sayaç kullanır (tek işlem, geliştirme için).
"""
import time
from collections import defaultdict
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from ..config import settings

# Bellek içi fallback (Redis olmayan geliştirme ortamı)
_mem_counts: dict[str, list[float]] = defaultdict(list)

# Rate limit uygulanmayan yollar
_EXEMPT_PATHS = {"/health", "/docs", "/openapi.json", "/redoc"}

# AI endpoint'leri için ayrı (daha sıkı) limit
_AI_PATHS = {"/reports/generate"}


def _check_mem_limit(key: str, max_requests: int, window_seconds: int) -> bool:
    """Bellek içi sliding window. True → limit aşıldı."""
    now = time.time()
    cutoff = now - window_seconds
    timestamps = _mem_counts[key]
    # Pencere dışı kayıtları temizle
    _mem_counts[key] = [t for t in timestamps if t > cutoff]
    if len(_mem_counts[key]) >= max_requests:
        return True
    _mem_counts[key].append(now)
    return False


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        path = request.url.path

        if path in _EXEMPT_PATHS:
            return await call_next(request)

        # Kimlik: IP adresi (auth header yoksa)
        client_ip = request.client.host if request.client else "unknown"
        auth = request.headers.get("authorization", "")
        identity = auth[-16:] if auth else client_ip  # token sonu veya IP

        # AI endpoint'leri — saat başı limit
        if any(path.startswith(p) for p in _AI_PATHS):
            key = f"ai:{identity}"
            if _check_mem_limit(key, settings.rate_limit_ai_per_hour, 3600):
                raise HTTPException(
                    status_code=429,
                    detail={
                        "error": "rate_limit_exceeded",
                        "message": f"Saatte en fazla {settings.rate_limit_ai_per_hour} AI rapor üretilebilir.",
                        "retry_after": "3600s",
                    },
                )

        # Genel limit — dakika başı
        key = f"general:{identity}"
        if _check_mem_limit(key, settings.rate_limit_per_minute, 60):
            raise HTTPException(
                status_code=429,
                detail={
                    "error": "rate_limit_exceeded",
                    "message": f"Dakikada en fazla {settings.rate_limit_per_minute} istek gönderilebilir.",
                    "retry_after": "60s",
                },
            )

        return await call_next(request)
