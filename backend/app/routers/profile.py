from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import schemas, models
from app.database import get_db
from app.dependencies import get_current_user
from app.services.auth import get_password_hash, verify_password

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("/", response_model=schemas.UserResponse)
def get_profile(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.put("/", response_model=schemas.UserResponse)
def update_profile(
    profile: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    update_data = profile.model_dump(exclude_unset=True)
    
    # Handle password change separately
    new_password = update_data.pop("new_password", None)
    current_password = update_data.pop("current_password", None)
    
    if new_password:
        if not current_password:
            raise HTTPException(status_code=400, detail="Current password required to set new password")
        if not verify_password(current_password, current_user.hashed_password):
            raise HTTPException(status_code=400, detail="Current password is incorrect")
        update_data["hashed_password"] = get_password_hash(new_password)
    
    # Check email uniqueness if changing
    if "email" in update_data and update_data["email"] != current_user.email:
        existing = db.query(models.User).filter(models.User.email == update_data["email"]).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
    
    for field, value in update_data.items():
        if value is not None:
            setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    return current_user