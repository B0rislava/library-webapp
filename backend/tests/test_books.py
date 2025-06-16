import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import get_db
from app.models_db import Base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_library.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def auth_headers():
    # Register a user with librarian role
    response = client.post(
        "/auth/signup",
        json={
            "name": "Test Librarian",
            "email": "librarian@example.com",
            "password": "testpassword123",
            "role": "librarian",
        },
    )
    print("Librarian registration response:", response.json())
    assert response.status_code == 200

    # Login to get the token
    response = client.post(
        "/auth/signin",
        json={"email": "librarian@example.com", "password": "testpassword123"},
    )
    print("Librarian login response:", response.json())
    assert response.status_code == 200
    data = response.json()
    return {"Authorization": f"Bearer {data['access_token']}"}


def test_create_book(auth_headers):
    response = client.post(
        "/books/",
        json={
            "title": "Test Book",
            "author": "Test Author",
            "year": 2024,
            "description": "A test book description",
            "cover_url": "https://example.com/cover.jpg",
            "pdf_url": "https://example.com/book.pdf",
        },
        headers=auth_headers,
    )
    print("Create book response:", response.json())
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Book"
    assert data["author"] == "Test Author"
    assert data["description"] == "A test book description"
    assert data["cover_url"] == "https://example.com/cover.jpg"
    assert data["pdf_url"] == "https://example.com/book.pdf"


def test_get_books(auth_headers):
    # First create a book
    client.post(
        "/books/",
        json={
            "title": "Test Book",
            "author": "Test Author",
            "year": 2024,
            "description": "A test book description",
            "cover_url": "https://example.com/cover.jpg",
            "pdf_url": "https://example.com/book.pdf",
        },
        headers=auth_headers,
    )

    # Then get all books
    response = client.get("/books/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert data[0]["title"] == "Test Book"


def test_get_book_by_id(auth_headers):
    # First create a book
    create_response = client.post(
        "/books/",
        json={
            "title": "Test Book",
            "author": "Test Author",
            "year": 2024,
            "description": "A test book description",
            "cover_url": "https://example.com/cover.jpg",
            "pdf_url": "https://example.com/book.pdf",
        },
        headers=auth_headers,
    )
    book_id = create_response.json()["id"]

    # Then get the book by ID
    response = client.get(f"/books/{book_id}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Book"
    assert data["id"] == book_id


def test_update_book(auth_headers):
    # First create a book
    create_response = client.post(
        "/books/",
        json={
            "title": "Test Book",
            "author": "Test Author",
            "year": 2024,
            "description": "A test book description",
            "cover_url": "https://example.com/cover.jpg",
            "pdf_url": "https://example.com/book.pdf",
        },
        headers=auth_headers,
    )
    book_id = create_response.json()["id"]

    # Then update the book
    response = client.put(
        f"/books/{book_id}",
        json={
            "title": "Updated Book",
            "author": "Updated Author",
            "year": 2024,
            "description": "An updated test book description",
            "cover_url": "https://example.com/updated-cover.jpg",
            "pdf_url": "https://example.com/updated-book.pdf",
        },
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Book"
    assert data["author"] == "Updated Author"
    assert data["description"] == "An updated test book description"
    assert data["cover_url"] == "https://example.com/updated-cover.jpg"
    assert data["pdf_url"] == "https://example.com/updated-book.pdf"
