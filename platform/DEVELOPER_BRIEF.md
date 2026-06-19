# SustainHub — Developer Brief
**Global Sustainability Intelligence Platform — sustainhub.ai**
Connective Hub Dijital Teknolojiler Ltd. · Gizli · İstanbul & Londra

---

## 1. Proje Özeti

SustainHub, şirketlerin sürdürülebilirlik verilerini tek bir platform üzerinden yöneterek regülasyonlara otomatik uyum sağlamasını, AI destekli raporlar üretmesini ve sektör benchmark'larıyla performansını ölçmesini sağlar.

**Problem:** Bir Türk tekstil ihracatçısı şu anda 5 farklı düzenlemeye uyum sağlamak zorunda:
- **TSRS 1&2** (KGK, Türkiye — zorunlu 2024)
- **CBAM** (AB Sınır Karbon — beyan Ocak 2026)
- **CSRD** (AB Kurumsal Raporlama — AB'li müşteri baskısı)
- **EUDR** (AB Ormansızlaşma Tüzüğü — Aralık 2026)
- **BDDK GAR** (34 Türk bankası — kredi riski değerlendirmesi)

Mevcut süreç: Danışmanlık firması → 6–12 ay → ₺500K–₺2M maliyet → sonuç: Excel dosyaları.

**Çözüm:** Veri gir → hesapla → AI rapor al → bankaya gönder → AB'ye ihraç et.

---

## 2. Tech Stack

```
Frontend    Next.js 16.2.6 (App Router, Turbopack) · TypeScript · Tailwind CSS
Backend     Python FastAPI 0.115 · SQLAlchemy 2.0 async · PostgreSQL 16
AI          Anthropic Claude claude-sonnet-4-6 · Prompt caching (ephemeral, %80 maliyet tasarrufu)
Auth        JWT (python-jose) · bcrypt · RBAC (5 rol hiyerarşisi)
Infra       Docker Compose · Redis 7 · Alembic migrations
Test        pytest · pytest-asyncio · SQLite in-memory
```

---

## 3. Klasör Yapısı

```
platform/
├── frontend/                         # Next.js 16 App Router
│   ├── app/
│   │   ├── (platform)/               # Sidebar'lı sayfalar (auth korumalı)
│   │   │   ├── dashboard/            # KPI, grafik, uydu widget, uyum özeti
│   │   │   ├── veri-girisi/          # Emisyon veri girişi (Scope 1/2/3, 8 sektör)
│   │   │   ├── ai-rapor/             # AI rapor üretici + polling + draft auto-save
│   │   │   ├── raporlar/             # Rapor listesi + versiyon geçmişi + onay durumu
│   │   │   ├── uydu/                 # Fiziksel iklim risk haritası (deprem/sel/kuraklık)
│   │   │   ├── gar/                  # Banka GAR portalı (BDDK)
│   │   │   ├── esg/                  # ESG performans panosu
│   │   │   └── destekler/            # Devlet hibeleri & teşvikler
│   │   ├── login/                    # JWT auth
│   │   └── register/                 # Şirket kayıt formu
│   ├── components/
│   │   ├── layout/                   # Sidebar, Header
│   │   └── dashboard/                # KpiGrid, EmissionTrendChart, ScopeDonutChart,
│   │                                 #   ComplianceGauge, SatelliteWidget, RecentReports
│   ├── lib/
│   │   ├── api.ts                    # Tüm backend çağrıları (Bearer auth)
│   │   └── constants.ts              # EMISSION_FACTORS, SECTORS, API_URL
│   ├── types/index.ts                # TypeScript arayüzleri
│   └── proxy.ts                      # Auth guard (Next.js 16 proxy convention)
│
├── backend/
│   └── app/
│       ├── models/
│       │   ├── company.py            # Şirket: sektör, vergi no, çalışan sayısı
│       │   ├── user.py               # Kullanıcı: email, hashed_pw, rol, is_active
│       │   ├── emission.py           # EmissionRecord: Scope 1/2/3 + bankacılık + çimento + enerji
│       │   └── report.py             # Report, ReportDraft, ShareLink
│       ├── routes/
│       │   ├── auth.py               # /auth/login, /register, /me
│       │   ├── emissions.py          # /emissions CRUD
│       │   ├── reports.py            # /reports/generate, /status, /versions, /submit, /approve, /share
│       │   ├── drafts.py             # /drafts/save, /latest, /{id} DELETE
│       │   ├── bulk_upload.py        # /emissions/template, /bulk-upload (CSV)
│       │   ├── validation.py         # /validate/emissions (gerçek zamanlı anomaly detection)
│       │   ├── users.py              # /users (invite, role update, deactivate)
│       │   └── dashboard.py          # /dashboard özet KPI'lar
│       └── services/
│           ├── ai_report_writer.py   # Claude claude-sonnet-4-6 TSRS rapor üretimi
│           ├── calculation_engine.py # GHG Protocol (ISO 14064) hesaplama motoru
│           ├── rbac.py               # Rol tabanlı yetkilendirme (5 rol)
│           ├── validation_engine.py  # Sektör bazlı anomaly detection (8 sektör)
│           ├── risk_engine.py        # Fiziksel iklim riski hesaplama
│           └── auth.py               # JWT helpers (jose, bcrypt)
│
├── tests/
│   ├── conftest.py                   # SQLite in-memory fixtures
│   ├── test_auth.py                  # Auth endpoint testleri
│   ├── test_drafts.py                # Draft/auto-save testleri
│   └── test_validation.py            # Validation engine + endpoint testleri
│
├── docker-compose.yml                # Postgres + Redis + Backend + Frontend
├── pytest.ini                        # asyncio_mode=auto, %60 kapsam hedefi
└── DEVELOPER_BRIEF.md                # Bu belge
```

---

## 4. Veri Modeli

### 4.1 Temel Tablolar

**users**
```
id (UUID PK), email (unique), name, hashed_password
role: admin | editor | data_entry | auditor | viewer
company_id (FK), is_active, created_at
```

**companies**
```
id, name, tax_id, sector, employee_count, is_regulated, is_public
sasb_volume, net_zero_target_year
```

**emission_data**
```
id, company_id, year (unique per company)
Scope 1: natural_gas_m3, diesel_liters, lpg_kg, coal_tons, company_vehicles_km
Scope 2: electricity_kwh, electricity_source, steam_gj
Scope 3: business_travel_flight_km, employee_commute_km, waste_tons, water_m3
Bankacılık: loan_portfolio_tl, green_finance_ratio
Çimento: clinker_tons, cement_production_tons, alternative_fuel_ratio
Fiziksel risk: earthquake_zone, flood_risk, drought_risk, ndvi_score
```

**reports**
```
id, company_id, emission_data_id, standard, language
status: draft|generating|completed|failed|pending|approved|rejected|published
content_text (TEXT), compliance_score, compliance_grade
version_number (INT), version_of (FK self-ref)
submitted_at, approved_at, approved_by (FK users.id)
ai_model, prompt_tokens, completion_tokens
```

**report_drafts** (Sprint 2)
```
id, user_id, company_id, emission_data_id, report_id
content (JSONB) — form state, notes (TEXT)
updated_at (auto-update), created_at
```

**share_links** (Sprint 2)
```
id, report_id (FK), token (64-char urlsafe, unique)
password_hash (optional), expires_at, max_views, view_count
is_active, created_by (FK users.id), created_at
```

---

## 5. API Endpoint Özeti

### Auth
```
POST /auth/register     # Şirket + kullanıcı kaydı
POST /auth/login        # JWT token al
GET  /auth/me           # Mevcut kullanıcı bilgileri
```

### Emisyon Verileri
```
GET    /emissions                    # Şirkete ait kayıtlar
POST   /emissions                    # Yeni kayıt ekle
PUT    /emissions/{id}               # Güncelle
GET    /emissions/template           # CSV şablonu indir
POST   /api/emissions/bulk-upload    # CSV toplu yükleme
```

### Raporlar
```
POST /reports/generate              # AI rapor başlat (async, 202)
GET  /reports/{id}/status           # Durum + içerik polling
GET  /reports/{id}/versions         # Versiyon geçmişi
POST /reports/{id}/submit           # Onaya gönder (pending)
POST /reports/{id}/approve          # Onayla / reddet (admin/editor)
POST /reports/{id}/publish          # Yayınla (admin)
POST /reports/{id}/share            # Paylaşım linki oluştur
GET  /reports/public/{token}        # Token ile rapor görüntüle (auth yok)
GET  /reports                       # Rapor listesi
```

### Taslaklar
```
POST /drafts/save      # Otomatik kaydet (30 sn)
GET  /drafts/latest    # Son taslağı getir
DELETE /drafts/{id}    # Taslağı sil
```

### Doğrulama
```
POST /validate/emissions          # Gerçek zamanlı anomaly kontrolü
GET  /validate/emissions/{id}     # Mevcut kayıt doğrula
```

### Kullanıcı Yönetimi
```
GET    /users              # Şirket kullanıcıları (editor+)
POST   /users/invite       # Davet (admin)
PATCH  /users/{id}/role    # Rol güncelle (admin)
DELETE /users/{id}         # Devre dışı bırak (admin)
```

---

## 6. RBAC Rol Hiyerarşisi

```
admin (100)     → Tüm yetkiler
editor (60)     → Rapor oluştur, paylaş, emisyon girişi
data_entry (40) → Sadece emisyon girişi + raporu okuyabilir
auditor (30)    → Sadece okuma
viewer (10)     → Sadece rapor okuma
```

---

## 7. Ortam Kurulumu

```bash
# 1. Clone
git clone https://github.com/fevzitorun/connective-hub-sustain-platform
cd connective-hub-sustain-platform/platform

# 2. Çevre değişkenleri
cat > backend/.env << EOF
DATABASE_URL=postgresql+asyncpg://sustain:sustain@localhost:5432/sustain
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-jwt-secret-key-min-32-chars
ANTHROPIC_API_KEY=sk-ant-...
ENVIRONMENT=development
EOF

# 3. Docker Compose ile başlat
docker-compose up --build

# Erişim:
# Frontend: http://localhost:3000
# Backend:  http://localhost:8000
# API Docs: http://localhost:8000/docs

# 4. Test
cd backend
pip install -r requirements.txt
pytest --cov=app --cov-report=term-missing
```

---

## 8. Bilgi Tabanı (Knowledge Base)

`../raporlar/` klasöründe **180+ referans belge, 643MB** bulunuyor. Tam katalog: [`../raporlar/KNOWLEDGE-BASE.md`](../raporlar/KNOWLEDGE-BASE.md)

### Ana Kategoriler:
| Kategori | Adet | Platform Kullanımı |
|----------|------|-------------------|
| TR TSRS Pilot Raporları | 13 | AI rapor kalibrasyonu, benchmark |
| AB Düzenlemeleri (CSRD/CSDDD/CBAM/EUDR) | 20+ | Phase 3.5-4.5 uyum modülleri |
| UK Sürdürülebilirlik | 10 | UK SRS modülü (Phase 3) |
| Türkiye İklim Politikası | 12 | NDC, uzun vadeli strateji, COP31 |
| SASB JRC Sektör Standartları | 22 cilt | AI sektörel açıklama şablonları |
| EEA Veri Setleri (CSV) | 8 | Benchmark cron job (Phase 3) |
| SDG / BM Raporları | 9 | SDG hedef eşleştirme |
| Küresel Şirket Raporları | 5 | Format referansı |
| Akademik Makaleler | 7 | Metodoloji doğrulama |

---

## 9. Deployment

### Mevcut (Statik Marketing)
```
Platform: Vercel
URL:      sustaincomtr.vercel.app
Routes:   / → index.html
          /pitch → pitch-deck.html
          /demo → prototype.html
```

### Hedef (Full Stack)
```
Frontend: Vercel / Netlify (Next.js)
Backend:  Railway / Render / AWS ECS
DB:       Supabase / AWS RDS PostgreSQL
Redis:    Upstash / AWS ElastiCache
Domain:   sustainhub.ai (satın alınacak)
```

---

## 10. Geliştirme Yol Haritası

| Phase | Hafta | Özellikler |
|-------|-------|-----------|
| 2.0 ✅ | 1-2 | Draft, Versiyonlama, Bulk Upload, Validation |
| 2.5 ✅ | 3-4 | RBAC, Approval Workflow, Share Links, Test Suite |
| 3.0 🔜 | 5-6 | Benchmark Radar, AI Hedef (SBTi), Audit Log, Multi-tenant RLS |
| 3.5 🔜 | 7-8 | Entegrasyon Marketplace, COP31 Şablonu, Kredi Puanlama |
| 4.0 🔜 | 9-10 | Gerçek Uydu (NASA/ESA), PDF/XBRL Export, Stripe |
| 4.5 🔜 | 11-12 | CSRD Çifte Önemlilik, CBAM Beyan, EUDR Tedarik Zinciri |
| 5.0 🔜 | 13+ | Dijital Ürün Pasaportu, FLAG Emisyon, GRI/TCFD/ESRS tam |

---

## 11. Hesaplama Motorları

### GHG Protocol (ISO 14064-1)
```python
# TEİAŞ 2024 şebeke faktörü
ELECTRICITY_FACTOR_TR = 0.4166  # kgCO₂e/kWh

# Doğal gaz
NATURAL_GAS_FACTOR = 1.9  # kgCO₂e/m³

# Scope 1 toplam
scope1 = (natural_gas * 1.9 + diesel * 2.68 + lpg * 2.98 + coal * 2.42) / 1000  # tCO₂e
```

### TSRS Uyum Skoru (0-100)
- **Yönetişim** (25p): Yönetim kurulu gözetimi, yönetim rolü, teşvik mekanizmaları
- **Strateji** (20p): İş modeli, risk/fırsat, senaryo analizi, geçiş planı
- **Risk** (20p): Risk süreci, risk entegrasyonu
- **Metrikler** (35p): Scope 1/2/3, enerji, su, atık, sektör metrikleri, GHG endeksi

### Sektör Validation Eşikleri
```
İmalat:   50K–50M kWh elektrik, 1K–5M m³ doğal gaz
Bankacılık: 10K–5M kWh, 100–500K m³
Perakende: 100K–100M kWh
Enerji:   1M–10B kWh
```

---

## 12. AI Rapor Yazıcısı

**Model:** `claude-sonnet-4-6` (Anthropic)  
**Prompt Caching:** Ephemeral 5 dakika — %80 maliyet tasarrufu  
**Çıktı:** ~3,000–5,000 kelime TSRS uyumlu Türkçe rapor  
**Async:** `asyncio.to_thread()` — event loop'u bloke etmez  
**Bölümler:** Yönetişim, Strateji, Senaryo Analizi, Metrikler, İklim Riski, TSRS Endeksi

---

*SustainHub · Connective Hub Dijital Teknolojiler Ltd.*  
*Haziran 2026 · sustainhub.ai*
