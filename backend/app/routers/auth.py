from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app import schemas, models
from app.database import get_db
from app.dependencies import get_current_user
from app.services.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
)
from app.services import token_service

import secrets
import hashlib

from app.config import settings
from app.services.email_service import send_email


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




def _hash_verify_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()

def _send_verification_email(user: models.User, db: Session):
    raw_token = secrets.token_urlsafe(32)
    record = models.EmailVerificationToken(
        user_id=user.id, token_hash=_hash_verify_token(raw_token),
        expires_at=datetime.utcnow() + timedelta(hours=24),
    )
    db.add(record)
    db.commit()
    verify_url = f"{settings.FRONTEND_URL}/verify-email?token={raw_token}"
    subject = "تایید ایمیل — موج گالری"
    html = f"<p>برای تایید ایمیل خود کلیک کنید:</p><p><a href='{verify_url}'>تایید ایمیل</a></p>"
    send_email(user.email, subject, html)


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
    _send_verification_email(db_user, db)
    return _issue_tokens(db, db_user, request)

@router.post("/verify-email", status_code=status.HTTP_200_OK)
def verify_email(payload: schemas.VerifyEmailRequest, db: Session = Depends(get_db)):
    record = db.query(models.EmailVerificationToken).filter(
        models.EmailVerificationToken.token_hash == _hash_verify_token(payload.token)
    ).first()
    if not record or record.used_at is not None or record.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="لینک تایید نامعتبر یا منقضی شده است")

    user = db.query(models.User).filter(models.User.id == record.user_id).first()
    user.is_verified = True
    record.used_at = datetime.utcnow()
    db.commit()
    return {"message": "ایمیل شما با موفقیت تایید شد"}


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


def _hash_reset_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
def forgot_password(payload: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    from app.services.email_service import send_email, build_password_reset_email
    from app.config import settings

    user = db.query(models.User).filter(models.User.email == payload.email).first()
    # Same response whether or not the email exists — confirming/denying
    # registered emails here is a user-enumeration leak, not just a nicety.
    if user:
        raw_token = secrets.token_urlsafe(32)
        reset = models.PasswordResetToken(
            user_id=user.id,
            token_hash=_hash_reset_token(raw_token),
            expires_at=datetime.utcnow() + timedelta(hours=1),
        )
        db.add(reset)
        db.commit()

        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={raw_token}"
        subject, html = build_password_reset_email(reset_url)
        send_email(user.email, subject, html)

    return {"message": "اگر این ایمیل در سامانه ثبت شده باشد، لینک بازیابی رمز عبور ارسال شد"}


@router.post("/reset-password", status_code=status.HTTP_200_OK)
def reset_password(payload: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    reset = db.query(models.PasswordResetToken).filter(
        models.PasswordResetToken.token_hash == _hash_reset_token(payload.token)
    ).first()

    if not reset or reset.used_at is not None or reset.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="لینک بازیابی نامعتبر یا منقضی شده است")

    user = db.query(models.User).filter(models.User.id == reset.user_id).first()
    if not user:
        raise HTTPException(status_code=400, detail="کاربر یافت نشد")

    user.hashed_password = get_password_hash(payload.new_password)
    reset.used_at = datetime.utcnow()
    db.commit()

    # A password reset is exactly the moment any stolen refresh tokens should
    # die too — not just a courtesy, closes a real session-hijack window.
    token_service.revoke_all_user_refresh_tokens(db, user.id)

    return {"message": "رمز عبور با موفقیت تغییر کرد"}