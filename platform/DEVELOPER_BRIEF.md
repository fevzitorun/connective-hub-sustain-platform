# sustain.com.tr — Developer Brief
**Türkiye'nin İlk AI + Uydu Destekli Sürdürülebilirlik Raporlama Platformu**  
Connective Hub Dijital Teknolojiler Ltd. · Gizli

---

## 1. Proje Özeti

Türkiye'deki büyük şirketler, 29.12.2023 tarih 32414 sayılı Resmi Gazete'de yayımlanan **TSRS 1 & 2** (KGK) standartları kapsamında sürdürülebilirlik raporu yayımlamak zorunda. Mevcut süreç:

- Danışmanlık firması tutulur → 6–12 ay sürer → ₺500K–₺2M maliyet
- Şirketin %80'i ne yapacağını bilmiyor, standart çok teknik

**sustain.com.tr** bu süreci **veri gir → hesapla → AI rapor al** akışıyla haftalara indiriyor.

---

## 2. Tech Stack

```
Frontend   Next.js 16.2.6 (App Router, Turbopack) · TypeScript · Tailwind CSS
Backend    Python FastAPI 0.115 · SQLAlchemy 2.0 async · PostgreSQL 16
AI         Anthropic Claude claude-sonnet-4-6 · Prompt caching (ephemeral)
Auth       JWT (python-jose) · bcrypt · Next.js proxy guard (cookie-based)
Infra      Docker Compose · Redis 7
```

### Klasör Yapısı

```
platform/
├── frontend/                    # Next.js 16 App Router
│   ├── app/
│   │   ├── (platform)/          # Sidebar'lı sayfalar (auth korumalı)
│   │   │   ├── dashboard/       # Ana panel — KPI, grafik, uydu widget
│   │   │   ├── veri-girisi/     # Emisyon veri girişi (4 sekme, 8 sektör)
│   │   │   ├── ai-rapor/        # AI rapor oluşturucu + polling
│   │   │   ├── raporlar/        # Rapor listesi
│   │   │   ├── uydu/            # Fiziksel iklim riski haritası
│   │   │   ├── gar/             # Banka GAR portalı
│   │   │   ├── esg/             # ESG performans panosu
│   │   │   └── destekler/       # Devlet hibeler & destekler
│   │   ├── login/               # Auth (cookie + localStorage)
│   │   └── register/            # Kayıt (şirket bilgileriyle)
│   ├── components/
│   │   ├── layout/              # Sidebar, Header
│   │   └── dashboard/           # KpiGrid, EmissionTrendChart, ScopeDonutChart,
│   │                            #   ComplianceGauge, SatelliteWidget, RecentReports
│   ├── lib/
│   │   ├── api.ts               # Tüm backend çağrıları (Bearer auth)
│   │   └── constants.ts         # EMISSION_FACTORS, SECTORS, API_URL
│   ├── types/index.ts           # TS arayüzleri
│   └── proxy.ts                 # Auth guard (Next.js 16 proxy convention)
│
├── backend/                     # FastAPI
│   └── app/
│       ├── models/              # SQLAlchemy ORM (Company, User, EmissionRecord, Report)
│       ├── routes/              # auth.py · emissions.py · reports.py
│       └── services/
│           ├── calculation_engine.py   # GHG Protocol hesaplama motoru
│           ├── ai_report_writer.py     # Claude claude-sonnet-4-6 rapor üretimi
│           └── auth.py                 # JWT helpers
│
├── docker-compose.yml           # postgres + redis + backend + frontend
└── .env                         # Konfigürasyon (API key buraya)
```

---

## 3. Ortam Kurulumu

### Gereksinimler
- Docker Desktop 4.x+
- Git

### Başlatma

```bash
git clone <repo-url>
cd platform

# .env içindeki ANTHROPIC_API_KEY satırını gerçek key ile doldurun
# console.anthropic.com → API Keys → Create Key (sk-ant-... formatı)
nano .env

docker compose up --build
```

Servisler:
| Servis | URL |
|--------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| PostgreSQL | localhost:5432 |

### Frontend tek başına (backend olmadan, demo mod)

```bash
cd frontend
npm install
npm run dev
# http://localhost:3000 → "🚀 Demo Girişi" butonu ile girin
```

---

## 4. Temel API Akışı (MVP)

```
POST /auth/register   → Şirket + User oluştur, JWT döner
POST /auth/login      → JWT döner
POST /emissions       → Veri kaydet + GHG hesapla (upsert, yıl başına)
POST /reports/generate → Report kaydı aç (status: "generating") +
                         BackgroundTask → Claude claude-sonnet-4-6 → status: "completed"
GET  /reports/{id}/status → Polling (frontend her 3sn çeker)
GET  /reports         → Şirkete ait tüm raporlar
```

---

## 5. Hesaplama Motoru

Dosya: `backend/app/services/calculation_engine.py`

| Kapsam | Faktörler | Kaynak |
|--------|-----------|--------|
| Kapsam 1 | Doğalgaz 2,0404 · Dizel 2,6762 · LPG 1,6318 · Kömür 2,4248 kg CO₂e | GHG Protocol |
| Kapsam 2 | **0,4166 kg CO₂e/kWh** (konum bazlı) | TEİAŞ 2024 |
| Kapsam 3 | Uçuş kısa 0,1553 · uzun 0,1909 kg CO₂e/kişi-km | DEFRA 2024 |
| Bankacılık | Finanse edilmiş emisyonlar (PCAF Kat. 15) | PCAF Standard |

TSRS uyum skoru: 20 kontrol → A/B/C/D notu (`calculate_tsrs_compliance()`)

---

## 6. AI Rapor Üretimi

Dosya: `backend/app/services/ai_report_writer.py`

- **Model:** `claude-sonnet-4-6` · `max_tokens: 16000`
- **Prompt caching:** Sistem promptu `cache_control: ephemeral` → tekrar çağrılarda %80 maliyet düşüşü
- **Sistem promptu:** 13 gerçek Türk TSRS raporundan öğrenilen format kuralları (Akbank, Arçelik, Afyon Çimento, Tüpraş vb.)
- **BackgroundTask:** Rapor anında "generating" olarak açılır, Claude tamamlayınca "completed"
- **asyncio.to_thread:** Blocking Anthropic çağrısı event loop'u bloklamaz

---

## 7. Kritik Teknik Notlar

### Auth Mimarisi
- Token hem `localStorage` hem `cookie` (name: `sustain_token`) olarak saklanır
- Next.js proxy (`proxy.ts`) cookie'yi okur → tokensiz istekler `/login`'e yönlenir
- Backend JWT: HS256, 7 gün TTL

### DB Upsert
`EmissionRecord` tablosunda `(company_id, year)` unique constraint var.  
Aynı yıl için ikinci submit → mevcut kaydı günceller (insert yapmaz).

### BackgroundTask Session Bug — Çözüldü
`_run_report_generation` kendi `AsyncSessionLocal()` context manager'ı açar.  
Request-scoped session'ı KULLANMAZ — FastAPI'nin session lifecycle'ı ile çakışmaz.

### Next.js 16 Değişikliği
`middleware.ts` → `proxy.ts` (fonksiyon adı da `middleware` → `proxy`)

---

## 8. Mevcut Mock/Stub Alanlar

Aşağıdaki bileşenler şu an sabit veri gösteriyor — Faz 2'de dinamikleşecek:

| Bileşen | Durum |
|---------|-------|
| `KpiGrid.tsx` | Hardcoded 4.280 / 12.640 / 183.500 ton |
| `EmissionTrendChart.tsx` | Hardcoded 2023/2024 aylık veri |
| `ScopeDonutChart.tsx` | Hardcoded kapsam dağılımı |
| `SatelliteWidget.tsx` | Mock harita, hardcoded risk puanları |
| `Sidebar.tsx` | Hardcoded kullanıcı "Kemal Yılmaz" / "Akbank" |
| `uydu/page.tsx` | Placeholder harita |
| `gar/page.tsx` | Static GAR hesabı |
| `esg/page.tsx` | Static E/S/G puanlar |
| `destekler/page.tsx` | Static hibe listesi |

---

## 9. Faz 2 — Geliştirme Sıralaması (Öncelik Sırasıyla)

### 9.1 Uydu & Harita Entegrasyonu
```
NASA EARTHDATA    → NDVI skoru, bitki örtüsü değişimi (ücretsiz, kayıt gerekli)
AFAD API          → Deprem bölgesi, son 10 yıl sismik veri (ücretsiz)
Copernicus EFAS   → Sel risk haritası (ücretsiz)
Mapbox GL JS      → Tesis pin, risk katmanı overlay, uydu görüntü
OpenAQ            → PM2.5, NO₂ hava kalitesi (ücretsiz)
```
**Eklenecek env:** `MAPBOX_TOKEN`, `NASA_EARTHDATA_TOKEN`, `AFAD_API_KEY`

### 9.2 Dashboard Dinamikleşmesi
- `GET /dashboard/summary` endpoint → gerçek emisyon toplamları
- `KpiGrid`, `EmissionTrendChart`, `ScopeDonutChart` → API'dan veri
- Sidebar kullanıcı/şirket bilgisi → `GET /auth/me` + `GET /companies/{id}`

### 9.3 Uluslararası Standartlar
```
GRI Universal 2021  → Disclosure mapping şablonları
TCFD                → Senaryo analizi motoru (IEA NZE 2050, IPCC 1.5°C/2°C)
ESRS E1             → AB Taksonomisi uyum kontrolü
CDP                 → Soru bazlı form, Claude ile otomatik doldurma
SBTi                → Hedef doğrulama, pathway hesabı (Science Based Targets)
```

### 9.4 Raporlama Altyapısı
- PDF export: WeasyPrint (backend) veya Puppeteer (headless Chrome)
- Word export: python-docx
- KGK XBRL formatı: iXBRL şablonu
- Güvence imzası: dijital onay akışı

### 9.5 Kapsam 3 Genişletme (15 Kategorinin Tamamı)
```
Mevcut: Kat.1 (satın alınan mallar), Kat.3 (yakıt), Kat.6 (iş seyahati), Kat.15 (finanse)
Eksik:  Kat.2,4,5,7-14 → tedarik zinciri, ürün kullanımı, elden çıkarma vb.
```

### 9.6 SaaS & Gelir
- Stripe entegrasyonu: Free / Starter ₺990 / Pro ₺2.990 / Kurumsal
- Usage metering: rapor başına token maliyeti izleme
- White-label: danışmanlık firmaları için özel domain + logo

---

## 10. Çevre Değişkenleri Referansı

| Değişken | Açıklama | Zorunlu |
|----------|----------|---------|
| `ANTHROPIC_API_KEY` | Claude API erişimi (sk-ant-...) | Evet (AI rapor) |
| `SECRET_KEY` | JWT imzalama (min 32 karakter) | Evet |
| `POSTGRES_*` | DB bağlantısı | Evet |
| `NEXT_PUBLIC_API_URL` | Frontend → Backend URL | Evet |
| `MAPBOX_TOKEN` | Harita (Faz 2) | Hayır |
| `NASA_EARTHDATA_TOKEN` | NDVI/uydu (Faz 2) | Hayır |

---

## 11. Önemli Dosyalar — Hızlı Referans

| Görev | Dosya |
|-------|-------|
| Emisyon faktörlerini değiştir | `backend/app/services/calculation_engine.py:9` |
| AI rapor sistem promptunu düzenle | `backend/app/services/ai_report_writer.py:8` |
| Yeni API endpoint ekle | `backend/app/routes/` + `backend/app/main.py`'ye `include_router` |
| Sidebar'a yeni sayfa ekle | `frontend/components/layout/Sidebar.tsx` + `frontend/app/(platform)/` |
| Yeni emisyon alanı ekle | Model → Route → Frontend form → TS types (4 dosya) |
| Auth guard davranışını değiştir | `frontend/proxy.ts` |

---

*Sprint 1 tamamlandı: 2026-05-20*  
*Sonraki sprint: Uydu entegrasyonu + Dashboard dinamikleşmesi*
