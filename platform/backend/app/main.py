from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .models import Company, User, EmissionRecord, Report, ReportDraft, ShareLink  # noqa: F401
from .routes import auth, emissions, reports, dashboard
from .routes import drafts, bulk_upload, validation, users

app = FastAPI(
    title="SustainHub API",
    description="Global Sustainability Intelligence Platform — SustainHub",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://sustain.com.tr",
        "https://sustainhub.ai",
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


@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


@app.get("/health")
async def health():
    return {"status": "ok", "platform": "SustainHub", "version": "2.0.0"}
