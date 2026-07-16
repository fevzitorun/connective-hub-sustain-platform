"""
Admin kullanıcı seed scripti.

Herhangi bir ortamda ilk admin hesabını oluşturmak/yükseltmek için. Idempotent:
kullanıcı varsa admin rolüne yükseltir (ve şifreyi günceller), yoksa bir şirket
+ admin kullanıcı oluşturur.

Kullanım (backend/ dizininden):
    .venv/bin/python scripts/seed_admin.py --email admin@sustainhub.online --password 'GucluParola!' --name 'Yönetici' --company 'SustainHub'

Env fallback (CI/prod için): SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD.
"""
import asyncio
import argparse
import os
import sys
from pathlib import Path

# Script backend kökünden çalıştırılabilsin diye app'i import yoluna ekle
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import select  # noqa: E402
from app.database import AsyncSessionLocal  # noqa: E402
from app.models import User, Company  # noqa: E402
from app.services.auth import hash_password  # noqa: E402


async def seed(email: str, password: str, name: str, company_name: str) -> None:
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()

        if user:
            user.role = "admin"
            user.hashed_password = hash_password(password)
            await db.commit()
            print(f"✅ Mevcut kullanıcı admin rolüne yükseltildi: {email}")
            return

        company = Company(name=company_name, sector="technology")
        db.add(company)
        await db.flush()

        user = User(
            email=email,
            name=name,
            hashed_password=hash_password(password),
            company_id=company.id,
            role="admin",
        )
        db.add(user)
        await db.commit()
        print(f"✅ Admin oluşturuldu: {email}  (şirket: {company_name})")


def main() -> None:
    p = argparse.ArgumentParser(description="SustainHub admin seed")
    p.add_argument("--email", default=os.getenv("SEED_ADMIN_EMAIL"))
    p.add_argument("--password", default=os.getenv("SEED_ADMIN_PASSWORD"))
    p.add_argument("--name", default="Yönetici")
    p.add_argument("--company", default="SustainHub")
    args = p.parse_args()

    if not args.email or not args.password:
        print(
            "HATA: --email ve --password gerekli (veya SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD env).",
            file=sys.stderr,
        )
        sys.exit(1)

    asyncio.run(seed(args.email, args.password, args.name, args.company))


if __name__ == "__main__":
    main()
