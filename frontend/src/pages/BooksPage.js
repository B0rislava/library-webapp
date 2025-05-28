import React, { useEffect, useState, useRef } from "react";
import { authFetch } from "../utils/authFetch";
import BookModal from "../utils/BookModal";
import { useNavigate } from "react-router-dom";



function BooksPage() {
  const [books, setBooks] = useState([]);
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' or 'edit'
  const [selectedBook, setSelectedBook] = useState(null);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    year: "",
    isbn: "",
    cover_url: "",
  });

  const [query, setQuery] = useState("");
  const debounceTimeout = useRef(null);

  useEffect(() => {
    async function fetchBooks() {
      try {
        const resBooks = await authFetch("http://127.0.0.1:8003/books/");
        const resUser = await authFetch("http://127.0.0.1:8003/users/me");

        if (!resBooks.ok || !resUser.ok) {
          throw new Error("Failed to fetch data");
        }

        const booksData = await resBooks.json();
        const userData = await resUser.json();

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
  //if theres a timeout already - clear it
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    //make new timeout after 500ms
    debounceTimeout.current = setTimeout(() => {
      handleSearch(query);
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

      const response = await authFetch(`http://127.0.0.1:8003/books?search=${encodeURIComponent(searchQuery)}`);
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
      alert(modalMode === "edit" ? "Book updated!" : "Book added!");

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
        isbn: "",
      });
    } catch (err) {
      alert("Error: " + err.message);
    }
  }

  async function handleAddToLibrary(bookId) {
    try {
      const response = await authFetch(`http://127.0.0.1:8003/books/user-books/${bookId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: null,
      });

      if (response.ok) {
        alert("Book added to your library!");
      } else if (response.status === 400) {
        alert("This book is already in your library.");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error adding book");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  }

  function handleEdit(book) {
    setSelectedBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      year: book.year,
      isbn: book.isbn,
      cover_url: book.cover_url || "",
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
      isbn: "",
    });
    setModalMode("add");
    setModalOpen(true);
  }

  function handleCloseModal() {
    setModalOpen(false);
    setSelectedBook(null);
  }

  if (loading) return <p>Loading books...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ maxWidth: "600px", margin: "auto", padding: "20px" }}>
      <h2>Books</h2>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search by title or author"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ marginRight: "10px" }}
        />
      </div>

      {userRole === "librarian" && (
        <button onClick={handleAddNewBook} style={{ marginBottom: "20px" }}>
          + Add New Book
        </button>
      )}

      {books.length === 0 ? (
        <p>No books found.</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
          {books.map((book) => (
            <div
              key={book.id}
              style={{
                width: "150px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "10px",
                textAlign: "center",
                boxShadow: "2px 2px 6px rgba(0,0,0,0.1)",
              }}
            >
              <img
                src={book.cover_url || "https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg"}
                alt={book.title}
                style={{ width: "120px", height: "160px", objectFit: "cover", marginBottom: "10px" }}
                onClick={() => navigate(`/books/${book.id}`)}
              />
              <div style={{ fontWeight: "bold", fontSize: "16px", marginBottom: "5px" }}>
                {book.title}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#555" }}>
                <span>{book.author}</span>
                <span>{book.year}</span>
              </div>
              <div style={{ marginTop: "10px" }}>
                {userRole === "librarian" ? (
                  <button onClick={() => handleEdit(book)}>Edit</button>
                ) : (
                  <button onClick={() => handleAddToLibrary(book.id)}>Add</button>
                )}
              </div>
            </div>
          ))}
        </div>

      )}

      {/* Book Modal */}
      <BookModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        book={selectedBook}
        onSubmit={handleSubmitBook}
        isEdit={modalMode === "edit"}
        formData={formData}
        setFormData={setFormData}
      />
    </div>
  );
}

export default BooksPage;
