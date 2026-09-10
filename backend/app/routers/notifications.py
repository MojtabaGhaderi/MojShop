from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/products/{slug}/notify-me", tags=["notifications"])


@router.post("/", status_code=status.HTTP_201_CREATED)
def notify_me(slug: str, payload: schemas.StockNotifyRequest, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.slug == slug).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    notification = models.StockNotification(product_id=product.id, email=payload.email)
    db.add(notification)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        return {"message": "شما قبلاً برای این محصول ثبت‌نام کرده‌اید"}
    return {"message": "پس از موجود شدن محصول به شما اطلاع داده می‌شود"}