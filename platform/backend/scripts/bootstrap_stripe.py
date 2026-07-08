"""
Stripe Product/Price bootstrap — payments.py'deki PLANS tanımına göre
Stripe Dashboard'da (test modunda) ürün + fiyat oluşturur ve gerçek Price ID'lerini basar.

Kullanım:
    export STRIPE_SECRET_KEY=sk_test_...   (bu proje için ayrılmış AYRI bir test key olmalı)
    python scripts/bootstrap_stripe.py

Çıktıyı app/routes/payments.py içindeki PLANS sözlüğünde ilgili
"stripe_price_monthly" / "stripe_price_yearly" alanlarına elle işle
(script sadece oluşturur ve listeler; kodu otomatik değiştirmez).
"""
import os
import sys

try:
    import stripe
except ImportError:
    sys.exit("stripe paketi kurulu değil: pip install stripe==11.3.0")

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY", "")
if not stripe.api_key:
    sys.exit("STRIPE_SECRET_KEY ortam değişkeni gerekli (sk_test_... ile başlamalı).")
if not stripe.api_key.startswith("sk_test_"):
    sys.exit("Güvenlik: bu script yalnızca sk_test_ ile başlayan test key kabul eder.")

# payments.py > PLANS ile birebir aynı sırada, TRY cinsinden (kuruş = *100)
PLANS = [
    {"id": "starter",    "name": "Starter",      "monthly": 2750,  "yearly": 30000},
    {"id": "pro",        "name": "Professional", "monthly": 6600,  "yearly": 72000},
    {"id": "enterprise", "name": "Enterprise",   "monthly": 16500, "yearly": 180000},
    {"id": "ksru",       "name": "KSRU Partner", "monthly": 10000, "yearly": 120000},
]

results = {}

for plan in PLANS:
    product = stripe.Product.create(
        name=f"SustainHub {plan['name']}",
        metadata={"plan_id": plan["id"], "platform": "sustainhub"},
    )
    price_monthly = stripe.Price.create(
        product=product.id,
        currency="try",
        unit_amount=plan["monthly"] * 100,
        recurring={"interval": "month"},
    )
    price_yearly = stripe.Price.create(
        product=product.id,
        currency="try",
        unit_amount=plan["yearly"] * 100,
        recurring={"interval": "year"},
    )
    results[plan["id"]] = {
        "product_id": product.id,
        "stripe_price_monthly": price_monthly.id,
        "stripe_price_yearly": price_yearly.id,
    }
    print(f"✓ {plan['name']}: monthly={price_monthly.id}  yearly={price_yearly.id}")

print("\n--- payments.py PLANS içine işlenecek değerler ---")
for plan_id, r in results.items():
    print(f'  "{plan_id}": stripe_price_monthly="{r["stripe_price_monthly"]}", stripe_price_yearly="{r["stripe_price_yearly"]}"')
