from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models_db import User
from ..schemas.user_schema import UserUpdate, UserResponse
from ..auth import get_current_user, DBUser
from passlib.context import CryptContext

router = APIRouter(prefix="/users", tags=["Users"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.get("/me", response_model=UserResponse)
def read_user_me(current_user: DBUser = Depends(get_current_user)):
    return current_user

@router.put("/update")
def update_user_profile(
        user_data: UserUpdate,
        db: Session = Depends(get_db),
        current_user: DBUser = Depends(get_current_user)
):
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.email != user_data.email:
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user and existing_user.id != user.id:
            raise HTTPException(status_code=400, detail="Email is already in use.")
        user.email = user_data.email
    user.name = user_data.name

    if user_data.password.strip():
        hashed_password = pwd_context.hash(user_data.password)
        user.password = hashed_password

    db.commit()
    db.refresh(user)

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
    }


@router.delete("/delete")
def delete_user_profile(
        db: Session = Depends(get_db),
        current_user: DBUser = Depends(get_current_user)
):
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()
    return {"message": "User deleted"}
