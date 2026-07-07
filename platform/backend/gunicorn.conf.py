"""
SustainHub — Gunicorn Production Configuration
Railway/Render deploy için optimize edilmiş.
"""
import multiprocessing
import os

# Worker sayısı: Railway/Render genelde 1-2 CPU verir
# WEB_CONCURRENCY env var ile override edilebilir
workers = int(os.getenv("WEB_CONCURRENCY", multiprocessing.cpu_count() * 2 + 1))

# Uvicorn worker class (async FastAPI için zorunlu)
worker_class = "uvicorn.workers.UvicornWorker"

# Bağlantı ayarları
bind = f"0.0.0.0:{os.getenv('PORT', '8000')}"
keepalive = 120  # Railway proxy timeout'una uygun

# Timeout — AI rapor üretimi uzun sürebilir
timeout = 300  # 5 dakika (Claude API çağrıları için)
graceful_timeout = 30

# Logging
accesslog = "-"  # stdout
errorlog = "-"   # stderr
loglevel = os.getenv("LOG_LEVEL", "info")

# Güvenlik
limit_request_line = 8190
limit_request_fields = 100

# Preload — bellek tasarrufu (model import'ları paylaşılır)
preload_app = True

# Restart — memory leak koruması
max_requests = 1000
max_requests_jitter = 50
