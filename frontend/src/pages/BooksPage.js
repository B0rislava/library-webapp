import React, { useEffect, useState } from "react";

function BooksPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchBooks() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://127.0.0.1:8002/books/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch books");
        }
        const data = await response.json();
        setBooks(data);
      } catch (err) {
        setError(err.message || "Error fetching books");
      } finally {
        setLoading(false);
      }
    }

    fetchBooks();
  }, []);

  async function handleReserve(bookId) {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://127.0.0.1:8002/books/${bookId}/reserve`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
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

  if (loading) return <p>Loading books...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ maxWidth: "600px", margin: "auto", padding: "20px" }}>
      <h2>Available Books</h2>
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
              {book.available && (
                <button onClick={() => handleReserve(book.id)}>Reserve</button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default BooksPage;
