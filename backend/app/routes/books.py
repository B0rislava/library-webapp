from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..auth import get_current_user, DBUser
from ..models_db import Book, Rental
from ..database import get_db

router = APIRouter(tags=["Books"])

@router.get("/")
def get_books(db: Session = Depends(get_db)):
    books = db.query(Book).all()
    return books


@router.put("/{book_id}/reserve")
def reserve_book(
    book_id: int,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user),
):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    if not book.available:
        raise HTTPException(status_code=400, detail="Book already reserved")

    book.available = False


    db.commit()
    db.refresh(book)
    return {"message": f"Book '{book.title}' reserved by {current_user.name}"}