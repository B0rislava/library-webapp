from pydantic import BaseModel
from typing import Optional
from ..models_db import ReadingStatus


class BookCreate(BaseModel):
    title: str
    author: str
    year: int
    description: str
    cover_url: Optional[str] = None
    pdf_url: Optional[str] = None


class UserBookUpdate(BaseModel):
    status: Optional[ReadingStatus] = None
    progress: Optional[int] = None
    current_page: Optional[int] = None
    total_pages: Optional[int] = None


class UserBookResponse(BaseModel):
    book_id: int
    title: str
    author: str
    year: int
    status: ReadingStatus
    progress: int
    current_page: int
    total_pages: int

    class Config:
        from_attributes = True
