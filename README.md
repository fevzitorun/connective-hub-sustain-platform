# 🌿 SustainHub — Global Sustainability Intelligence Platform

**The Operating System for Sustainability — Any Sector. Any Country.**

Istanbul · London | sustainhub.ai

---

## What is SustainHub?

SustainHub is an AI + satellite-powered sustainability reporting and compliance platform. Companies enter their data once and get:

- **Regulatory reports** (TSRS, CSRD/ESRS, GRI, TCFD, ISSB S1/S2, ISO 14064, CBAM)
- **AI-generated narratives** in Turkish and English via Claude claude-sonnet-4-6
- **Sector benchmarks** compared against anonymised peer data
- **Physical risk maps** powered by NASA Earthdata / ESA Sentinel-2 / AFAD
- **Bank GAR portal** (BDDK Green Asset Ratio — 34 Turkish banks)

Built for Turkey's mandatory TSRS reporting (KGK, Dec 2023) and expanding globally for CBAM, EUDR, CSRD, UK SRS, and COP31.

---

## Tech Stack

```
Frontend    Next.js 16.2.6 · TypeScript · Tailwind CSS · shadcn/ui
Backend     Python FastAPI 0.115 · SQLAlchemy 2.0 async · PostgreSQL 16
AI          Anthropic Claude claude-sonnet-4-6 · Prompt caching (80% cost savings)
Auth        JWT · bcrypt · Role-Based Access Control (admin/editor/auditor/viewer)
Infra       Docker Compose · Redis 7 · Alembic migrations
```

---

## Repository Structure

```
sustainhub/
├── index.html              # Marketing landing page (SustainHub global)
├── pitch-deck.html         # Investor pitch deck (Swiss investor ready)
├── prototype.html          # Interactive demo / prototype
├── vercel.json             # Vercel static deployment config
│
├── platform/               # Full-stack SaaS application
│   ├── frontend/           # Next.js 16 App Router
│   │   └── app/(platform)/ # Dashboard, data entry, reports, satellite, GAR, ESG
│   ├── backend/            # FastAPI
│   │   ├── app/routes/     # auth, emissions, reports, drafts, bulk_upload, validation, users
│   │   ├── app/models/     # Company, User, EmissionRecord, Report, ReportDraft, ShareLink
│   │   └── app/services/   # AI writer, calculation engine, RBAC, validation engine
│   ├── docker-compose.yml  # Local dev: postgres + redis + backend + frontend
│   └── DEVELOPER_BRIEF.md  # Full technical documentation
│
└── raporlar/               # 180+ reference documents (knowledge base)
    ├── [TSRS]              # 13 Turkish company TSRS reports (Akbank, Arçelik, ENKA...)
    ├── [EU]                # CSRD, CSDDD, CBAM, EUDR, EU Taxonomy, SFDR
    ├── [UK]                # UK SRS, Net Zero NHS, UK Net Zero Barometer 2026
    ├── [SASB-JRC]          # 22 EU JRC SASB sector volumes
    ├── [EEA-DATA]          # 8 EU environmental indicator CSV datasets
    ├── [SDG-UN]            # SDG Reports 2019-2025, Turkey NDC, Long-Term Climate Strategy
    ├── [Standards]         # GRI, IFRS S2, IFAC, ISO, ISSB
    └── [Turkey]            # Turkey Sustainable Finance, Green Industrialisation, SCP
```

---

## Platform Features

### Sprint 1 — Core MVP ✅
| Module | Description |
|--------|-------------|
| Auth | JWT login/register with company onboarding |
| Veri Girişi | Scope 1/2/3 data entry (8 sectors, 40+ fields) |
| AI Rapor | Claude claude-sonnet-4-6 TSRS-compliant report generation |
| Dashboard | KPI grid, emission trend chart, compliance gauge, satellite widget |
| Uydu | Physical climate risk map (earthquake, flood, drought, NDVI) |
| GAR | Bank Green Asset Ratio portal (BDDK) |
| ESG | ESG performance dashboard |
| Destekler | Government grants & incentives tracker |

### Sprint 2 — Enterprise Features ✅
| Feature | Description |
|---------|-------------|
| Draft / Auto-Save | `POST /drafts/save`, `GET /drafts/latest` |
| Report Versioning | `GET /reports/{id}/versions` — v1/v2/v3 history |
| RBAC (5 roles) | admin · editor · data_entry · auditor · viewer |
| Approval Workflow | draft → pending → approved → rejected → published |
| Bulk Upload | CSV template + `POST /emissions/bulk-upload` |
| Validation Engine | 8 sector baselines, real-time anomaly detection |
| Share Links | Password-protected, time-limited report sharing |
| User Management | Invite, role assignment, deactivation |
| Test Suite | pytest + pytest-asyncio, SQLite in-memory, 70%+ coverage |

### Sprint 3 — Analysis Engine & Holding Capabilities 🗺️
| Feature | Description |
|---------|-------------|
| **Holding Consolidation** | İştirakler için gelir bazlı emisyon tahmini (EEIO modeli). |
| **Strategic Target Setting** | Holding geneli için konsolide, SBTi uyumlu hedef belirleme. |
| **Advanced Reporting AI** | Kapsam 3 liderliğini vurgular, trend analizi yapar, dinamik güvence beyanı ekler. |
| **EU Taxonomy Engine** | Faaliyetlerin AB Taksonomisi'ne uyumunu 6 çevresel hedefe göre yüzdesel olarak hesaplar. |
| **Analysis API** | Tüm motor yeteneklerini (`/analysis/...`) sunan yeni API endpoint'leri. |

### Roadmap — Phase 3+ 🗺️
| Phase | Features |
|-------|----------|
| 3.5 | Sektör Kıyaslama Radarı, Denetim İzi (Audit Log), Entegrasyon Pazaryeri (SAP, Logo, Oracle). |
| 4.0 | **CSRD Çifte Önemlilik Matrisi**, CBAM Beyanı, **EUDR Tedarik Zinciri Haritası**, PDF/XBRL Çıktısı. |
| 4.5 | **TNFD (Doğa Riskleri) Modülü**, Dijital Ürün Pasaportu, **SROI (Yatırımın Sosyal Getirisi) Motoru**. |
| 5.0 | FLAG Emisyonları (SBTi), GRI/TCFD/ESRS tam kapsam, Stripe ile faturalama. |

---

## Quick Start

```bash
git clone https://github.com/fevzitorun/connective-hub-sustain-platform
cd connective-hub-sustain-platform/platform

# Create .env
cp backend/.env.example backend/.env
# Add: ANTHROPIC_API_KEY=your_key

# Run everything
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## Live Deployments

| URL | Environment |
|-----|-------------|
| sustaincomtr.vercel.app | Marketing site + pitch deck |
| sustaincomtr.vercel.app/pitch | Investor deck |
| sustaincomtr.vercel.app/demo | Platform prototype |

---

## Regulatory Coverage

| Standard | Region | Status |
|----------|--------|--------|
| TSRS 1 & 2 (KGK) | Turkey | ✅ Sprint 1 |
| ISO 14064-1 | Global | ✅ Sprint 1 |
| BDDK GAR | Turkey | ✅ Sprint 1 |
| SBTi / Holding Targets | Global | ✅ Sprint 3 |
| CBAM | EU→Turkey | 🗺️ Phase 4.0 |
| CSRD / ESRS | EU | 🗺️ Phase 4.0 |
| EUDR | EU | 🗺️ Phase 4.0 |
| UK SRS | UK | 🗺️ Phase 3 |
| GRI | Global | 🗺️ Phase 5.0 |
| TCFD | Global | 🗺️ Phase 3 |
| ISSB S1/S2 | Global | 🗺️ Phase 4 |

---

## Investment

- **Stage:** Seed round  
- **Ask:** €400K (pre-money €2M, 16.7% equity)  
- **5-year ARR target:** €40M+  
- **Headquarters:** Dijitalpark Teknokent, İstanbul + Londra

---

## Team

| Role | Person | Location |
|------|--------|----------|
| CEO / Founder | Fevzi Torun | İstanbul |
| Akademik Danışman | Dr. Ayla Torun | Atlas Üniversitesi |
| CTO (Advisor) | Kemal Yıldırım | Londra |

---

*Built by Connective Hub Dijital Teknolojiler Limited*  
*Confidential — not for public distribution*
