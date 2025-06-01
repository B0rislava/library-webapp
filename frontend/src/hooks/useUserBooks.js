import { useState, useEffect } from 'react';
import { useApi } from './useApi';

export const useUserBooks = () => {
  const { authFetch } = useApi();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUserBooks = async () => {
    try {
      setLoading(true);
      const booksData = await authFetch('/books/user-books');
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
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      setBooks(prev => prev.map(b =>
        b.book_id === bookId ? { ...b, status } : b
      ));
    } catch (err) {
      throw new Error(err.message);
    }
  };

  const updateProgress = async (bookId, currentPage, totalPages) => {
    const progress = totalPages > 0
      ? Math.min(100, Math.round((currentPage / totalPages) * 100))
      : 0;
    const status = progress >= 100 ? 'Finished' : 'Started';

    try {
      await authFetch(`/books/user-books/${bookId}`, {
        method: 'PUT',
        body: JSON.stringify({
          current_page: currentPage,
          total_pages: totalPages,
          progress,
          status
        }),
      });
      setBooks(prev => prev.map(b =>
        b.book_id === bookId ? {
          ...b,
          current_page: currentPage,
          total_pages: totalPages,
          progress,
          status
        } : b
      ));
    } catch (err) {
      throw new Error(err.message);
    }
  };

  const removeBook = async (bookId) => {
    try {
      await authFetch(`/books/user-books/${bookId}`, {
        method: 'DELETE',
      });
      setBooks(prev => prev.filter(b => b.book_id !== bookId));
    } catch (err) {
      throw new Error(err.message);
    }
  };

  const addBook = async (bookId) => {
    try {
      await authFetch(`/books/user-books/${bookId}`, {
        method: 'POST',
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
