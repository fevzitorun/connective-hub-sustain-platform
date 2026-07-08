# ── SustainHub Backend — Production Dockerfile ──────────────────────────
# Multi-stage build: ~120MB final image
# Railway/Render uyumlu: PORT env var desteği, non-root user, health check

# ── Stage 1: Builder ────────────────────────────────────────────────────
FROM python:3.12-slim AS builder

WORKDIR /build

# Sistem bağımlılıkları (WeasyPrint + psycopg2 için)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev libffi-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# ── Stage 2: Runtime ───────────────────────────────────────────────────
FROM python:3.12-slim

# Sistem kütüphaneleri (runtime)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 curl \
    && rm -rf /var/lib/apt/lists/*

# Non-root user
RUN groupadd -r sustainhub && useradd -r -g sustainhub -d /app -s /sbin/nologin sustainhub

WORKDIR /app

# Python paketlerini builder'dan kopyala
COPY --from=builder /install /usr/local

# Uygulama dosyaları
COPY . .

# Sahiplik
RUN chown -R sustainhub:sustainhub /app

USER sustainhub

# Railway/Render PORT env var'ını kullanır, varsayılan 8000
ENV PORT=8000
EXPOSE ${PORT}

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

# Production: gunicorn + uvicorn workers
CMD gunicorn app.main:app \
    --config gunicorn.conf.py \
    --bind 0.0.0.0:${PORT}
