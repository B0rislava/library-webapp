import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { authFetch } from "../utils/authFetch";

function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchBook() {
      try {
        const response = await authFetch(`http://127.0.0.1:8003/books/${id}`);
        if (!response.ok) throw new Error("Book not found");
        const data = await response.json();
        setBook(data);
      } catch (err) {
        setError(err.message);
      }
    }

    fetchBook();
  }, [id]);

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!book) return <p>Loading book...</p>;

return (
  <div style={{ maxWidth: "800px", margin: "auto", padding: "20px" }}>
    <h2>{book.title}</h2>
    <img
      src={book.cover_url || "https://via.placeholder.com/200x300?text=No+Cover"}
      alt={book.title}
      style={{ width: "200px", height: "300px", objectFit: "cover", marginBottom: "20px" }}
    />
    <p><strong>Author:</strong> {book.author}</p>
    <p><strong>Year:</strong> {book.year}</p>
    <p><strong>ISBN:</strong> {book.isbn}</p>

    {book.pdf_url && (
      <p>
        <a href={book.pdf_url} target="_blank" rel="noopener noreferrer">
          📄 Read eBook
        </a>
      </p>
    )}
  </div>
);

}

export default BookDetail;
