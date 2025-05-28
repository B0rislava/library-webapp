from fastapi import APIRouter, HTTPException, Depends, status
from .schemas.user_schema import UserSignup, UserSignin
import bcrypt
from jose import jwt, JWTError
import os
from .database import SessionLocal, get_db
from sqlalchemy.orm import Session
from .models_db import User as DBUser
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta

ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7

security = HTTPBearer()
router = APIRouter(prefix='/auth', tags=["auth"])

SECRET = os.getenv("SECRET_KEY", "secret_fallback_key")


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET, algorithms=["HS256"])
        user_id: str = payload.get("sub")  # взимаме "sub"
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )

    user = db.query(DBUser).filter(DBUser.id == int(user_id)).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user



def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/signup")
async def signup(user: UserSignup, db: Session = Depends(get_db)):
    existing_user = db.query(DBUser).filter(DBUser.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = bcrypt.hashpw(user.password.encode(), bcrypt.gensalt()).decode()

    new_user = DBUser(
        name=user.name,
        email=user.email,
        password=hashed_pw,
        role=user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User created",
        "id": new_user.id
    }


@router.post("/signin")
async def signin(credentials: UserSignin, db: Session = Depends(get_db)):
    user = db.query(DBUser).filter(DBUser.email == credentials.email).first()

    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if not bcrypt.checkpw(credentials.password.encode(), user.password.encode()):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    access_token = create_access_token({"sub": str(user.id), "role": user.role})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/refresh")
def refresh_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(credentials.credentials, SECRET, algorithms=["HS256"])
        email: str = payload.get("email")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid refresh token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user = db.query(DBUser).filter(DBUser.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    # New access token
    access_token = create_access_token({"email": user.email, "role": user.role})
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }



def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET, algorithm="HS256")

def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET, algorithm="HS256")



