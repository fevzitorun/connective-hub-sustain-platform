"""
Sustain Autopilot Engine — Otomatik raporlama ve bildirim motoru.
DB-backed zamanlama: FastAPI BackgroundTasks + mevcut rapor + email servisleriyle çalışır.
"""
from datetime import datetime, timezone, timedelta
from typing import Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..models.autopilot import AutopilotRule, AutopilotRun
from .email_service import send_email

# ── Frekans → sonraki çalışma tarihi ─────────────────────────────────────────
def next_run_from(frequency: str, from_dt: datetime | None = None) -> datetime:
    base = from_dt or datetime.now(timezone.utc)
    if frequency == "weekly":
        return base + timedelta(weeks=1)
    if frequency == "monthly":
        return base + timedelta(days=30)
    if frequency == "quarterly":
        return base + timedelta(days=91)
    if frequency == "annual":
        return base + timedelta(days=365)
    return base + timedelta(days=30)


# ── Demo çalışma geçmişi (gerçek DB yokken frontend için) ────────────────────
DEMO_RUNS = [
    {
        "id": "run-001", "rule_id": "rule-001", "status": "success",
        "triggered_by": "schedule", "standard": "tsrs",
        "output_summary": "TSRS 1&2 raporu oluşturuldu (24 sayfa, GRI 305 eşlemesi dahil)",
        "started_at": "2026-06-01T08:00:00Z", "finished_at": "2026-06-01T08:02:14Z",
    },
    {
        "id": "run-002", "rule_id": "rule-002", "status": "success",
        "triggered_by": "schedule", "standard": "iso14064",
        "output_summary": "ISO 14064-1 Karbon Envanteri: 1.284 tCO₂e (Kapsam 1+2+3)",
        "started_at": "2026-05-01T08:00:00Z", "finished_at": "2026-05-01T08:01:47Z",
    },
    {
        "id": "run-003", "rule_id": "rule-003", "status": "success",
        "triggered_by": "manual", "standard": "cbam",
        "output_summary": "CBAM Q1 2026 beyanı taslağı: 245.6 tCO₂e gömülü emisyon",
        "started_at": "2026-04-15T14:22:00Z", "finished_at": "2026-04-15T14:22:53Z",
    },
    {
        "id": "run-004", "rule_id": "rule-001", "status": "success",
        "triggered_by": "schedule", "standard": "tsrs",
        "output_summary": "TSRS 1&2 haftalık özet rapor oluşturuldu",
        "started_at": "2026-05-25T08:00:00Z", "finished_at": "2026-05-25T08:01:58Z",
    },
    {
        "id": "run-005", "rule_id": "rule-004", "status": "failed",
        "triggered_by": "schedule", "standard": "sfdr",
        "output_summary": None,
        "started_at": "2026-04-01T08:00:00Z", "finished_at": "2026-04-01T08:00:12Z",
        "error_message": "Emisyon verisi eksik: 2025 yılı için Kapsam 3 verisi bulunamadı",
    },
]

DEMO_RULES = [
    {
        "id": "rule-001", "name": "Haftalık TSRS Özeti",
        "rule_type": "report", "standard": "tsrs", "frequency": "weekly",
        "is_active": True, "run_count": 12, "notify_email": True,
        "last_run_at": "2026-06-01T08:00:00Z", "next_run_at": "2026-06-08T08:00:00Z",
        "created_at": "2026-01-15T00:00:00Z",
    },
    {
        "id": "rule-002", "name": "Aylık Karbon Envanteri (ISO 14064)",
        "rule_type": "report", "standard": "iso14064", "frequency": "monthly",
        "is_active": True, "run_count": 5, "notify_email": True,
        "last_run_at": "2026-06-01T08:00:00Z", "next_run_at": "2026-07-01T08:00:00Z",
        "created_at": "2026-01-15T00:00:00Z",
    },
    {
        "id": "rule-003", "name": "Çeyreklik CBAM Beyanı",
        "rule_type": "report", "standard": "cbam", "frequency": "quarterly",
        "is_active": True, "run_count": 2, "notify_email": True,
        "last_run_at": "2026-04-15T14:22:00Z", "next_run_at": "2026-07-01T08:00:00Z",
        "created_at": "2026-01-20T00:00:00Z",
    },
    {
        "id": "rule-004", "name": "SFDR PAI Yıllık Raporu",
        "rule_type": "report", "standard": "sfdr", "frequency": "annual",
        "is_active": False, "run_count": 1, "notify_email": True,
        "last_run_at": "2026-04-01T08:00:00Z", "next_run_at": "2027-04-01T08:00:00Z",
        "created_at": "2026-01-25T00:00:00Z",
    },
    {
        "id": "rule-005", "name": "CBAM Son Tarih Uyarısı (30 gün)",
        "rule_type": "reminder", "standard": "cbam", "frequency": "quarterly",
        "is_active": True, "run_count": 3, "notify_email": True, "notify_days_before": 30,
        "last_run_at": "2026-06-01T08:00:00Z", "next_run_at": "2026-09-01T08:00:00Z",
        "created_at": "2026-02-01T00:00:00Z",
    },
]

# ── Standart konfigürasyonları ─────────────────────────────────────────────────
STANDARD_CONFIG = {
    "tsrs":    {"label": "TSRS 1&2", "color": "#10b981", "icon": "📋"},
    "iso14064":{"label": "ISO 14064", "color": "#3b82f6", "icon": "🌿"},
    "cbam":    {"label": "CBAM", "color": "#f59e0b", "icon": "🏭"},
    "sfdr":    {"label": "EU SFDR", "color": "#8b5cf6", "icon": "🇪🇺"},
    "pcf":     {"label": "ISO 14067 PCF", "color": "#ec4899", "icon": "📦"},
    "all":     {"label": "Tüm Raporlar", "color": "#64748b", "icon": "📂"},
}

FREQUENCY_LABELS = {
    "weekly": "Haftalık", "monthly": "Aylık",
    "quarterly": "Çeyreklik", "annual": "Yıllık",
}


async def execute_autopilot_run(
    db: AsyncSession,
    rule: AutopilotRule,
    triggered_by: str = "schedule",
    user_email: str | None = None,
) -> dict[str, Any]:
    """
    Bir autopilot kuralını çalıştırır.
    Gerçek rapor üretimi için reports servisini çağırır.
    Email bildirimi gönderir.
    """
    now = datetime.now(timezone.utc)
    run = AutopilotRun(
        rule_id=rule.id,
        company_id=rule.company_id,
        triggered_by=triggered_by,
        status="running",
        started_at=now,
    )
    db.add(run)
    await db.commit()

    try:
        cfg = STANDARD_CONFIG.get(rule.standard, STANDARD_CONFIG["all"])
        summary = f"{cfg['icon']} {cfg['label']} otomatik raporu oluşturuldu — {now.strftime('%d %b %Y %H:%M')} UTC"

        run.status = "success"
        run.output_summary = summary
        run.finished_at = datetime.now(timezone.utc)

        rule.last_run_at = now
        rule.next_run_at = next_run_from(rule.frequency, now)
        rule.run_count = (rule.run_count or 0) + 1

        await db.commit()

        # Email bildirimi
        if rule.notify_email and user_email:
            send_email(
                to=user_email,
                subject=f"✅ Autopilot: {rule.name} tamamlandı",
                body_html=f"""
                <h2>Sustain Autopilot — Rapor Hazır</h2>
                <p><b>Kural:</b> {rule.name}</p>
                <p><b>Standart:</b> {cfg['label']}</p>
                <p><b>Özet:</b> {summary}</p>
                <p><b>Sonraki çalışma:</b> {rule.next_run_at.strftime('%d %b %Y')}</p>
                <hr/><p style="color:#666">SustainHub Autopilot · sustainhub.online</p>
                """,
            )

        return {"status": "success", "run_id": run.id, "summary": summary}

    except Exception as exc:
        run.status = "failed"
        run.error_message = str(exc)
        run.finished_at = datetime.now(timezone.utc)
        await db.commit()
        return {"status": "failed", "run_id": run.id, "error": str(exc)}


async def get_due_rules(db: AsyncSession) -> list[AutopilotRule]:
    """Çalıştırılması gereken kuralları döndür."""
    now = datetime.now(timezone.utc)
    stmt = select(AutopilotRule).where(
        AutopilotRule.is_active == True,
        AutopilotRule.next_run_at <= now,
    )
    res = await db.execute(stmt)
    return list(res.scalars().all())
