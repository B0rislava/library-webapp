from pydantic import BaseModel

class Book(BaseModel):
    title: str
    author: str
    year: int
    isbn: str
    description: str


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
