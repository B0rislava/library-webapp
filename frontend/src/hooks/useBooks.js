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
      const url = searchQuery ? `/books?search=${searchQuery}` : "/books/";
      const data = await authFetch(url);
      setBooks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [authFetch]); // authFetch as dependency

  useEffect(() => {
    fetchBooks();
  }, []); // Empty dependency array is safe now

  return { books, loading, error, fetchBooks };
};