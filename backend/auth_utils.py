from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import get_db
import models
import jwt
import os

SECRET_KEY  = os.getenv("JWT_SECRET", "change-this-in-production")
ALGORITHM   = os.getenv("JWT_ALGORITHM", "HS256")
EXPIRE_MINS = int(os.getenv("JWT_EXPIRE_MINUTES", "1440")) 

bearer_scheme = HTTPBearer()

def create_token(user_id: int, role: str, nutritionist_id: int | None) -> str:
    payload = {
        "sub":              str(user_id),
        "role":             role,
        "nutritionist_id":  nutritionist_id,
        "exp":              datetime.utcnow() + timedelta(minutes=EXPIRE_MINS),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired. Please log in again.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token.")

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> models.User:
    payload = decode_token(credentials.credentials)
    user = db.query(models.User).filter(models.User.id == int(payload["sub"])).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found.")
    return user

def require_nutritionist(current_user: models.User = Depends(get_current_user)) -> models.User:
    if not current_user.nutritionist_profile:
        raise HTTPException(status_code=403, detail="Nutritionist access required.")
    return current_user