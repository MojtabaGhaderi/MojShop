from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.dependencies import get_current_admin
from app.models import TrustBadge, User
from app.schemas import TrustBadgeCreate, TrustBadgeUpdate, TrustBadgeResponse

router = APIRouter(prefix="/trust-badges", tags=["trust-badges"])

@router.get("/", response_model=List[TrustBadgeResponse])
def get_public_trust_badges(db: Session = Depends(get_db)):
    """Public endpoint: Returns active badges in display order."""
    return (
        db.query(TrustBadge)
        .filter(TrustBadge.is_active == True)
        .order_by(TrustBadge.sort_order.asc())
        .all()
    )

@router.post("/", response_model=TrustBadgeResponse, status_code=status.HTTP_201_CREATED)
def create_badge(data: TrustBadgeCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    badge = TrustBadge(**data.model_dump())
    db.add(badge)
    db.commit()
    db.refresh(badge)
    return badge

@router.patch("/{badge_id}", response_model=TrustBadgeResponse)
def update_badge(badge_id: int, data: TrustBadgeUpdate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    badge = db.query(TrustBadge).filter(TrustBadge.id == badge_id).first()
    if not badge:
        raise HTTPException(status_code=404, detail="Badge not found")
    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(badge, key, val)
    db.commit()
    db.refresh(badge)
    return badge

@router.delete("/{badge_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_badge(badge_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    badge = db.query(TrustBadge).filter(TrustBadge.id == badge_id).first()
    if not badge:
        raise HTTPException(status_code=404, detail="Badge not found")
    db.delete(badge)
    db.commit()
    return None