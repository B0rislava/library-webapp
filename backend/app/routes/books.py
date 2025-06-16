from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from ..auth import get_current_user, DBUser
from ..models_db import Book, UserBook
from ..database import get_db
from ..schemas.book_schema import UserBookUpdate, UserBookResponse
from typing import List
from ..schemas.book_schema import BookCreate

router = APIRouter(tags=["Books"])


def require_librarian(user: DBUser = Depends(get_current_user)):
    if user.role != "librarian":
        raise HTTPException(
            status_code=403, detail="Only librarians can perform this action"
        )
    return user


@router.get("/")
def get_books(search: str = "", db: Session = Depends(get_db)):
    query = db.query(Book)

    if search:
        search_term = f"%{search.lower()}%"
        query = query.filter(
            (Book.title.ilike(search_term)) | (Book.author.ilike(search_term))
        )

    return query.all()


@router.post("/user-books/{book_id}", response_model=UserBookResponse)
def add_book_to_user_profile(
    book_id: int,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user),
):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    existing = (
        db.query(UserBook)
        .filter(UserBook.user_id == current_user.id, UserBook.book_id == book_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Book already in your profile")

    userbook = UserBook(
        user_id=current_user.id,
        book_id=book_id,
        status="Not started",
        progress=0,
    )
    db.add(userbook)
    db.commit()
    db.refresh(userbook)

    return UserBookResponse(
        book_id=book.id,
        title=book.title,
        author=book.author,
        year=book.year,
        status=userbook.status,
        progress=userbook.progress,
        current_page=userbook.current_page,
        total_pages=userbook.total_pages,
    )


@router.get("/user-books", response_model=List[UserBookResponse])
def get_user_books(
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user),
):
    userbooks = (
        db.query(UserBook)
        .options(joinedload(UserBook.book))
        .filter(UserBook.user_id == current_user.id)
        .all()
    )

    response = []
    # optimize - joined query, relation book = relationship("Book") in UserBook model
    for ub in userbooks:
        book = db.query(Book).filter(Book.id == ub.book_id).first()
        response.append(
            UserBookResponse(
                book_id=book.id,
                title=book.title,
                author=book.author,
                year=book.year,
                status=ub.status,
                progress=ub.progress,
                current_page=ub.current_page,
                total_pages=ub.total_pages,
            )
        )
    return response


@router.put("/user-books/{book_id}", response_model=UserBookResponse)
def update_user_book(
    book_id: int,
    userbook_data: UserBookUpdate,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user),
):
    userbook = (
        db.query(UserBook)
        .filter(UserBook.user_id == current_user.id, UserBook.book_id == book_id)
        .first()
    )
    if not userbook:
        raise HTTPException(status_code=404, detail="Book not found in your profile")

    # Validate total_pages first
    if userbook_data.total_pages is not None:
        if userbook_data.total_pages < 0:
            raise HTTPException(
                status_code=400, detail="Total pages cannot be negative"
            )
        userbook.total_pages = userbook_data.total_pages

    # Then validate current_page
    if userbook_data.current_page is not None:
        if userbook_data.current_page < 0:
            raise HTTPException(
                status_code=400, detail="Current page cannot be negative"
            )
        if (
            userbook.total_pages > 0 and
            userbook_data.current_page > userbook.total_pages
        ):
            raise HTTPException(
                status_code=400,
                detail="Current page cannot be greater than total pages",
            )
        userbook.current_page = userbook_data.current_page

    # Update status based on current_page
    if userbook_data.current_page is not None:
        if userbook_data.current_page == 0:
            userbook.status = "Not started"
        elif userbook_data.current_page >= userbook.total_pages:
            userbook.status = "Finished"
        else:
            userbook.status = "Started"

    # Update progress
    if userbook.total_pages > 0:
        userbook.progress = min(
            100, int((userbook.current_page / userbook.total_pages) * 100)
        )
    else:
        userbook.progress = 0

    db.commit()
    db.refresh(userbook)

    book = db.query(Book).filter(Book.id == book_id).first()

    return UserBookResponse(
        book_id=book.id,
        title=book.title,
        author=book.author,
        year=book.year,
        status=userbook.status,
        progress=userbook.progress,
        current_page=userbook.current_page,
        total_pages=userbook.total_pages,
    )


@router.delete("/user-books/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_book_from_user_profile(
    book_id: int,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user),
):
    userbook = (
        db.query(UserBook)
        .filter(UserBook.user_id == current_user.id, UserBook.book_id == book_id)
        .first()
    )
    if not userbook:
        raise HTTPException(status_code=404, detail="Book not found in your profile")

    db.delete(userbook)
    db.commit()
    return


@router.get("/{book_id}")
def get_book(book_id: int, db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book


# libarians
@router.post("/", dependencies=[Depends(require_librarian)])
def create_book(book: BookCreate, db: Session = Depends(get_db)):
    book_data = book.model_dump()
    new_book = Book(**book_data)
    db.add(new_book)
    db.commit()
    db.refresh(new_book)
    return new_book


@router.put("/{book_id}", dependencies=[Depends(require_librarian)])
def update_book(book_id: int, book: BookCreate, db: Session = Depends(get_db)):
    db_book = db.query(Book).filter(Book.id == book_id).first()
    if not db_book:
        raise HTTPException(status_code=404, detail="Book not found")

    for key, value in book.model_dump().items():
        setattr(db_book, key, value)

    db.commit()
    db.refresh(db_book)
    return db_book


@router.delete(
    "/{book_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_librarian)],
)
def delete_book(book_id: int, db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    try:
        db.query(UserBook).filter(UserBook.book_id == book_id).delete()

        db.delete(book)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    return
