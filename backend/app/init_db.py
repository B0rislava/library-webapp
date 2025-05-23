from .database import Base, engine, SessionLocal
from .models_db import User, Book

def init_db():
    Base.metadata.create_all(bind=engine)

def seed_books():
    db = SessionLocal()
    books = [
        {"title": "1984", "author": "George Orwell", "year": 1949, "available": True},
        {"title": "To Kill a Mockingbird", "author": "Harper Lee", "year": 1960, "available": True},
        {"title": "The Great Gatsby", "author": "F. Scott Fitzgerald", "year": 1925, "available": True},
    ]

    for b in books:
        existing = db.query(Book).filter(Book.title == b["title"]).first()
        if not existing:
            book = Book(**b)
            db.add(book)

    db.commit()
    db.close()