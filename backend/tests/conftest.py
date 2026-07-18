import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db
from app.config import settings

TEST_DATABASE_URL = settings.TEST_DATABASE_URL
engine = create_engine(TEST_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(autouse=True)
def clean_tables(db_session):
    """Clear all tables before each test for isolation."""
    from app import models
    db_session.query(models.CartItem).delete()
    db_session.query(models.OrderItem).delete()
    db_session.query(models.Invoice).delete()
    db_session.query(models.Order).delete()
    db_session.query(models.Address).delete()
    db_session.query(models.ProductMaterial).delete()
    db_session.query(models.ProductImage).delete()
    db_session.query(models.Product).delete()
    db_session.query(models.Category).delete()
    db_session.query(models.User).delete()
    db_session.commit()


@pytest_asyncio.fixture
async def async_client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


@pytest.fixture
def sample_prices():
    return {
        "gold_per_gram": 100.0,
        "silver_per_gram": 10.0,
        "platinum_per_gram": 50.0,
        "palladium_per_gram": 40.0,
    }