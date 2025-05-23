from fastapi import APIRouter, HTTPException, Depends, status
from .models import UserSignup, UserSignin
import bcrypt
from jose import jwt, JWTError
import os
from .database import SessionLocal, get_db
from sqlalchemy.orm import Session
from .models_db import User as DBUser
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Security

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
        email: str = payload.get("email")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )

    user = db.query(DBUser).filter(DBUser.email == email).first()
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

    return {"message": "User created"}


@router.post("/signin")
async def signin(credentials: UserSignin, db: Session = Depends(get_db)):
    user = db.query(DBUser).filter(DBUser.email == credentials.email).first()

    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials")


    if not user or not bcrypt.checkpw(credentials.password.encode(), user.password.encode()):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = jwt.encode({
        "email": user.email,
        "role": user.role
    }, SECRET, algorithm="HS256")

    return {"token": token}






