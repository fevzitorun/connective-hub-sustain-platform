"""
DPP (Dijital Ürün Pasaportu) — end-to-end testler.

Kapsam:
- Ürün oluşturma + GTIN doğrulama + enerji sınıfı doğrulama
- Pasaport draft → materials/documents/suppliers → issue → revoke
- Yeşil Skor (sektör-özel ağırlık)
- Şablon doğrulama (textile'da OEKO-TEX zorunlu)
- Public endpoint: lang, scan_count, revoked görünürlük
- İade akışı + kupon kodu
- Analytics, compare, bulk import CSV
"""
import io
import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio


async def _create_product(auth_client: AsyncClient, **overrides) -> dict:
    payload = {
        "sku": "TEST-TEX-001",
        "name_tr": "Test Tişört",
        "name_en": "Test T-Shirt",
        "category": "textile",
        "manufacturing_country": "TR",
        "weight_kg": 0.2,
    }
    payload.update(overrides)
    r = await auth_client.post("/dpp/products", json=payload)
    assert r.status_code == 201, r.text
    return r.json()


async def _draft_passport(auth_client: AsyncClient, product_id: str, **overrides) -> dict:
    payload = {"carbon_footprint_kgco2e": 8.5, "recycled_content_pct": 40, "repairability_score": 7.5}
    payload.update(overrides)
    r = await auth_client.post(f"/dpp/products/{product_id}/passport", json=payload)
    assert r.status_code == 201, r.text
    return r.json()


# ─────────────────── Ürün CRUD + doğrulama ───────────────────

async def test_create_product_basic(auth_client):
    r = await auth_client.post("/dpp/products", json={
        "sku": "T-1", "name_tr": "Ürün 1", "category": "textile", "manufacturing_country": "TR",
    })
    assert r.status_code == 201
    assert r.json()["sku"] == "T-1"


async def test_gtin_validation_rejects_short(auth_client):
    r = await auth_client.post("/dpp/products", json={
        "sku": "T-2", "name_tr": "X", "category": "textile", "gtin": "123",
    })
    assert r.status_code == 422


async def test_gtin_validation_accepts_13(auth_client):
    r = await auth_client.post("/dpp/products", json={
        "sku": "T-3", "name_tr": "X", "category": "textile", "gtin": "8690123456789",
    })
    assert r.status_code == 201
    assert r.json()["gtin"] == "8690123456789"


async def test_energy_class_validation(auth_client):
    r = await auth_client.post("/dpp/products", json={
        "sku": "E-1", "name_tr": "Aygıt", "category": "electronics", "energy_class": "Z",
    })
    assert r.status_code == 422


async def test_invalid_category(auth_client):
    r = await auth_client.post("/dpp/products", json={
        "sku": "X-1", "name_tr": "X", "category": "nonsense",
    })
    assert r.status_code == 422


# ─────────────────── Pasaport yaşam döngüsü ───────────────────

async def test_passport_draft_and_issue_flow(auth_client):
    product = await _create_product(auth_client, sku="LC-1")
    passport = await _draft_passport(auth_client, product["id"])
    assert passport["status"] == "draft"
    assert passport["version"] == 1

    # Malzeme ekle
    r = await auth_client.post(f"/dpp/passports/{passport['id']}/materials", json={
        "material_name": "Organik Pamuk", "percentage_by_weight": 100, "recycled_content_pct": 30,
    })
    assert r.status_code == 201

    # Belge ekle
    r = await auth_client.post(f"/dpp/passports/{passport['id']}/documents", json={
        "doc_type": "oekotex", "title": "OEKO-TEX Standard 100",
        "file_url": "https://ex.com/oeko.pdf",
    })
    assert r.status_code == 201

    # Tedarikçi ekle
    r = await auth_client.post(f"/dpp/passports/{passport['id']}/suppliers", json={
        "name": "Anadolu İplik", "country": "TR", "role": "iplik",
        "certifications": ["OEKO-TEX"],
    })
    assert r.status_code == 201

    # Skoru hesapla
    r = await auth_client.post(f"/dpp/passports/{passport['id']}/score")
    assert r.status_code == 200
    score = r.json()
    assert 0 <= score["green_score"] <= 100
    assert score["grade"] in ("A+", "A", "B", "C", "D")

    # Yayınla
    r = await auth_client.post(f"/dpp/passports/{passport['id']}/issue")
    assert r.status_code == 200
    assert r.json()["status"] == "issued"


async def test_second_issue_supersedes_first(auth_client):
    product = await _create_product(auth_client, sku="SU-1")
    p1 = await _draft_passport(auth_client, product["id"])
    await auth_client.post(f"/dpp/passports/{p1['id']}/materials",
                            json={"material_name": "X", "percentage_by_weight": 100})
    r1 = await auth_client.post(f"/dpp/passports/{p1['id']}/issue")
    assert r1.status_code == 200

    p2 = await _draft_passport(auth_client, product["id"])
    await auth_client.post(f"/dpp/passports/{p2['id']}/materials",
                            json={"material_name": "X", "percentage_by_weight": 100})
    r2 = await auth_client.post(f"/dpp/passports/{p2['id']}/issue")
    assert r2.status_code == 200

    # p1 artık superseded olmalı
    r = await auth_client.get(f"/dpp/passports/{p1['id']}")
    assert r.json()["status"] == "superseded"


async def test_material_add_forbidden_on_issued(auth_client):
    product = await _create_product(auth_client, sku="FR-1")
    p = await _draft_passport(auth_client, product["id"])
    await auth_client.post(f"/dpp/passports/{p['id']}/materials",
                            json={"material_name": "X", "percentage_by_weight": 100})
    await auth_client.post(f"/dpp/passports/{p['id']}/issue")
    r = await auth_client.post(f"/dpp/passports/{p['id']}/materials",
                                json={"material_name": "Y", "percentage_by_weight": 100})
    assert r.status_code == 400


async def test_revoke_flow(auth_client):
    product = await _create_product(auth_client, sku="RV-1")
    p = await _draft_passport(auth_client, product["id"])
    await auth_client.post(f"/dpp/passports/{p['id']}/materials",
                            json={"material_name": "X", "percentage_by_weight": 100})
    await auth_client.post(f"/dpp/passports/{p['id']}/issue")
    r = await auth_client.post(f"/dpp/passports/{p['id']}/revoke",
                                json={"reason": "kalite problemi"})
    assert r.status_code == 200
    assert r.json()["status"] == "revoked"


# ─────────────────── Şablon doğrulama ───────────────────

async def test_validate_textile_needs_oekotex(auth_client):
    product = await _create_product(auth_client, sku="VT-1", subcategory="tişört",
                                     manufactured_at="2027-01-15")
    p = await _draft_passport(auth_client, product["id"])
    r = await auth_client.get(f"/dpp/passports/{p['id']}/validate")
    assert r.status_code == 200
    data = r.json()
    assert data["template_category"] == "textile"
    assert data["documents_ok"] is False  # OEKO-TEX yok
    assert not data["ready_to_issue"]


async def test_template_endpoint(auth_client):
    r = await auth_client.get("/dpp/templates/battery")
    assert r.status_code == 200
    t = r.json()
    assert t["category"] == "battery"
    assert "ce" in t["required_documents"]
    assert t["green_weights"]["carbon"] == 35


# ─────────────────── Public endpoint + counters ───────────────────

async def test_public_endpoint_increments_scan_count(auth_client, client):
    product = await _create_product(auth_client, sku="PB-1")
    p = await _draft_passport(auth_client, product["id"])
    await auth_client.post(f"/dpp/passports/{p['id']}/materials",
                            json={"material_name": "X", "percentage_by_weight": 100})
    await auth_client.post(f"/dpp/passports/{p['id']}/issue")

    # İki kez public'i çağır
    await client.get(f"/public/passport/{p['id']}")
    r = await client.get(f"/public/passport/{p['id']}")
    assert r.status_code == 200
    body = r.json()
    assert body["metrics"]["scan_count"] >= 2
    # labels TR
    assert body["labels"]["green_score"] == "Yeşil Skor"


async def test_public_endpoint_lang_en(auth_client, client):
    product = await _create_product(auth_client, sku="LN-1", name_en="EN Product")
    p = await _draft_passport(auth_client, product["id"])
    await auth_client.post(f"/dpp/passports/{p['id']}/materials",
                            json={"material_name": "X", "percentage_by_weight": 100})
    await auth_client.post(f"/dpp/passports/{p['id']}/issue")
    r = await client.get(f"/public/passport/{p['id']}?lang=en")
    body = r.json()
    assert body["lang"] == "en"
    assert body["labels"]["green_score"] == "Green Score"
    assert body["product"]["name"] == "EN Product"


async def test_public_draft_returns_404(auth_client, client):
    product = await _create_product(auth_client, sku="DR-1")
    p = await _draft_passport(auth_client, product["id"])
    r = await client.get(f"/public/passport/{p['id']}")
    assert r.status_code == 404


# ─────────────────── İade / kupon ───────────────────

async def test_return_request_generates_coupon(auth_client, client):
    product = await _create_product(auth_client, sku="RT-1")
    p = await _draft_passport(auth_client, product["id"])
    await auth_client.post(f"/dpp/passports/{p['id']}/materials",
                            json={"material_name": "X", "percentage_by_weight": 100})
    await auth_client.post(f"/dpp/passports/{p['id']}/issue")

    r = await client.post(f"/public/passport/{p['id']}/return-request", json={
        "requestor_email": "tuketici@example.com",
    })
    assert r.status_code == 201
    body = r.json()
    assert body["coupon_code"].startswith("DPP-")
    assert body["discount_pct"] == 10


# ─────────────────── Analytics ───────────────────

async def test_analytics_returns_totals(auth_client):
    product = await _create_product(auth_client, sku="AN-1")
    await _draft_passport(auth_client, product["id"])
    r = await auth_client.get("/dpp/analytics")
    assert r.status_code == 200
    a = r.json()
    assert a["products"] >= 1
    assert "draft" in a["passports_by_status"]


# ─────────────────── Compare ───────────────────

async def test_compare_two_passports(auth_client):
    product = await _create_product(auth_client, sku="CM-1")
    p1 = await _draft_passport(auth_client, product["id"], carbon_footprint_kgco2e=10.0)
    p2 = await _draft_passport(auth_client, product["id"], carbon_footprint_kgco2e=7.0)
    r = await auth_client.get(f"/dpp/passports/{p1['id']}/compare/{p2['id']}")
    assert r.status_code == 200
    d = r.json()
    assert d["carbon_delta_kgco2e"] == -3.0


# ─────────────────── Bulk import ───────────────────

async def test_bulk_import_csv(auth_client):
    csv_body = (
        "sku,name_tr,category,manufacturing_country\n"
        "BULK-1,Ürün 1,textile,TR\n"
        "BULK-2,Ürün 2,electronics,DE\n"
    )
    files = {"file": ("import.csv", io.BytesIO(csv_body.encode()), "text/csv")}
    r = await auth_client.post("/dpp/products/bulk-import", files=files)
    assert r.status_code == 200
    b = r.json()
    assert b["created"] == 2
    assert b["failed"] == 0


async def test_bulk_import_reports_row_errors(auth_client):
    csv_body = (
        "sku,name_tr,category,manufacturing_country\n"
        "OK-1,Doğru,textile,TR\n"
        "BAD-1,Yanlış,nonsense_category,TR\n"
    )
    files = {"file": ("mixed.csv", io.BytesIO(csv_body.encode()), "text/csv")}
    r = await auth_client.post("/dpp/products/bulk-import", files=files)
    assert r.status_code == 200
    b = r.json()
    assert b["created"] == 1
    assert b["failed"] == 1
    assert b["errors"][0]["sku"] == "BAD-1"


# ─────────────────── Tenant izolasyon ───────────────────

async def test_other_company_cannot_access(auth_client, client):
    product = await _create_product(auth_client, sku="TN-1")
    # Yeni bir kullanıcı ve şirket oluştur
    import uuid as _u
    email = f"other-{_u.uuid4().hex[:6]}@sustainhub.ai"
    reg = await client.post("/auth/register", json={
        "email": email, "password": "Test1234!", "name": "Other",
        "company_name": "Other Şirket A.Ş.", "sector": "manufacturing",
    })
    other_token = reg.json()["access_token"]
    r = await client.get(f"/dpp/products/{product['id']}",
                          headers={"Authorization": f"Bearer {other_token}"})
    assert r.status_code == 403
