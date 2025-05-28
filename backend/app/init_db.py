from .database import Base, engine, SessionLocal
from .models_db import User, Book

def init_db():
    Base.metadata.create_all(bind=engine)

def seed_books():
    db = SessionLocal()
    books = [
        {
            "title": "Romeo and Juliet",
            "author": "William Shakespeare",
            "year": 1998,
            "isbn": "9781844669363",
            "cover_url": "https://m.media-amazon.com/images/I/61LQf6GWT4L.jpg",
            "pdf_url": "https://www.pdfbooksworld.com/bibi/pre.html?book=52.epub"
        },
        {
            "title": "The Call Of The Wild",
            "author": "Jack London",
            "year": 1960,
            "isbn": "9780060888695",
            "cover_url": "https://www.pdfbooksworld.com/image/cache/catalog/51-250x350.jpg",
            "pdf_url": "https://www.pdfbooksworld.com/bibi/pre.html?book=51.epubb"
        },
        {
            "title": "The Adventures of Sherlock Holmes",
            "author": "Arthur Conan Doyle",
            "year": 1925,
            "isbn": "9783257691078",
            "cover_url": "https://www.pdfbooksworld.com/image/cache/catalog/54-250x350.jpg",
            "pdf_url": "https://www.pdfbooksworld.com/bibi/pre.html?book=54.epub"
        },
    ]

    for b in books:
        existing = db.query(Book).filter(Book.title == b["title"]).first()
        if not existing:
            book = Book(**b)
            db.add(book)

    db.commit()
    db.close()
