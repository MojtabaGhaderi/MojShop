from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config import settings

# echo=True logs SQL to console — useful for debugging, remove in production
engine = create_engine(settings.DATABASE_URL, echo=True)

# SessionLocal is what we use in FastAPI dependencies
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class all models inherit from
Base = declarative_base()


# FastAPI dependency — yields a DB session per request, closes it after
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()