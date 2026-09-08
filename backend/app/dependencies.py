# backend/app/dependencies.py
from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.services.auth import decode_access_token


def get_current_user(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> User:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = authorization[7:].strip()
    user_id = decode_access_token(token)
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )
    return user


def get_current_admin(user: User = Depends(get_current_user)) -> User:
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return user

def get_current_user_optional(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> User | None:
    """Like get_current_user, but returns None instead of raising 401 when there's
    no token — needed for endpoints usable by both logged-in and guest checkout."""
    if not authorization or not authorization.lower().startswith("bearer "):
        return None
    token = authorization[7:].strip()
    user_id = decode_access_token(token)
    if user_id is None:
        return None
    return db.query(User).filter(User.id == user_id, User.is_active == True).first()