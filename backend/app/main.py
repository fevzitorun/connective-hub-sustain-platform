from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .models import Company, User, EmissionRecord, Report, ReportDraft  # noqa: F401 — tablo tanımları için import
from .routes import auth, emissions, reports, templates

app = FastAPI(
    title="sustain.com.tr API",
    description="Türkiye'nin ilk AI + uydu destekli sürdürülebilirlik raporlama platformu",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://sustain.com.tr"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(emissions.router)
app.include_router(reports.router)
app.include_router(templates.router)


@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


@app.get("/health")
async def health():
    return {"status": "ok", "platform": "sustain.com.tr"}
