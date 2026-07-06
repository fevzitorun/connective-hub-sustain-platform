import pytest
import uuid
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import Company, User, EmissionRecord, Report

@pytest.mark.asyncio
async def test_list_plans(client: AsyncClient):
    """Abonelik planları listesinde ksru planının da döndüğünü doğrula."""
    response = await client.get("/payments/plans")
    assert response.status_code == 200
    data = response.json()
    assert "plans" in data
    plans = {p["id"]: p for p in data["plans"]}
    
    assert "free" in plans
    assert "ksru" in plans
    assert plans["ksru"]["price_yearly"] == 120000
    assert "10 aktif danışan şirket portföyü" in plans["ksru"]["features"]

@pytest.mark.asyncio
async def test_user_limits_enforced(admin_client: AsyncClient, db: AsyncSession):
    """Free plandaki şirket için kullanıcı davet limitinin (maks 1) aşılamayacağını doğrula."""
    # admin_client ile giriş yaptığımızda varsayılan şirket planı 'free'dir.
    # admin_client kaydolurken 1 kullanıcı oluşmuştur. 2. kullanıcıyı eklemeye çalışalım.
    response = await admin_client.post("/users/invite", json={
        "email": f"invited-{uuid.uuid4().hex[:8]}@sustainhub.ai",
        "name": "Davetli Kullanıcı",
        "role": "editor",
        "temp_password": "TempPassword123!"
    })
    
    # 402 Payment Required dönmeli
    assert response.status_code == 402
    assert "kullanıcı sınırına ulaştınız" in response.json()["detail"]

@pytest.mark.asyncio
async def test_report_limits_enforced(admin_client: AsyncClient, db: AsyncSession):
    """Free plandaki şirket için aylık rapor limitinin (maks 3) aşılamayacağını doğrula."""
    # admin_client kullanıcısını ve şirketini al
    # Emisyon verisi ekle
    em_resp = await admin_client.post("/emissions", json={
        "year": 2024,
        "natural_gas_m3": 1000,
        "diesel_liters": 500,
        "electricity_kwh": 5000,
        "electricity_source": "location",
        "business_travel_flight_km": 100,
        "employee_commute_km": 200,
        "waste_tons": 2,
        "water_m3": 10
    })
    assert em_resp.status_code == 200
    emission_id = em_resp.json()["id"]

    # 3 adet rapor oluştur
    for i in range(3):
        # mock'lamak yerine doğrudan DB'ye ekleyelim ki zaman kaybetmeyelim
        # ama generate route'unu test etmemiz gerekiyor, bu yüzden route üzerinden çağırıp DB'ye kaydedelim
        # generate route'u async task çalıştırır.
        resp = await admin_client.post("/reports/generate", json={
            "emission_id": emission_id,
            "standard": "tsrs",
            "language": "tr",
            "assurance_firm": "PwC"
        })
        assert resp.status_code == 202

    # 4. raporu oluşturmaya çalış: limit engeline takılmalı
    resp = await admin_client.post("/reports/generate", json={
        "emission_id": emission_id,
        "standard": "tsrs",
        "language": "tr",
        "assurance_firm": "PwC"
    })
    assert resp.status_code == 402
    assert "aylık rapor sınırına ulaştınız" in resp.json()["detail"]
