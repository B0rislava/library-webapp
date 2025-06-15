import { useState, useEffect } from "react";
import { useApi } from "./useApi";

export const useUserBooks = () => {
  const { authFetch } = useApi();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUserBooks = async () => {
    try {
      setLoading(true);
      const booksData = await authFetch("/books/user-books");
      setBooks(booksData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (bookId, status) => {
    try {
      await authFetch(`/books/user-books/${bookId}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      setBooks((prev) =>
        prev.map((b) => (b.book_id === bookId ? { ...b, status } : b))
      );
    } catch (err) {
      throw new Error(err.message);
    }
  };

  const updateProgress = async (bookId, currentPage, totalPages) => {
    // Convert inputs to numbers
    const currentPageNum = Number(currentPage);
    const totalPagesNum = Number(totalPages);

    // Validate inputs
    if (totalPagesNum < 0) {
      throw new Error("Total pages cannot be negative");
    }
    if (currentPageNum < 0) {
      throw new Error("Current page cannot be negative");
    }
    if (totalPagesNum > 0 && currentPageNum > totalPagesNum) {
      throw new Error("Current page cannot be greater than total pages");
    }

    // Calculate progress and status
    const progress =
      totalPagesNum > 0
        ? Math.min(100, Math.round((currentPageNum / totalPagesNum) * 100))
        : 0;

    let status;
    if (currentPageNum === 0) {
      status = "Not started";
    } else if (currentPageNum >= totalPagesNum) {
      status = "Finished";
    } else {
      status = "Started";
    }

    try {
      await authFetch(`/books/user-books/${bookId}`, {
        method: "PUT",
        body: JSON.stringify({
          current_page: currentPageNum,
          total_pages: totalPagesNum,
          progress,
          status,
        }),
      });
      setBooks((prev) =>
        prev.map((b) =>
          b.book_id === bookId
            ? {
                ...b,
                current_page: currentPageNum,
                total_pages: totalPagesNum,
                progress,
                status,
              }
            : b
        )
      );
    } catch (err) {
      throw new Error(err.message);
    }
  };

  const removeBook = async (bookId) => {
    try {
      await authFetch(`/books/user-books/${bookId}`, {
        method: "DELETE",
      });
      setBooks((prev) => prev.filter((b) => b.book_id !== bookId));
    } catch (err) {
      throw new Error(err.message);
    }
  };

  const addBook = async (bookId) => {
    try {
      await authFetch(`/books/user-books/${bookId}`, {
        method: "POST",
      });
      await fetchUserBooks();
    } catch (err) {
      throw new Error(err.message);
    }
  };

  useEffect(() => {
    fetchUserBooks();
  }, []);

  return {
    books,
    loading,
    error,
    fetchUserBooks,
    updateStatus,
    updateProgress,
    removeBook,
    addBook,
  };
};
