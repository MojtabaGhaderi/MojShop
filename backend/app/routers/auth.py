from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from datetime import datetime

from app import schemas, models
from app.database import get_db
from app.dependencies import get_current_user
from app.services.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
)
from app.services import token_service

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


def _client_meta(request: Request) -> tuple[str | None, str | None]:
    ua = request.headers.get("user-agent")
    # Prefer X-Forwarded-For if behind proxy
    forwarded = request.headers.get("x-forwarded-for")
    ip = forwarded.split(",")[0].strip() if forwarded else (request.client.host if request.client else None)
    return ua, ip


def _issue_tokens(
    db: Session,
    user: models.User,
    request: Request,
) -> schemas.Token:
    access = create_access_token(user.id)
    ua, ip = _client_meta(request)
    refresh_raw, _ = token_service.create_refresh_token_record(
        db, user.id, user_agent=ua, ip_address=ip
    )
    return schemas.Token(access_token=access, refresh_token=refresh_raw, token_type="bearer")


@router.post("/register", response_model=schemas.Token, status_code=status.HTTP_201_CREATED)
def register(
    user_in: schemas.UserCreate,
    request: Request,
    db: Session = Depends(get_db),
):
    existing = db.query(models.User).filter(models.User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    db_user = models.User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        phone=user_in.phone,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return _issue_tokens(db, db_user, request)


@router.post("/login", response_model=schemas.Token)
def login(
    user_in: LoginRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="User account is inactive")
    return _issue_tokens(db, user, request)


@router.post("/refresh", response_model=schemas.Token)
def refresh(
    body: schemas.RefreshRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    row = token_service.get_refresh_token_by_raw(db, body.refresh_token)
    if not row:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    # Reuse detection: already revoked → possible theft → kill all sessions
    if row.revoked_at is not None:
        token_service.revoke_all_user_refresh_tokens(db, row.user_id)
        raise HTTPException(status_code=401, detail="Refresh token reuse detected")

    if row.expires_at < datetime.utcnow():
        token_service.revoke_refresh_token(db, row)
        raise HTTPException(status_code=401, detail="Refresh token expired")

    user = db.query(models.User).filter(
        models.User.id == row.user_id, models.User.is_active == True
    ).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found or inactive")

    ua, ip = _client_meta(request)
    new_refresh_raw, _ = token_service.rotate_refresh_token(
        db, row, user_agent=ua, ip_address=ip
    )
    access = create_access_token(user.id)
    return schemas.Token(
        access_token=access,
        refresh_token=new_refresh_raw,
        token_type="bearer",
    )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    body: schemas.LogoutRequest,
    db: Session = Depends(get_db),
):
    row = token_service.get_refresh_token_by_raw(db, body.refresh_token)
    if row and row.revoked_at is None:
        token_service.revoke_refresh_token(db, row)
    return None


@router.get("/me", response_model=schemas.UserResponse)
def me(current_user: models.User = Depends(get_current_user)):
    return current_user