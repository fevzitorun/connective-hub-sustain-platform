from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timezone
from ..models import Company, User, Report
from ..routes.payments import PLANS

async def check_limits(db: AsyncSession, company_id: str, action: str):
    """
    Checks if the company's active subscription allows the requested action.
    actions: 'create_user' | 'create_report'
    """
    company = await db.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Şirket bulunamadı")
    
    plan_id = company.plan_type or "free"
    plan = PLANS.get(plan_id, PLANS["free"])
    limits = plan["limits"]

    if action == "create_user":
        user_limit = limits.get("users", 1)
        if user_limit != -1:
            # Count users in company
            result = await db.execute(select(func.count(User.id)).where(User.company_id == company_id))
            user_count = result.scalar() or 0
            if user_count >= user_limit:
                raise HTTPException(
                    status_code=status.HTTP_402_PAYMENT_REQUIRED,
                    detail=f"Abonelik planınız ({plan['name_tr']}) için kullanıcı sınırına ulaştınız ({user_limit} kullanıcı). Lütfen planınızı yükseltin."
                )
                
    elif action == "create_report":
        reports_limit = limits.get("reports_per_month", -1)
        if reports_limit != -1:
            # Count reports created in current calendar month
            now = datetime.now(timezone.utc)
            start_of_month = datetime(now.year, now.month, 1, tzinfo=timezone.utc)
            result = await db.execute(
                select(func.count(Report.id))
                .where(
                    Report.company_id == company_id,
                    Report.created_at >= start_of_month
                )
            )
            report_count = result.scalar() or 0
            if report_count >= reports_limit:
                raise HTTPException(
                    status_code=status.HTTP_402_PAYMENT_REQUIRED,
                    detail=f"Abonelik planınız ({plan['name_tr']}) için aylık rapor sınırına ulaştınız ({reports_limit} rapor). Lütfen planınızı yükseltin."
                )
