import pytest
import uuid
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import Company, User, EmissionRecord

@pytest.mark.asyncio
async def test_tenant_isolation_regular_user(client: AsyncClient, db: AsyncSession):
    """Standart bir kullanıcının başka bir şirketin verilerine erişmesini engelle (403)."""
    # 1. Şirket A ve Kullanıcı A oluştur
    resp_a = await client.post("/auth/register", json={
        "email": f"usera-{uuid.uuid4().hex[:8]}@sustainhub.ai",
        "password": "Password123!",
        "name": "Kullanıcı A",
        "company_name": "Şirket A",
        "sector": "manufacturing",
    })
    assert resp_a.status_code == 201
    token_a = resp_a.json()["access_token"]
    company_a_id = resp_a.json()["user"]["company_id"]

    # 2. Şirket B ve Kullanıcı B oluştur
    resp_b = await client.post("/auth/register", json={
        "email": f"userb-{uuid.uuid4().hex[:8]}@sustainhub.ai",
        "password": "Password123!",
        "name": "Kullanıcı B",
        "company_name": "Şirket B",
        "sector": "manufacturing",
    })
    assert resp_b.status_code == 201
    company_b_id = resp_b.json()["user"]["company_id"]

    # 3. Kullanıcı A olarak giriş yap
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # 4. Kullanıcı A, Şirket B bağlamıyla (X-Tenant-ID) istek atmayı denesin
    headers_a_with_b = {
        "Authorization": f"Bearer {token_a}",
        "X-Tenant-ID": company_b_id
    }
    
    # Emisyon listesi çekmeye çalışsın
    get_resp = await client.get("/emissions", headers=headers_a_with_b)
    # 403 Forbidden dönmeli
    assert get_resp.status_code == 403
    assert "KVKK Veri İzolasyon İhlali" in get_resp.json()["detail"]

    # Emisyon verisi eklemeye çalışsın
    post_resp = await client.post("/emissions", headers=headers_a_with_b, json={
        "year": 2024,
        "electricity_kwh": 5000
    })
    assert post_resp.status_code == 403
    assert "KVKK Veri İzolasyon İhlali" in post_resp.json()["detail"]


@pytest.mark.asyncio
async def test_tenant_access_consultant(client: AsyncClient, db: AsyncSession):
    """Danışmanın yetkilendirilmiş şirket verilerine erişebildiğini (200), diğerlerine erişemediğini (403) doğrula."""
    # 1. Müşteri Şirket A'yı ve Danışman Şirketini oluştur
    resp_client_a = await client.post("/auth/register", json={
        "email": f"clienta-{uuid.uuid4().hex[:8]}@sustainhub.ai",
        "password": "Password123!",
        "name": "Müşteri A Yetkilisi",
        "company_name": "Müşteri Şirket A",
        "sector": "manufacturing",
    })
    assert resp_client_a.status_code == 201
    company_client_a_id = resp_client_a.json()["user"]["company_id"]

    # 2. Yetkisiz Şirket B'yi oluştur
    resp_client_b = await client.post("/auth/register", json={
        "email": f"clientb-{uuid.uuid4().hex[:8]}@sustainhub.ai",
        "password": "Password123!",
        "name": "Müşteri B Yetkilisi",
        "company_name": "Yetkisiz Şirket B",
        "sector": "manufacturing",
    })
    assert resp_client_b.status_code == 201
    company_client_b_id = resp_client_b.json()["user"]["company_id"]

    # 3. Danışman Kullanıcısını oluştur
    resp_consultant = await client.post("/auth/register", json={
        "email": f"consultant-{uuid.uuid4().hex[:8]}@sustainhub.ai",
        "password": "Password123!",
        "name": "Danışman Ahmet",
        "company_name": "Ahmet Yeşil Danışmanlık",
        "sector": "technology",
    })
    assert resp_consultant.status_code == 201
    token_consultant = resp_consultant.json()["access_token"]
    consultant_user_id = resp_consultant.json()["user"]["id"]

    # 4. Danışmanın yetkilendirilmiş listesine Müşteri A'yı ekle
    # Veritabanında güncelle
    result = await db.execute(select(User).where(User.id == consultant_user_id))
    user = result.scalar_one()
    user.managed_company_ids = company_client_a_id
    await db.commit()

    # 5. Danışman, yetkilendirilmiş Müşteri A verilerine erişmeyi denesin (X-Tenant-ID)
    headers_consultant_a = {
        "Authorization": f"Bearer {token_consultant}",
        "X-Tenant-ID": company_client_a_id
    }
    
    # Emisyon verisi ekleyebilmeli
    post_resp = await client.post("/emissions", headers=headers_consultant_a, json={
        "year": 2024,
        "electricity_kwh": 12000
    })
    assert post_resp.status_code == 201
    
    # Emisyon listesini görebilmeli
    list_resp = await client.get("/emissions", headers=headers_consultant_a)
    assert list_resp.status_code == 200
    assert len(list_resp.json()) == 1
    assert list_resp.json()[0]["year"] == 2024

    # 6. Danışman, yetkilendirilmemiş Şirket B verilerine erişmeyi denesin
    headers_consultant_b = {
        "Authorization": f"Bearer {token_consultant}",
        "X-Tenant-ID": company_client_b_id
    }
    
    get_resp = await client.get("/emissions", headers=headers_consultant_b)
    # 403 Forbidden dönmeli
    assert get_resp.status_code == 403
    assert "KVKK Veri İzolasyon İhlali" in get_resp.json()["detail"]
