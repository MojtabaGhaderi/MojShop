from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/banners", tags=["banners"])


@router.get("/", response_model=list[schemas.BannerResponse])
def list_banners(placement: models.BannerPlacement | None = None, db: Session = Depends(get_db)):
    query = db.query(models.Banner).filter(models.Banner.is_active == True)
    if placement:
        query = query.filter(models.Banner.placement == placement)
    return query.order_by(models.Banner.sort_order).all()