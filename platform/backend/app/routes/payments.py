"""Sprint 4: Stripe ödeme entegrasyonu — abonelik planları, checkout, webhook."""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
from ..database import get_db
from ..models import Company, User
from ..config import settings
from .auth import get_current_user

router = APIRouter(prefix="/payments", tags=["payments"])

PLANS = {
    "free": {
        "id": "free",
        "name": "Free",
        "name_tr": "Ücretsiz",
        "price_monthly": 0,
        "price_yearly": 0,
        "currency": "TRY",
        "features": [
            "1 kullanıcı",
            "3 rapor/ay",
            "TSRS 1 & 2 şablonları",
            "50 req/dk API limiti",
            "E-posta desteği",
        ],
        "limits": {"users": 1, "reports_per_month": 3, "api_req_per_min": 50},
        "stripe_price_monthly": None,
        "stripe_price_yearly": None,
        "badge": None,
    },
    "starter": {
        "id": "starter",
        "name": "Starter",
        "name_tr": "Başlangıç",
        "price_monthly": 2750,
        "price_yearly": 30000,
        "currency": "TRY",
        "features": [
            "1 kullanıcı",
            "Sınırsız rapor",
            "Kapsam 1 & 2 takibi",
            "Temel GRI Core şablonu",
            "TSRS 1 & 2 çıktısı",
            "100 req/dk API limiti",
            "E-posta desteği",
        ],
        "limits": {"users": 1, "reports_per_month": -1, "api_req_per_min": 100},
        "stripe_price_monthly": "price_starter_monthly",
        "stripe_price_yearly": "price_starter_yearly",
        "badge": None,
    },
    "pro": {
        "id": "pro",
        "name": "Professional",
        "name_tr": "Profesyonel",
        "price_monthly": 6600,
        "price_yearly": 72000,
        "currency": "TRY",
        "features": [
            "5 kullanıcı",
            "Sınırsız rapor",
            "Tüm framework'ler (TSRS, ISSB, GRI, CSRD, CDP)",
            "AI Copilot & Magic Import",
            "XBRL / KGK dijital beyan",
            "Benchmark & EEA verileri",
            "200 req/dk API limiti",
            "Öncelikli destek",
        ],
        "limits": {"users": 5, "reports_per_month": -1, "api_req_per_min": 200},
        "stripe_price_monthly": "price_pro_monthly",
        "stripe_price_yearly": "price_pro_yearly",
        "badge": "Popüler",
    },
    "enterprise": {
        "id": "enterprise",
        "name": "Enterprise",
        "name_tr": "Kurumsal",
        "price_monthly": 16500,
        "price_yearly": 180000,
        "currency": "TRY",
        "features": [
            "Sınırsız kullanıcı",
            "Sınırsız rapor",
            "Bank GAR Suite (PCAF, KOBİ Kredi)",
            "White-label & özel marka",
            "EUDR tedarikçi risk haritası",
            "Uydu iklim verileri (Copernicus)",
            "1000 req/dk API limiti",
            "SLA & özel destek",
            "Çoklu tenant (RLS) desteği",
        ],
        "limits": {"users": -1, "reports_per_month": -1, "api_req_per_min": 1000},
        "stripe_price_monthly": "price_enterprise_monthly",
        "stripe_price_yearly": "price_enterprise_yearly",
        "badge": "En İyi Değer",
    },
}


class CheckoutRequest(BaseModel):
    plan_id: str
    billing: str = "monthly"  # "monthly" | "yearly"
    success_url: Optional[str] = None
    cancel_url: Optional[str] = None


@router.get("/plans")
async def list_plans():
    """Tüm abonelik planlarını listele."""
    return {"plans": list(PLANS.values())}


@router.get("/plans/{plan_id}")
async def get_plan(plan_id: str):
    """Tek plan detayı."""
    plan = PLANS.get(plan_id)
    if not plan:
        raise HTTPException(404, "Plan bulunamadı")
    return plan


@router.post("/create-checkout-session")
async def create_checkout_session(
    body: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Stripe Checkout oturumu oluştur."""
    if body.plan_id not in PLANS:
        raise HTTPException(400, "Geçersiz plan")
    plan = PLANS[body.plan_id]
    if plan["price_monthly"] == 0:
        raise HTTPException(400, "Ücretsiz plan için ödeme gerekmiyor")

    stripe_key = getattr(settings, "stripe_secret_key", "")
    if not stripe_key:
        # Stripe key yoksa simüle et
        return {
            "checkout_url": f"https://checkout.stripe.com/demo?plan={body.plan_id}&billing={body.billing}",
            "session_id": "cs_demo_" + body.plan_id,
            "mode": "demo",
        }

    try:
        import stripe  # type: ignore
        stripe.api_key = stripe_key

        price_key = f"stripe_price_{body.billing}"
        price_id = plan.get(price_key)
        if not price_id:
            raise HTTPException(400, "Bu plan/dönem kombinasyonu mevcut değil")

        company = await db.get(Company, current_user.company_id)
        customer_id = getattr(company, "stripe_customer_id", None)

        if not customer_id:
            customer = stripe.Customer.create(
                email=current_user.email,
                name=company.name if company else current_user.name,
                metadata={"company_id": current_user.company_id, "platform": "sustainhub"},
            )
            customer_id = customer.id
            if company:
                company.stripe_customer_id = customer_id
                await db.commit()

        session = stripe.checkout.Session.create(
            customer=customer_id,
            mode="subscription",
            line_items=[{"price": price_id, "quantity": 1}],
            success_url=body.success_url or "https://sustainhub.online/abonelik?success=1",
            cancel_url=body.cancel_url or "https://sustainhub.online/abonelik?cancel=1",
            metadata={"company_id": current_user.company_id, "plan_id": body.plan_id},
        )

        return {"checkout_url": session.url, "session_id": session.id}

    except Exception as e:
        raise HTTPException(500, f"Stripe hatası: {str(e)}")


@router.post("/webhook")
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """Stripe webhook — plan güncellemelerini işle."""
    stripe_key = getattr(settings, "stripe_secret_key", "")
    webhook_secret = getattr(settings, "stripe_webhook_secret", "")

    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")

    if not stripe_key:
        return {"status": "demo_mode"}

    try:
        import stripe  # type: ignore
        stripe.api_key = stripe_key

        event = stripe.Webhook.construct_event(payload, sig, webhook_secret) if webhook_secret else stripe.Event.construct_from(
            {"type": "checkout.session.completed", "data": {"object": {}}}, stripe_key
        )
    except Exception as e:
        raise HTTPException(400, f"Webhook hatası: {str(e)}")

    event_type = event["type"]

    if event_type == "checkout.session.completed":
        session_obj = event["data"]["object"]
        company_id = session_obj.get("metadata", {}).get("company_id")
        plan_id = session_obj.get("metadata", {}).get("plan_id", "pro")
        stripe_sub_id = session_obj.get("subscription")

        if company_id:
            company = await db.get(Company, company_id)
            if company:
                company.plan_type = plan_id
                if stripe_sub_id:
                    company.stripe_subscription_id = stripe_sub_id
                await db.commit()

    elif event_type in ("customer.subscription.deleted", "customer.subscription.paused"):
        sub = event["data"]["object"]
        customer_id = sub.get("customer")
        result = await db.execute(select(Company).where(Company.stripe_customer_id == customer_id))
        company = result.scalar_one_or_none()
        if company:
            company.plan_type = "free"
            await db.commit()

    return {"status": "ok", "event": event_type}


@router.get("/subscription")
async def get_subscription(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mevcut abonelik durumunu getir."""
    company = await db.get(Company, current_user.company_id)
    plan_id = company.plan_type if company else "free"
    plan = PLANS.get(plan_id, PLANS["free"])
    return {
        "plan": plan,
        "stripe_customer_id": getattr(company, "stripe_customer_id", None),
        "stripe_subscription_id": getattr(company, "stripe_subscription_id", None),
    }


@router.post("/portal")
async def create_portal_session(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Stripe müşteri portalı oturumu oluştur (plan yönetimi)."""
    stripe_key = getattr(settings, "stripe_secret_key", "")
    if not stripe_key:
        return {"portal_url": "https://billing.stripe.com/demo"}

    company = await db.get(Company, current_user.company_id)
    customer_id = getattr(company, "stripe_customer_id", None)
    if not customer_id:
        raise HTTPException(400, "Aktif abonelik bulunamadı")

    try:
        import stripe  # type: ignore
        stripe.api_key = stripe_key
        session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url="https://sustainhub.online/abonelik",
        )
        return {"portal_url": session.url}
    except Exception as e:
        raise HTTPException(500, f"Portal hatası: {str(e)}")
