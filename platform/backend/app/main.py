from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .models import Company, User, EmissionRecord, Report, ReportDraft, ShareLink  # noqa: F401
from .models import audit as audit_model  # noqa: F401
from .models import report_template as template_model  # noqa: F401
from .models import materiality as materiality_model  # noqa: F401
from .models import cbam as cbam_model  # noqa: F401
from .models import supply_chain as supply_chain_model  # noqa: F401
from .models import credit_score as credit_score_model  # noqa: F401
from .models import integration as integration_model  # noqa: F401
from .routes import auth, emissions, reports, dashboard, templates
from .routes import drafts, bulk_upload, validation, users
from .routes import benchmarks, audit, cbam, eudr, iso14064, verification
from .routes import payments
from .routes import satellite, materiality, credit_score, scores, suppliers, integration
from .routes import sector, uk_sdr, pcf
from .middleware.rate_limit import RateLimitMiddleware

app = FastAPI(
    title="SustainHub API",
    description="Global Sustainability Intelligence Platform — SustainHub",
    version="2.0.0",
)

app.add_middleware(RateLimitMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://sustainhub.online",
        "https://www.sustainhub.online",
        "https://sustaincomtr.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Core routes
app.include_router(auth.router)
app.include_router(emissions.router)
app.include_router(reports.router)
app.include_router(dashboard.router)

# Sprint 2 routes
app.include_router(drafts.router)
app.include_router(bulk_upload.router, prefix="/api")
app.include_router(validation.router)
app.include_router(users.router)

# Sprint 3 routes
app.include_router(benchmarks.router)
app.include_router(audit.router)
app.include_router(cbam.router)
app.include_router(eudr.router)
app.include_router(templates.router)
app.include_router(iso14064.router)
app.include_router(sector.router)
app.include_router(verification.router)
app.include_router(uk_sdr.router)
app.include_router(pcf.router)

# Sprint 4 routes
app.include_router(payments.router)

# Sprint 5 routes
app.include_router(satellite.router)
app.include_router(materiality.router)
app.include_router(credit_score.router)
app.include_router(scores.router)

# Sprint 6 routes
app.include_router(suppliers.router)

# Sprint 8 routes
app.include_router(integration.router)

# Sprint 15 routes (MACC)
from .routes import macc
app.include_router(macc.router)

# Sprint 9 routes
from .routes import chat
app.include_router(chat.router)

# Sprint 13 routes (Finance Oracle)
from .routes import finance_api
app.include_router(finance_api.router)

# University Gateway routes
from .routes import university, library
app.include_router(university.router)
app.include_router(library.router)

# Sprint 16 — Magic Import
from .routes import import_route
app.include_router(import_route.router)

# Sprint 17 — Global Stats & Admin API
from .routes import stats
app.include_router(stats.router)

# Sprint 18 — ESG Health Check + SROI + Advisory Notes
from .routes import health_check, sroi, advisory
from .models import advisory as advisory_model  # noqa: F401
app.include_router(health_check.router)
app.include_router(sroi.router)
app.include_router(advisory.router)

# Sprint 19 — TCFD Senaryo + Tedarikçi ESG Denetimi
from .routes import tcfd, supplier_audit
app.include_router(tcfd.router)
app.include_router(supplier_audit.router)

# Sprint 24 — GAR Bank Intelligence (PCAF + EU Taxonomy)
from .routes import gar_bank
app.include_router(gar_bank.router)

# Sprint 25 — Sustain Copilot (AI Assistant)
from .routes import copilot
app.include_router(copilot.router)

# Sprint 32 — Sustain Autopilot
from .routes import autopilot
app.include_router(autopilot.router)

# Sprint 33 — CDP + EU Taxonomy
from .routes import cdp, eu_taxonomy, taxonomy, gar, municipality
app.include_router(cdp.router)
app.include_router(eu_taxonomy.router)
app.include_router(taxonomy.router)
app.include_router(gar.router)
app.include_router(municipality.router)

# Sprint 34 — GRI 2021 + TNFD
from .routes import gri, tnfd
app.include_router(gri.router)
app.include_router(tnfd.router)

# Sprint 35 — SBTi + Scope 3
from .routes import sbti, scope3
app.include_router(sbti.router)
app.include_router(scope3.router)

# Sprint 37 — ISSB IFRS S1 + S2
from .routes import issb
app.include_router(issb.router)

# Sprint 38 — TSRS 1 + 2
from .routes import tsrs
app.include_router(tsrs.router)

# Sprint 39 — Report Builder
from .routes import report_builder
app.include_router(report_builder.router)

# Sprint 40 — SASB + UN SDG
from .routes import sasb_sdg
app.include_router(sasb_sdg.router)

# Sprint 41 — Water Footprint + ESRS E2-E5
from .routes import water_esrs
app.include_router(water_esrs.router)

# Sprint 42 — ESG Benchmark (3-series radar)
from .routes import esg_benchmark
app.include_router(esg_benchmark.router)

# Sprint 43 — KOBİ ESG Credit Score
from .routes import kobi_credit_score
app.include_router(kobi_credit_score.router)

# Sprint 45 — Demo Request & Contact Form
from .routes import demo_request
app.include_router(demo_request.router)

# Phase 2 — UK NHS Net Zero
from .routes import nhs
app.include_router(nhs.router)

# Phase 2 — Q2 2027 Grid+
from .routes import grid
app.include_router(grid.router)

# DPP — Dijital Ürün Pasaportu (AB ESPR 2024/1781)
from .routes import dpp
app.include_router(dpp.router)
app.include_router(dpp.public_router)


@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


@app.get("/health")
async def health():
    return {"status": "ok", "platform": "SustainHub", "version": "2.0.0"}
