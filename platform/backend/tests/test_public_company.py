"""
Herkese Açık Şirket Profili testleri (/companies/me/public-profile + /api/public/companies/{slug}).
"""
import uuid
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.models import EmissionRecord, Report, User


async def _make_second_admin_client(db: AsyncSession) -> AsyncClient:
    """`client`/`admin_client` fixture'larıyla AYNI AsyncClient nesnesini paylaşmaz —
    onu mutasyona uğratmak birinci admin'in token'ını sessizce ezerdi. Bağımsız bir
    ikinci admin+şirket kaydeder, kendi AsyncClient örneğinde auth header'ı taşır."""
    second_client = AsyncClient(transport=ASGITransport(app=app), base_url="http://test")
    unique_email = f"admin2-{uuid.uuid4().hex[:8]}@sustainhub.ai"
    resp = await second_client.post("/auth/register", json={
        "email": unique_email,
        "password": "Admin1234!",
        "name": "İkinci Admin",
        "company_name": "İkinci Şirket A.Ş.",
        "sector": "manufacturing",
        "employee_count": 100,
    })
    assert resp.status_code == 201, resp.text
    token = resp.json()["access_token"]
    user_id = resp.json()["user"]["id"]

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one()
    user.role = "admin"
    await db.commit()

    second_client.headers["Authorization"] = f"Bearer {token}"
    return second_client


@pytest.mark.asyncio
async def test_update_public_profile_requires_auth(client: AsyncClient):
    response = await client.patch(
        "/companies/me/public-profile", json={"slug": "test-co", "enabled": True}
    )
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_update_public_profile_requires_admin(auth_client: AsyncClient):
    """editor rolü admin gerektiren endpoint'e erişemez."""
    response = await auth_client.patch(
        "/companies/me/public-profile", json={"slug": "test-co", "enabled": True}
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_update_public_profile_rejects_invalid_slug(admin_client: AsyncClient):
    response = await admin_client.patch(
        "/companies/me/public-profile", json={"slug": "Geçersiz Slug!", "enabled": True}
    )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_update_and_fetch_public_profile(admin_client: AsyncClient):
    """Admin slug belirleyip etkinleştirdikten sonra profil herkese açık GET ile görünür olmalı."""
    patch_resp = await admin_client.patch(
        "/companies/me/public-profile", json={"slug": "acme-test-co", "enabled": True}
    )
    assert patch_resp.status_code == 200, patch_resp.text
    assert patch_resp.json() == {"slug": "acme-test-co", "public_profile_enabled": True}

    get_resp = await admin_client.get("/api/public/companies/acme-test-co")
    assert get_resp.status_code == 200
    data = get_resp.json()
    assert data["name"]
    # Henüz rapor/emisyon verisi yok → dürüst boş durum, sahte veri değil
    assert data["sustainScore"]["grade"] is None
    assert data["emissionsReducedTco2e"] is None
    assert data["verification"]["verified"] is False
    assert data["badges"] == []


@pytest.mark.asyncio
async def test_public_profile_hidden_until_enabled(admin_client: AsyncClient):
    await admin_client.patch(
        "/companies/me/public-profile", json={"slug": "gizli-sirket", "enabled": False}
    )
    resp = await admin_client.get("/api/public/companies/gizli-sirket")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_public_profile_unknown_slug_404(client: AsyncClient):
    resp = await client.get("/api/public/companies/hic-boyle-bir-sirket-yok")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_public_profile_slug_taken_by_other_company(
    admin_client: AsyncClient, db: AsyncSession
):
    first = await admin_client.patch(
        "/companies/me/public-profile", json={"slug": "paylasilan-slug", "enabled": True}
    )
    assert first.status_code == 200

    second_admin = await _make_second_admin_client(db)
    try:
        conflict = await second_admin.patch(
            "/companies/me/public-profile", json={"slug": "paylasilan-slug", "enabled": True}
        )
        assert conflict.status_code == 409
    finally:
        await second_admin.aclose()

    # Aynı şirket kendi slug'ını tekrar aynı değerle güncelleyebilmeli (çakışma sayılmaz)
    same_company_again = await admin_client.patch(
        "/companies/me/public-profile", json={"slug": "paylasilan-slug", "enabled": True}
    )
    assert same_company_again.status_code == 200


@pytest.mark.asyncio
async def test_public_profile_reflects_real_emission_and_report_data(
    admin_client: AsyncClient, db: AsyncSession
):
    """Sahte veri değil — gerçek DB kayıtlarından hesaplanan alanlar doğru dönmeli."""
    me = await admin_client.get("/auth/me")
    company_id = me.json()["company_id"]

    old_emission = EmissionRecord(
        company_id=company_id, year=2020,
        scope1_co2e=1000, scope2_location_co2e=500, scope3_co2e=200,
        renewable_ratio=0.2,
    )
    new_emission = EmissionRecord(
        company_id=company_id, year=2024,
        scope1_co2e=400, scope2_location_co2e=100, scope3_co2e=50,
        renewable_ratio=1.0,
    )
    db.add_all([old_emission, new_emission])

    report = Report(
        company_id=company_id, standard="tsrs", status="published",
        compliance_score=88, compliance_grade="A", assurance_firm="Bağımsız Denetim A.Ş.",
    )
    db.add(report)
    await db.commit()

    await admin_client.patch(
        "/companies/me/public-profile", json={"slug": "yesil-sirket", "enabled": True}
    )
    resp = await admin_client.get("/api/public/companies/yesil-sirket")
    assert resp.status_code == 200
    data = resp.json()

    assert data["sustainScore"]["grade"] == "A"
    assert data["sustainScore"]["score"] == 88
    assert data["emissionsReducedTco2e"] == 1150.0  # (1000+500+200) - (400+100+50)
    assert data["verification"]["verified"] is True
    assert data["verification"]["assuranceFirm"] == "Bağımsız Denetim A.Ş."
    assert "TSRS Uyumlu" in data["badges"]
    assert "%100 Yenilenebilir Enerji (Kapsam 2)" in data["badges"]


@pytest.mark.asyncio
async def test_public_profile_hides_negative_reduction(admin_client: AsyncClient, db: AsyncSession):
    """
    Emisyonlar azalmak yerine arttıysa emissionsReducedTco2e null dönmeli —
    negatif bir sayıyı "Karbon Azaltımı" etiketiyle göstermek yanıltıcı olurdu.
    """
    me = await admin_client.get("/auth/me")
    company_id = me.json()["company_id"]

    db.add_all([
        EmissionRecord(company_id=company_id, year=2020, scope1_co2e=100, scope2_location_co2e=50, scope3_co2e=20),
        EmissionRecord(company_id=company_id, year=2024, scope1_co2e=400, scope2_location_co2e=100, scope3_co2e=50),
    ])
    await db.commit()

    await admin_client.patch(
        "/companies/me/public-profile", json={"slug": "artan-sirket", "enabled": True}
    )
    resp = await admin_client.get("/api/public/companies/artan-sirket")
    assert resp.status_code == 200
    assert resp.json()["emissionsReducedTco2e"] is None
