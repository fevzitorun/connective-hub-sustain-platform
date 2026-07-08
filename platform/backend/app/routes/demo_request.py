"""Sprint 45 — Demo Request & Contact Form backend."""
from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel, EmailStr
from typing import Optional
import json
import os
from datetime import datetime

router = APIRouter(prefix="/demo-request", tags=["Demo & Contact"])

REQUESTS_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "demo_requests.json")


def _load_requests() -> list:
    os.makedirs(os.path.dirname(REQUESTS_FILE), exist_ok=True)
    if not os.path.exists(REQUESTS_FILE):
        return []
    try:
        with open(REQUESTS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []


def _save_request(entry: dict) -> None:
    requests = _load_requests()
    requests.append(entry)
    with open(REQUESTS_FILE, "w", encoding="utf-8") as f:
        json.dump(requests, f, ensure_ascii=False, indent=2)


async def _send_notification_email(entry: dict) -> None:
    """Send email via Resend if API key is configured."""
    api_key = os.getenv("RESEND_API_KEY", "")
    if not api_key:
        return
    try:
        import httpx
        body_html = f"""
        <h2>Yeni Demo Talebi — SustainHub</h2>
        <table>
          <tr><td><b>Ad Soyad:</b></td><td>{entry['name']}</td></tr>
          <tr><td><b>E-posta:</b></td><td>{entry['email']}</td></tr>
          <tr><td><b>Şirket:</b></td><td>{entry['company']}</td></tr>
          <tr><td><b>Sektör:</b></td><td>{entry['sector']}</td></tr>
          <tr><td><b>Çalışan:</b></td><td>{entry['employees']}</td></tr>
          <tr><td><b>Mesaj:</b></td><td>{entry.get('message', '—')}</td></tr>
          <tr><td><b>Tarih:</b></td><td>{entry['created_at']}</td></tr>
        </table>
        """
        async with httpx.AsyncClient() as client:
            await client.post(
                "https://api.resend.com/emails",
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json={
                    "from": "SustainHub <noreply@sustainhub.online>",
                    "to": [os.getenv("DEMO_NOTIFY_EMAIL", "demo@sustainhub.online")],
                    "reply_to": entry["email"],
                    "subject": f"Demo Talebi: {entry['company']} — {entry['sector']}",
                    "html": body_html,
                },
                timeout=10,
            )
    except Exception:
        pass  # Email failure must not break the API response


class DemoRequestInput(BaseModel):
    name: str
    email: EmailStr
    company: str
    employees: str = "1-50"
    sector: str = "manufacturing"
    phone: Optional[str] = None
    message: Optional[str] = None
    source: Optional[str] = "website"


@router.post("")
async def submit_demo_request(body: DemoRequestInput, background_tasks: BackgroundTasks):
    entry = {
        "name": body.name,
        "email": body.email,
        "company": body.company,
        "employees": body.employees,
        "sector": body.sector,
        "phone": body.phone or "",
        "message": body.message or "",
        "source": body.source or "website",
        "created_at": datetime.utcnow().isoformat() + "Z",
        "status": "new",
    }
    _save_request(entry)
    background_tasks.add_task(_send_notification_email, entry)
    return {
        "success": True,
        "message": "Demo talebiniz alındı. Ekibimiz en geç 1 iş günü içinde sizinle iletişime geçecektir.",
        "ref": f"DEMO-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
    }


@router.get("/admin/list")
async def list_demo_requests():
    """Admin endpoint — demo talep listesi."""
    return {"requests": _load_requests(), "total": len(_load_requests())}
