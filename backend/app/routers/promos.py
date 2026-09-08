from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_admin
from app.models import PromoCode
from app.schemas import PromoCodeCreate, PromoCodeResponse, PromoValidateRequest, PromoValidateResponse
from app.services.promo_service import find_valid_promo


router = APIRouter(prefix="/promos", tags=["promos"])



@router.post("/validate", response_model=PromoValidateResponse)
def validate_promo(payload: PromoValidateRequest, db: Session = Depends(get_db)):
    promo, discount, error = find_valid_promo(db, payload.code, payload.subtotal)
    if error:
        return PromoValidateResponse(valid=False, message=error)
    return PromoValidateResponse(valid=True, discount_amount=discount)


@router.get("/admin", response_model=list[PromoCodeResponse], dependencies=[Depends(get_current_admin)])
def list_promos(db: Session = Depends(get_db)):
    return db.query(PromoCode).order_by(PromoCode.created_at.desc()).all()


@router.post("/admin", response_model=PromoCodeResponse, status_code=201, dependencies=[Depends(get_current_admin)])
def create_promo(payload: PromoCodeCreate, db: Session = Depends(get_db)):
    if db.query(PromoCode).filter(PromoCode.code == payload.code).first():
        raise HTTPException(status_code=400, detail="این کد از قبل وجود دارد")
    promo = PromoCode(**payload.model_dump())
    db.add(promo)
    db.commit()
    db.refresh(promo)
    return promo