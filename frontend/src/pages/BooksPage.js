import React, { useEffect, useState, useRef } from "react";
import { authFetch } from "../utils/authFetch";
import BookModal from "../modals/BookModal/BookModal";
import NotificationModal from "../modals/NotificationModal/NotificationModal";
import LoadingState from "../components/common/LoadingState/LoadingState"
import ErrorState from "../components/common/ErrorState/ErrorState"
import { useNavigate } from "react-router-dom";
import "../styles/BooksPage.css";

function BooksPage() {
  const [books, setBooks] = useState([]);
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedBook, setSelectedBook] = useState(null);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    year: "",
    description: "",
    cover_url: "",
  });

  const [query, setQuery] = useState("");
  const debounceTimeout = useRef(null);
  const searchInputRef = useRef(null);

  const [notification, setNotification] = useState({
    open: false,
    message: "",
    isError: false,
  });

  function showNotification(message, isError = false) {
    setNotification({ open: true, message, isError });
  }

  function closeNotification() {
    setNotification({ ...notification, open: false });
  }

  useEffect(() => {
    async function fetchBooks() {
      try {
        const [resBooks, resUser] = await Promise.all([
          authFetch("http://127.0.0.1:8003/books/"),
          authFetch("http://127.0.0.1:8003/users/me")
        ]);

        if (!resBooks.ok || !resUser.ok) {
          throw new Error("Failed to fetch data");
        }

        const [booksData, userData] = await Promise.all([
          resBooks.json(),
          resUser.json()
        ]);

        setBooks(booksData);
        setUserRole(userData.role);
      } catch (err) {
        setError(err.message || "Error loading data");
      } finally {
        setLoading(false);
      }
    }

    fetchBooks();
  }, []);

  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      handleSearch(query);
      searchInputRef.current?.focus();
    }, 500);

    return () => clearTimeout(debounceTimeout.current);
  }, [query]);

  async function handleSearch(searchQuery) {
    try {
      if (!searchQuery.trim()) {
        setLoading(true);
        const resBooks = await authFetch("http://127.0.0.1:8003/books/");
        if (!resBooks.ok) throw new Error("Failed to fetch books");
        const booksData = await resBooks.json();
        setBooks(booksData);
        setLoading(false);
        setError("");
        return;
      }

      const response = await authFetch(
        `http://127.0.0.1:8003/books?search=${encodeURIComponent(searchQuery)}`
      );
      if (!response.ok) throw new Error("Failed to search books");

      const data = await response.json();
      setBooks(data);
      setError("");
    } catch (error) {
      console.error("Search error:", error);
      setError(error.message);
    }
  }

  async function handleSubmitBook(data) {
    try {
      const method = modalMode === "edit" ? "PUT" : "POST";
      const url =
        modalMode === "edit"
          ? `http://127.0.0.1:8003/books/${selectedBook.id}`
          : "http://127.0.0.1:8003/books/";

      const response = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          typeof errorData.detail === "string"
            ? errorData.detail
            : JSON.stringify(errorData.detail || errorData)
        );
      }

      const updatedBook = await response.json();
      showNotification(modalMode === "edit" ? "Book updated!" : "Book added!");

      if (modalMode === "edit") {
        setBooks((prevBooks) =>
          prevBooks.map((book) => (book.id === updatedBook.id ? updatedBook : book))
        );
      } else {
        setBooks((prevBooks) => [...prevBooks, updatedBook]);
      }

      setModalOpen(false);
      setSelectedBook(null);
      setFormData({
        title: "",
        author: "",
        year: "",
        cover_url: "",
        description: "",
      });
    } catch (err) {
      showNotification("Error: " + err.message, true);
    }
  }

  async function handleAddToLibrary(bookId) {
    try {
      const response = await authFetch(
        `http://127.0.0.1:8003/books/user-books/${bookId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: null,
        }
      );

      if (response.ok) {
        showNotification("Book added to your library!");
      } else if (response.status === 400) {
        showNotification("This book is already in your library.", true);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error adding book");
      }
    } catch (err) {
      showNotification("Error: " + err.message, true);
    }
  }

  function handleEdit(book) {
    setSelectedBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      year: book.year,
      cover_url: book.cover_url || "",
      description: book.description,
      pdf_url: book.pdf_url
    });
    setModalMode("edit");
    setModalOpen(true);
  }

  function handleAddNewBook() {
    setSelectedBook(null);
    setFormData({
      title: "",
      author: "",
      year: "",
      description: "",
      cover_url: "",
    });
    setModalMode("add");
    setModalOpen(true);
  }

  function handleCloseModal() {
    setModalOpen(false);
    setSelectedBook(null);
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="books-container">
      <div className="books-header">
        <h2>Books Collection</h2>

        <div className="controls">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search by title or author..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
          />

          {userRole === "librarian" && (
            <button
              onClick={handleAddNewBook}
              className="add-btn"
            >
              + Add New Book
            </button>
          )}
        </div>
      </div>

      {books.length === 0 ? (
        <div className="empty-state">
          <p>No books found. {userRole === "librarian" && "Try adding a new book!"}</p>
        </div>
      ) : (
        <div className="books-grid">
          {books.map((book) => (
            <div
              key={book.id}
              className="book-card"
            >
              <img
                src={book.cover_url || "https://via.placeholder.com/150x200?text=No+Cover"}
                alt={book.title}
                className="book-cover"
                onClick={() => navigate(`/books/${book.id}`)}
              />
              <div className="book-details">
                <h3 className="book-title">{book.title}</h3>
                <p className="book-author">{book.author}</p>
                <p className="book-year">{book.year}</p>
              </div>

              <button
                onClick={() => userRole === "librarian" ? handleEdit(book) : handleAddToLibrary(book.id)}
                className={`action-btn ${userRole === "librarian" ? 'edit-btn' : 'add-btn'}`}
              >
                {userRole === "librarian" ? "Edit" : "Add to Library"}
              </button>
            </div>
          ))}
        </div>
      )}

      <BookModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        book={selectedBook}
        onSubmit={handleSubmitBook}
        isEdit={modalMode === "edit"}
        formData={formData}
        setFormData={setFormData}
      />

      <NotificationModal
        isOpen={notification.open}
        onClose={closeNotification}
        message={notification.message}
        isError={notification.isError}
      />
    </div>
  );
}

export default BooksPage;