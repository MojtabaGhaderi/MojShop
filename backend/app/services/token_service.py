from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app import models
from app.config import settings
from app.services.auth import generate_refresh_token, hash_refresh_token


def create_refresh_token_record(
    db: Session,
    user_id: int,
    *,
    user_agent: str | None = None,
    ip_address: str | None = None,
) -> tuple[str, models.RefreshToken]:
    """Returns (raw_token, db_row). Raw token is shown only once."""
    raw = generate_refresh_token()
    row = models.RefreshToken(
        user_id=user_id,
        token_hash=hash_refresh_token(raw),
        expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        user_agent=user_agent,
        ip_address=ip_address,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return raw, row


def get_refresh_token_by_raw(db: Session, raw_token: str) -> models.RefreshToken | None:
    return (
        db.query(models.RefreshToken)
        .filter(models.RefreshToken.token_hash == hash_refresh_token(raw_token))
        .first()
    )


def revoke_refresh_token(db: Session, token: models.RefreshToken) -> None:
    if token.revoked_at is None:
        token.revoked_at = datetime.utcnow()
        db.commit()


def revoke_all_user_refresh_tokens(db: Session, user_id: int) -> None:
    db.query(models.RefreshToken).filter(
        models.RefreshToken.user_id == user_id,
        models.RefreshToken.revoked_at.is_(None),
    ).update({"revoked_at": datetime.utcnow()})
    db.commit()


def rotate_refresh_token(
    db: Session,
    old: models.RefreshToken,
    *,
    user_agent: str | None = None,
    ip_address: str | None = None,
) -> tuple[str, models.RefreshToken]:
    """Revoke old, create new, link chain. Returns (raw_new, new_row)."""
    raw_new, new_row = create_refresh_token_record(
        db, old.user_id, user_agent=user_agent, ip_address=ip_address
    )
    old.revoked_at = datetime.utcnow()
    old.replaced_by_id = new_row.id
    db.commit()
    db.refresh(old)
    return raw_new, new_row