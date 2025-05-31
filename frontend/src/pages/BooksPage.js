import React, { useEffect, useState, useRef } from "react";
import { authFetch } from "../utils/authFetch";
import BookModal from "../modals/BookModal/BookModal";
import NotificationModal from "../modals/NotificationModal/NotificationModal";
import LoadingState from "../components/common/LoadingState/LoadingState"
import ErrorState from "../components/common/ErrorState/ErrorState"
import { useNavigate } from "react-router-dom";

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

      <style jsx>{`
        .books-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          min-height: calc(100vh - 4rem);
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          gap: 1rem;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 5px solid rgba(106, 48, 147, 0.2);
          border-radius: 50%;
          border-top: 5px solid #6a3093;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-message {
          text-align: center;
          padding: 2rem;
          color: #e53e3e;
          font-size: 1.2rem;
        }

        .books-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1.5rem;
        }

        .books-header h2 {
          color: #5a3d7a;
          margin: 0;
          font-size: 1.8rem;
        }

        .controls {
          display: flex;
          gap: 1.5rem;
          align-items: center;
        }

        .search-input {
          padding: 0.8rem 1.2rem;
          border: 1px solid #d8b5ff;
          border-radius: 12px;
          min-width: 250px;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          border-color: #a044ff;
          outline: none;
          box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.2);
        }

        .add-btn {
          padding: 0.8rem 1.5rem;
          background: linear-gradient(135deg, #6a3093 0%, #a044ff 100%);
          color: white;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .add-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(106, 48, 147, 0.35);
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #7a5c9a;
          font-size: 1.1rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        }

        .books-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 2rem;
        }

        .book-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .book-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
        }

        .book-cover {
          width: 100%;
          height: 300px;
          object-fit: cover;
          cursor: pointer;
        }

        .book-details {
          padding: 1.2rem;
          flex-grow: 1;
        }

        .book-title {
          margin: 0 0 0.5rem 0;
          font-size: 1.1rem;
          color: #5a3d7a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .book-author {
          margin: 0 0 0.3rem 0;
          font-size: 0.95rem;
          color: #7a5c9a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .book-year {
          margin: 0;
          font-size: 0.85rem;
          color: #9e8fb5;
        }

        .action-btn {
          margin: 0 1.2rem 1.2rem;
          padding: 0.7rem;
          border: none;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .edit-btn {
          background: linear-gradient(135deg, #a044ff 0%, #6a3093 100%);
          color: white;
        }

        .add-btn {
          background: linear-gradient(135deg, #ff9e6a 0%, #ff7e33 100%);
          color: white;
        }

        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
        }

        @media (max-width: 768px) {
          .books-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .controls {
            width: 100%;
            flex-direction: column;
            align-items: stretch;
          }

          .search-input {
            width: 100%;
            min-width: auto;
          }
        }
      `}</style>
    </div>
  );
}

export default BooksPage;