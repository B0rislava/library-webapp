import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import BookModal from "../modals/BookModal/BookModal";
import NotificationModal from "../modals/NotificationModal/NotificationModal";
import ConfirmationModal from "../modals/ConfirmationModal/ConfirmationModal";
import LoadingState from "../components/common/LoadingState/LoadingState";
import ErrorState from "../components/common/ErrorState/ErrorState";
import { useUser } from "../hooks/useUser";
import { useBooks } from "../hooks/useBooks";
import { useUserBooks } from "../hooks/useUserBooks";
import { useNotification } from "../hooks/useNotification";
import { useApi } from "../hooks/useApi";
import "../styles/BooksPage.css";

function BooksPage() {
  const navigate = useNavigate();
  const { user, loading: userLoading } = useUser();
  const { books, loading, error, fetchBooks, deleteBook } = useBooks();
  const { addBook } = useUserBooks();
  const { notification, showNotification, closeNotification } = useNotification();
  const { authFetch } = useApi();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedBook, setSelectedBook] = useState(null);
  const [formData, setFormData] = useState({ title: "", author: "", year: "", description: "", cover_url: "", pdf_url: "" });

  const [query, setQuery] = useState("");
  const debounceTimeout = useRef(null);
  const searchInputRef = useRef(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);

  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      fetchBooks(query);
      searchInputRef.current?.focus();
    }, 500);

    return () => clearTimeout(debounceTimeout.current);
  }, [query]);

  async function handleSubmitBook(data) {
    try {
      const method = modalMode === "edit" ? "PUT" : "POST";
      const url = modalMode === "edit" ? `/books/${selectedBook.id}` : "/books/";

      await authFetch(url, {
        method,
        body: JSON.stringify(data),
      });

      showNotification(modalMode === "edit" ? "Book updated!" : "Book added!");
      fetchBooks();
      handleCloseModal();
    } catch (err) {
      showNotification("Error: " + err.message, true);
    }
  }

  async function confirmDeleteBook() {
    try {
      const success = await deleteBook(bookToDelete.id);
      if (success) {
        showNotification("Book deleted successfully!");
        fetchBooks();
      }
    } catch (err) {
      showNotification("Error: " + err.message, true);
    } finally {
      setShowConfirmModal(false);
      setBookToDelete(null);
    }
  }

  async function handleAddToLibrary(bookId) {
    try {
      await addBook(bookId);
      showNotification("Book added to your library!");
    } catch (err) {
      const message = err.message.includes("400")
        ? "This book is already in your library."
        : err.message;
      showNotification("Error: " + message, true);
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
      pdf_url: book.pdf_url,
    });
    setModalMode("edit");
    setModalOpen(true);
  }

  function handleDeleteClick(book) {
    setBookToDelete(book);
    setShowConfirmModal(true);
  }

  function handleAddNewBook() {
    setSelectedBook(null);
    setFormData({ title: "", author: "", year: "", description: "", cover_url: "", pdf_url: "" });
    setModalMode("add");
    setModalOpen(true);
  }

  function handleCloseModal() {
    setModalOpen(false);
    setSelectedBook(null);
  }

  if (loading || userLoading) return <LoadingState />;
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
          {user?.role === "librarian" && (
            <button onClick={handleAddNewBook} className="add-btn">
              + Add New Book
            </button>
          )}
        </div>
      </div>

      {books.length === 0 ? (
        <div className="empty-state">
          <p>No books found. {user?.role === "librarian" && "Try adding a new book!"}</p>
        </div>
      ) : (
        <div className="books-grid">
          {books.map((book) => (
            <div key={book.id} className="book-card">
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

              <div className="book-actions">
                {user?.role === "librarian" ? (
                  <>
                    <button
                      onClick={() => handleEdit(book)}
                      className="action-btn edit-btn"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(book)}
                      className="action-btn delete-btn"
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleAddToLibrary(book.id)}
                    className="action-btn add-to-library-btn"
                  >
                    Add to Library
                  </button>
                )}
              </div>
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

      <ConfirmationModal
        show={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmDeleteBook}
        title="Delete Book"
      >
        Are you sure you want to delete this book?
      </ConfirmationModal>
    </div>
  );
}

export default BooksPage;
