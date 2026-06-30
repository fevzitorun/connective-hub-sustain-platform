from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone

from ..database import get_db
from ..models import User
from ..models.autopilot import AutopilotRule, AutopilotRun
from ..services.auth import get_current_user
from ..services.autopilot_engine import (
    execute_autopilot_run, get_due_rules, next_run_from,
    DEMO_RULES, DEMO_RUNS, STANDARD_CONFIG, FREQUENCY_LABELS,
)

router = APIRouter(prefix="/api/autopilot", tags=["Sustain Autopilot"])


class RuleCreate(BaseModel):
    name: str = Field(min_length=3, max_length=120)
    rule_type: str = "report"          # report | reminder | digest
    standard: str = "tsrs"             # tsrs | iso14064 | cbam | sfdr | pcf | all
    frequency: str = "monthly"         # weekly | monthly | quarterly | annual
    day_of_month: Optional[int] = None
    notify_days_before: Optional[int] = None
    notify_email: bool = True


# ── CRUD ─────────────────────────────────────────────────────────────────────
@router.get("/rules")
async def list_rules(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(AutopilotRule).where(AutopilotRule.company_id == current_user.company_id)
    res = await db.execute(stmt)
    rules = res.scalars().all()
    return {"rules": [_serialize_rule(r) for r in rules]}


@router.post("/rules")
async def create_rule(
    body: RuleCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    rule = AutopilotRule(
        company_id=current_user.company_id,
        created_by=current_user.id,
        name=body.name,
        rule_type=body.rule_type,
        standard=body.standard,
        frequency=body.frequency,
        day_of_month=body.day_of_month,
        notify_days_before=body.notify_days_before,
        notify_email=body.notify_email,
        next_run_at=next_run_from(body.frequency),
    )
    db.add(rule)
    await db.commit()
    await db.refresh(rule)
    return {"status": "created", "rule": _serialize_rule(rule)}


@router.patch("/rules/{rule_id}/toggle")
async def toggle_rule(
    rule_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    rule = await db.get(AutopilotRule, rule_id)
    if not rule or rule.company_id != current_user.company_id:
        raise HTTPException(status_code=404, detail="Kural bulunamadı")
    rule.is_active = not rule.is_active
    await db.commit()
    return {"rule_id": rule_id, "is_active": rule.is_active}


@router.delete("/rules/{rule_id}")
async def delete_rule(
    rule_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    rule = await db.get(AutopilotRule, rule_id)
    if not rule or rule.company_id != current_user.company_id:
        raise HTTPException(status_code=404, detail="Kural bulunamadı")
    await db.delete(rule)
    await db.commit()
    return {"status": "deleted"}


@router.post("/rules/{rule_id}/run")
async def manual_run(
    rule_id: str,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    rule = await db.get(AutopilotRule, rule_id)
    if not rule or rule.company_id != current_user.company_id:
        raise HTTPException(status_code=404, detail="Kural bulunamadı")
    background_tasks.add_task(
        execute_autopilot_run, db, rule, "manual", current_user.email
    )
    return {"status": "queued", "rule_id": rule_id, "message": "Kural kuyruğa alındı, arka planda çalışıyor."}


# ── Run history ───────────────────────────────────────────────────────────────
@router.get("/runs")
async def list_runs(
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(AutopilotRun)
        .where(AutopilotRun.company_id == current_user.company_id)
        .order_by(AutopilotRun.started_at.desc())
        .limit(limit)
    )
    res = await db.execute(stmt)
    runs = res.scalars().all()
    return {"runs": [_serialize_run(r) for r in runs]}


# ── System cron endpoint (call from external cron / Celery Beat) ─────────────
@router.post("/run-due")
async def run_due_rules(
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Vadesi gelmiş tüm kuralları çalıştır. Harici cron (dakikada/saatte 1) tarafından çağrılır."""
    due = await get_due_rules(db)
    for rule in due:
        background_tasks.add_task(execute_autopilot_run, db, rule, "schedule")
    return {"scheduled": len(due), "rule_ids": [r.id for r in due]}


# ── Demo ──────────────────────────────────────────────────────────────────────
@router.get("/demo")
async def get_demo():
    """Demo kurallar ve çalışma geçmişi."""
    return {
        "rules": DEMO_RULES,
        "runs": DEMO_RUNS,
        "standards": STANDARD_CONFIG,
        "frequency_labels": FREQUENCY_LABELS,
        "stats": {
            "total_rules": len(DEMO_RULES),
            "active_rules": sum(1 for r in DEMO_RULES if r["is_active"]),
            "total_runs": len(DEMO_RUNS),
            "success_rate": round(sum(1 for r in DEMO_RUNS if r["status"] == "success") / len(DEMO_RUNS) * 100),
            "reports_generated": sum(1 for r in DEMO_RUNS if r["status"] == "success"),
        },
    }


# ── Serializers ───────────────────────────────────────────────────────────────
def _serialize_rule(r: AutopilotRule) -> dict:
    cfg = STANDARD_CONFIG.get(r.standard, {})
    return {
        "id": r.id, "name": r.name, "rule_type": r.rule_type,
        "standard": r.standard, "standard_label": cfg.get("label", r.standard),
        "standard_color": cfg.get("color", "#64748b"), "standard_icon": cfg.get("icon", "📋"),
        "frequency": r.frequency, "frequency_label": FREQUENCY_LABELS.get(r.frequency, r.frequency),
        "is_active": r.is_active, "notify_email": r.notify_email,
        "run_count": r.run_count or 0,
        "last_run_at": r.last_run_at.isoformat() if r.last_run_at else None,
        "next_run_at": r.next_run_at.isoformat() if r.next_run_at else None,
        "created_at": r.created_at.isoformat(),
    }


def _serialize_run(r: AutopilotRun) -> dict:
    return {
        "id": r.id, "rule_id": r.rule_id, "status": r.status,
        "triggered_by": r.triggered_by,
        "output_summary": r.output_summary, "error_message": r.error_message,
        "started_at": r.started_at.isoformat() if r.started_at else None,
        "finished_at": r.finished_at.isoformat() if r.finished_at else None,
    }
