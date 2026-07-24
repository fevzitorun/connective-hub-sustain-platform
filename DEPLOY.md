# SustainHub — Deploy Rehberi

Backend API'yi Railway veya Render'a deploy etmek için bu rehberi takip edin.

---

## Gereksinimler

| Servis | Açıklama | Minimum |
|--------|----------|---------|
| Python | Backend runtime | 3.12+ |
| PostgreSQL | Ana veritabanı | 16+ |
| Redis | Rate limiting + cache | 7+ |
| Anthropic API Key | AI rapor üretimi | claude-sonnet-4-6 |

---

## Ortam Değişkenleri

### Zorunlu

| Değişken | Açıklama | Örnek |
|----------|----------|-------|
| `DATABASE_URL` | PostgreSQL bağlantı URL'si | `postgresql+asyncpg://user:pass@host:5432/dbname` |
| `SECRET_KEY` | JWT imzalama anahtarı (min 32 karakter) | `rastgele-64-karakter-anahtar` |
| `ANTHROPIC_API_KEY` | Claude API anahtarı | `sk-ant-api03-...` |

### Opsiyonel

| Değişken | Varsayılan | Açıklama |
|----------|-----------|----------|
| `REDIS_URL` | `redis://localhost:6379` | Redis bağlantısı |
| `PORT` | `8000` | HTTP port (Railway/Render otomatik atar) |
| `WEB_CONCURRENCY` | `CPU * 2 + 1` | Gunicorn worker sayısı |
| `ENVIRONMENT` | `development` | `production` yapılmalı |
| `STRIPE_SECRET_KEY` | — | Ödeme entegrasyonu |
| `STRIPE_WEBHOOK_SECRET` | — | Stripe webhook doğrulama |
| `STRIPE_PUBLISHABLE_KEY` | — | Frontend Stripe key |
| `SMTP_HOST` | — | E-posta sunucusu |
| `SMTP_PORT` | `587` | SMTP portu |
| `SMTP_USER` | — | E-posta kullanıcı |
| `SMTP_PASSWORD` | — | E-posta şifre |
| `RATE_LIMIT_PER_MINUTE` | `100` | Genel rate limit |
| `RATE_LIMIT_AI_PER_HOUR` | `20` | AI rapor rate limit |

> ℹ️ **DATABASE_URL formatı:** Railway/Render PostgreSQL URL'si `postgres://` ile başlar. FastAPI asyncpg için `postgresql+asyncpg://` formatı gerekir. Backend (`app/config.py`) bu dönüşümü **otomatik** yapar ve asyncpg'nin desteklemediği `sslmode` query parametresini ayıklar — herhangi bir manuel düzenleme gerekmez.

---

## Option A: Railway Deploy

### 1. Railway Hesabı + Proje

```bash
# Railway CLI kurulumu
npm install -g @railway/cli
railway login
```

### 2. Yeni Proje Oluştur

```bash
# GitHub repo'yu bağla
railway init
railway link
```

### 3. PostgreSQL + Redis Ekle

Railway Dashboard → **+ New** → **Database** → **PostgreSQL**
Railway Dashboard → **+ New** → **Database** → **Redis**

### 4. Env Vars Ayarla

```bash
railway variables set SECRET_KEY="$(openssl rand -hex 32)"
railway variables set ANTHROPIC_API_KEY="sk-ant-..."
railway variables set ENVIRONMENT="production"

# DATABASE_URL ve REDIS_URL otomatik bağlanır
# ⚠️ DATABASE_URL'yi asyncpg formatına çevirin:
# postgresql:// → postgresql+asyncpg://
```

### 5. Deploy

```bash
# Otomatik deploy (push ile)
git push origin main

# Manual deploy
railway up --service backend
```

### 6. Migration

```bash
railway run --service backend -- alembic upgrade head
```

### 7. Domain

Railway Dashboard → **Settings** → **Networking** → **Generate Domain**
veya Custom Domain: `api.sustainhub.online`

### 8. İlk Admin Hesabı (Seed)

Deploy sonrası admin panelini (`/admin`) kullanmak için bir admin hesabı gerekir
(kayıt formu "editor" rolü verir). Seed scripti idempotenttir:

```bash
# Railway shell / lokal (backend dizininde)
python scripts/seed_admin.py --email admin@sustainhub.online --password 'GÜÇLÜ-PAROLA' --name 'Yönetici' --company 'SustainHub'
# veya env ile (CI/prod):
SEED_ADMIN_EMAIL=... SEED_ADMIN_PASSWORD=... python scripts/seed_admin.py
```

Kullanıcı varsa admin rolüne yükseltir, yoksa şirket + admin kullanıcı oluşturur.

---

## Option B: Render Deploy

### 1. Blueprint ile Otomatik Deploy

1. [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**
2. GitHub repo'yu bağlayın
3. `render.yaml` otomatik algılanır
4. **Apply** tıklayın — PostgreSQL + Redis + Backend otomatik oluşur

### 2. Manuel Env Vars

Render Dashboard → **sustainhub-api** → **Environment**:

```
ANTHROPIC_API_KEY=sk-ant-...
```

> `SECRET_KEY` ve `DATABASE_URL` Blueprint tarafından otomatik atanır.

### 3. Deploy Sonrası

```bash
# Migration çalıştır (Render Shell'den)
python -c "
import asyncio
from app.database import engine, Base
from app.models import *
asyncio.run(engine.begin().__aenter__().then(lambda c: c.run_sync(Base.metadata.create_all)))
"
```

### 4. Custom Domain

Render Dashboard → **Settings** → **Custom Domains** → `api.sustainhub.online`

---

## Doğrulama

Deploy sonrası bu endpoint'leri kontrol edin:

```bash
# Health check
curl https://your-domain.com/health
# Beklenen: {"status":"ok","platform":"SustainHub","version":"2.0.0"}

# API docs
open https://your-domain.com/docs

# Auth test
curl -X POST https://your-domain.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test1234","company_name":"Test","sector":"manufacturing"}'
```

---

## Frontend (Vercel)

Frontend zaten Vercel'de deploy: `www.sustainhub.online` (bkz. `platform/frontend/vercel.json`,
`app/robots.ts`'teki `host` alanı — kanonik domain).

> Not: Kök dizindeki `vercel.json` + `index.html`/`pitch-deck.html`/`prototype.html` eski,
> ayrı bir statik pazarlama sitesi — `sustaincomtr.vercel.app` altında hâlâ mevcut olabilir
> ama artık kanonik değil. `platform/frontend`'in kendi pazarlama sayfaları (`/`, `/hakkimizda`,
> `/products` vb.) esas siteyi oluşturuyor.

Backend URL'sini frontend'e bağlamak için:

```
# Vercel Dashboard → Settings → Environment Variables
NEXT_PUBLIC_API_URL=https://api.sustainhub.online
```

---

## Monitoring

| Araç | Amaç | Nasıl |
|------|------|-------|
| `/health` endpoint | Uptime monitoring | UptimeRobot / Better Uptime |
| Railway/Render Logs | Error tracking | Dashboard → Logs |
| Sentry (opsiyonel) | Exception tracking | `SENTRY_DSN` env var ekle |

---

*SustainHub — Connective Hub Dijital Teknolojiler Ltd.*
