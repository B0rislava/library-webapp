from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    email: EmailStr
    name: str


class UserSignup(UserBase):
    password: str
    role: str = "user"


class UserSignin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(UserBase):
    pass


class UserResponse(UserBase):
    id: int
    role: str

    class Config:
        from_attributes = True
