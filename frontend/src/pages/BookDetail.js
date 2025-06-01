import React from "react";
import { useParams } from "react-router-dom";
import LoadingState from "../components/common/LoadingState/LoadingState";
import ErrorState from "../components/common/ErrorState/ErrorState";
import { useBook } from "../hooks/useBook";
import "../styles/BookDetail.css";

const BookCover = ({ coverUrl, title }) => (
  <img
    src={coverUrl || "https://via.placeholder.com/200x300?text=No+Cover"}
    alt={title}
    className="bookCover"
    loading="lazy"
  />
);

const BookMetadata = ({ title, author, year, pdfUrl }) => (
  <div className="bookMetadata">
    <h2 className="bookTitle">{title}</h2>
    <p className="bookAuthor"><strong>Author:</strong> {author}</p>
    <p className="bookYear"><strong>Year:</strong> {year}</p>
    {pdfUrl && (
      <a
        href={pdfUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="readButton"
      >
        Read eBook
      </a>
    )}
  </div>
);

const BookDescription = ({ description }) => (
  <div className="descriptionContainer">
    <h3 className="descriptionTitle">Description</h3>
    <p className="descriptionText">{description || "No description available."}</p>
  </div>
);

function BookDetail() {
  const { id } = useParams();
  const { book, loading, error } = useBook(id);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (!book) return <ErrorState error="Book not found" />;

  return (
    <div className="bookDetailContainer">
      <div className="bookContent">
        <BookCover coverUrl={book.cover_url} title={book.title} />
        <BookMetadata
          title={book.title}
          author={book.author}
          year={book.year}
          pdfUrl={book.pdf_url}
        />
      </div>
      <BookDescription description={book.description} />
    </div>
  );
}

export default BookDetail;
