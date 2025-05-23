from pydantic import BaseModel, EmailStr

class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str

class UserSignin(BaseModel):
    email: EmailStr
    password: str

class BookCreate(BaseModel):
    title: str
    author: str
    year: int

class BookResponse(BaseModel):
    id: int
    title: str
    author: str
    year: int
    available: bool

    class Config:
        from_attributes = True
