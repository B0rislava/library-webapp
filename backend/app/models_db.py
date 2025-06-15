from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from enum import Enum
from sqlalchemy import Enum as SqlEnum
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, nullable=False)

    user_books = relationship("UserBook", back_populates="user")


class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    author = Column(String)
    year = Column(Integer)
    description = Column(String, nullable=True)
    cover_url = Column(String, nullable=True)
    pdf_url = Column(String, nullable=True)

    book_users = relationship("UserBook", back_populates="book")


class ReadingStatus(str, Enum):
    unread = "Not started"
    reading = "Started"
    read = "Finished"


class UserBook(Base):
    __tablename__ = "user_books"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    book_id = Column(Integer, ForeignKey("books.id"))
    status = Column(SqlEnum(ReadingStatus), default=ReadingStatus.unread)
    progress = Column(Integer, default=0)
    current_page = Column(Integer, default=0)
    total_pages = Column(Integer, default=0)

    user = relationship("User", back_populates="user_books")
    book = relationship("Book", back_populates="book_users")
