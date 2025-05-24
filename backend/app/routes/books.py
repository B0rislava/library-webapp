from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from ..auth import get_current_user, DBUser
from ..models_db import Book, Rental
from ..database import get_db
from ..schemas.book_schema import Book as BookSchema

router = APIRouter(tags=["Books"])

def require_librarian(user: DBUser = Depends(get_current_user)):
    if user.role != "librarian":
        raise HTTPException(status_code=403, detail="Only librarians can perform this action")
    return user

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
    rental = Rental(user_id=current_user.id, book_id=book.id)
    db.add(rental)

    db.commit()
    db.refresh(book)
    return {"message": f"Book '{book.title}' reserved by {current_user.name}"}



@router.get("/user-books")
def get_user_books(
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user),
):
    rentals = db.query(Rental).filter(Rental.user_id == current_user.id).all()
    books = [rental.book for rental in rentals]
    return books



@router.delete("/{book_id}/cancel")
def cancel_reservation(
    book_id: int,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user),
):
    rental = db.query(Rental).filter(
        Rental.book_id == book_id,
        Rental.user_id == current_user.id
    ).first()
    if not rental:
        raise HTTPException(status_code=404, detail="Reservation not found")

    book = db.query(Book).filter(Book.id == book_id).first()
    if book:
        book.available = True

    db.delete(rental)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)



# libarians
@router.post("/", dependencies=[Depends(require_librarian)])
def create_book(book: BookSchema, db: Session = Depends(get_db)):
    new_book = Book(**book.model_dump(), available=True)
    db.add(new_book)
    db.commit()
    db.refresh(new_book)
    return new_book


@router.put("/{book_id}", dependencies=[Depends(require_librarian)])
def update_book(book_id: int, book: BookSchema, db: Session = Depends(get_db)):
    db_book = db.query(Book).filter(Book.id == book_id).first()
    if not db_book:
        raise HTTPException(status_code=404, detail="Book not found")

    for key, value in book.model_dump().items():
        setattr(db_book, key, value)

    db.commit()
    db.refresh(db_book)
    return db_book