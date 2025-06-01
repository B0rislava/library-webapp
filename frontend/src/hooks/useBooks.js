import { useState, useEffect, useCallback } from "react";
import { useApi } from "./useApi";

export const useBooks = () => {
  const { authFetch } = useApi();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBooks = useCallback(async (searchQuery = "") => {
    setLoading(true);
    try {
      const url = searchQuery ? `/books/?search=${searchQuery}` : "/books/";
      const data = await authFetch(url);
      setBooks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  const deleteBook = useCallback(async (bookId) => {
    try {
      await authFetch(`/books/${bookId}`, {
        method: "DELETE",
      });
      setBooks(prevBooks => prevBooks.filter(book => book.id !== bookId));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, [authFetch]);

  useEffect(() => {
    fetchBooks();
  }, []);

  return { books, loading, error, fetchBooks, deleteBook };
};