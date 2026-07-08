"""Test fixtures — SQLite in-memory DB, no external dependencies."""
import uuid
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.pool import StaticPool
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.main import app
from app.database import Base, get_db
from app.models import Company, User, EmissionRecord  # noqa: F401
from app.services.auth import hash_password

TEST_DB_URL = "sqlite+aiosqlite:///:memory:"

# StaticPool ensures all sessions share the same in-memory database
engine_test = create_async_engine(
    TEST_DB_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
    echo=False,
)
TestSession = async_sessionmaker(engine_test, expire_on_commit=False)


async def override_get_db():
    async with TestSession() as session:
        yield session


app.dependency_overrides[get_db] = override_get_db

# reports.py'deki BackgroundTasks, Depends(get_db) yerine AsyncSessionLocal'ı
# doğrudan import ediyor — bu yüzden get_db override'ı onu kapsamıyor.
# Test izolasyonu için o referansı da test session'ına yönlendiriyoruz.
import app.routes.reports as _reports_module  # noqa: E402
_reports_module.AsyncSessionLocal = TestSession


@pytest_asyncio.fixture(scope="session", autouse=True)
async def create_tables():
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def db() -> AsyncSession:
    async with TestSession() as session:
        yield session


@pytest_asyncio.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c


@pytest_asyncio.fixture
async def auth_client(client: AsyncClient, db: AsyncSession):
    """Kayıtlı + giriş yapmış client. Her test için benzersiz e-posta kullanır."""
    unique_email = f"test-{uuid.uuid4().hex[:8]}@sustainhub.ai"
    resp = await client.post("/auth/register", json={
        "email": unique_email,
        "password": "Test1234!",
        "name": "Test Kullanıcı",
        "company_name": "Test Şirketi A.Ş.",
        "sector": "manufacturing",
        "employee_count": 500,
    })
    assert resp.status_code == 201, resp.text
    token = resp.json()["access_token"]
    client.headers["Authorization"] = f"Bearer {token}"
    return client


@pytest_asyncio.fixture
async def admin_client(client: AsyncClient, db: AsyncSession):
    """Admin rolüyle kayıtlı client."""
    unique_email = f"admin-{uuid.uuid4().hex[:8]}@sustainhub.ai"
    resp = await client.post("/auth/register", json={
        "email": unique_email,
        "password": "Admin1234!",
        "name": "Admin Kullanıcı",
        "company_name": "Admin Şirketi A.Ş.",
        "sector": "banking",
        "employee_count": 2000,
    })
    assert resp.status_code == 201, resp.text
    token = resp.json()["access_token"]

    # Rolü admin yap
    user_id = resp.json()["user"]["id"]
    from sqlalchemy import select
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one()
    user.role = "admin"
    await db.commit()

    client.headers["Authorization"] = f"Bearer {token}"
    return client
