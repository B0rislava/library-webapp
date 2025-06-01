import { useState, useEffect } from "react";
import { useApi } from "./useApi";

export const useBook = (id) => {
  const { authFetch } = useApi();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBook = async () => {
    try {
      setLoading(true);
      const data = await authFetch(`/books/${id}`);
      setBook(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchBook();
  }, [id]);

  return { book, loading, error };
};
