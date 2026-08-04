import sys
from fastapi import Depends, HTTPException, status, Cookie
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.services.auth import decode_access_token

def get_current_user(
    access_token: str | None = Cookie(default=None, alias="access_token"),
    db: Session = Depends(get_db),
) -> User:
    print(f"\n=== DEBUG: get_current_user triggered ===", flush=True, file=sys.stderr)
    print(f"1. Raw cookie value: {repr(access_token)}", flush=True, file=sys.stderr)
    
    if not access_token:
        print("FAIL: No cookie provided", flush=True, file=sys.stderr)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    
    token = access_token.replace("Bearer ", "", 1) if access_token.startswith("Bearer ") else access_token
    print(f"2. Token passed to decode: {repr(token)}", flush=True, file=sys.stderr)
    
    user_id = decode_access_token(token)
    print(f"3. Decoded user_id: {repr(user_id)}", flush=True, file=sys.stderr)
    
    if user_id is None:
        print("FAIL: decode_access_token returned None", flush=True, file=sys.stderr)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        print(f"FAIL: User with id {user_id} not found or inactive", flush=True, file=sys.stderr)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")
    
    print(f"SUCCESS: User {user.email} authenticated", flush=True, file=sys.stderr)
    return user
def get_current_admin(user: User = Depends(get_current_user)) -> User:
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return user