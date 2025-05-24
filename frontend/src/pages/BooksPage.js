import React, { useEffect, useState } from "react";
import { authFetch } from "../utils/authFetch";

function BooksPage() {
  const [books, setBooks] = useState([]);
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  async function handleReserve(bookId) {
    try {
      const response = await authFetch(`http://127.0.0.1:8003/books/${bookId}/reserve`, {
        method: "PUT",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to reserve book");
      }

      const data = await response.json();
      alert(data.message);

      setBooks((prevBooks) =>
        prevBooks.map((book) =>
          book.id === bookId ? { ...book, available: false } : book
        )
      );
    } catch (error) {
      alert("Error: " + error.message);
    }
  }

  function handleEdit(book) {
    alert(`Edit: ${book.title}`);
  }

  function handleAddNewBook() {
    alert("Open Add Book form");
  }

  if (loading) return <p>Loading books...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ maxWidth: "600px", margin: "auto", padding: "20px" }}>
      <h2>Books</h2>
      {userRole === "librarian" && (
        <button onClick={handleAddNewBook} style={{ marginBottom: "20px" }}>
          + Add New Book
        </button>
      )}
      {books.length === 0 ? (
        <p>No books found.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {books.map((book) => (
            <li key={book.id} style={{ borderBottom: "1px solid #ccc", padding: "10px 0" }}>
              <h3>{book.title}</h3>
              <p><strong>Author:</strong> {book.author}</p>
              <p><strong>Year:</strong> {book.year}</p>
              <p><strong>Available:</strong> {book.available ? "Yes" : "No"}</p>

              {userRole && userRole === "user" && book.available && (
                <button onClick={() => handleReserve(book.id)}>Reserve</button>
              )}

              {userRole && userRole === "librarian" && (
                <button onClick={() => handleEdit(book)}>Edit Info</button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default BooksPage;
