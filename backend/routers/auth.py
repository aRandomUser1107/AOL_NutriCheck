from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
import hashlib

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

def hash_password(password: str) -> str:
    """Simple SHA-256 hash. For production, use bcrypt."""
    return hashlib.sha256(password.encode()).hexdigest()

# register
@router.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    # Data Validation: check for duplicates
    if db.query(models.User).filter(models.User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(models.User).filter(models.User.username == user_data.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    if user_data.role not in ("user", "nutritionist"):
        raise HTTPException(status_code=400, detail="role must be 'user' or 'nutritionist'")

    new_user = models.User(
        username=user_data.username,
        email=user_data.email,
        password=hash_password(user_data.password),
    )
    db.add(new_user)
    db.flush()  

    if user_data.role == "nutritionist":
        nutritionist = models.Nutritionist(
            user_id=new_user.id,
            bio=user_data.bio or ""
        )
        db.add(nutritionist)

    db.commit()
    db.refresh(new_user)
    return new_user

# login
@router.post("/login")
def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    if not user or user.password != hash_password(credentials.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # role determine
    is_nutritionist = user.nutritionist_profile is not None
    nutritionist_id = user.nutritionist_profile.id if is_nutritionist else None

    return {
        "message": "Login successful",
        "user_id": user.id,
        "username": user.username,
        "role": "nutritionist" if is_nutritionist else "user",
        "nutritionist_id": nutritionist_id   # id for nutrinionist
    }