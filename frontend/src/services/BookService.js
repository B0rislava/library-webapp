import { authFetch } from "../utils/authFetch";

export const getBookById = async (id) => {
  const response = await authFetch(`http://127.0.0.1:8003/books/${id}`);
  if (!response.ok) throw new Error("Book not found");
  return await response.json();
};

export const BookService = {
  async fetchBooks() {
    const response = await authFetch("http://127.0.0.1:8003/books/");
    if (!response.ok) throw new Error("Failed to fetch books");
    return await response.json();
  },

  async searchBooks(query) {
    const response = await authFetch(
      `http://127.0.0.1:8003/books?search=${encodeURIComponent(query)}`
    );
    if (!response.ok) throw new Error("Failed to search books");
    return await response.json();
  },

  async saveBook(book, isEdit = false) {
    const method = isEdit ? "PUT" : "POST";
    const url = isEdit
      ? `http://127.0.0.1:8003/books/${book.id}`
      : "http://127.0.0.1:8003/books/";

    const response = await authFetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(book),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        typeof errorData.detail === "string"
          ? errorData.detail
          : JSON.stringify(errorData.detail || errorData)
      );
    }

    return await response.json();
  },

  async addToLibrary(bookId) {
    const response = await authFetch(
      `http://127.0.0.1:8003/books/user-books/${bookId}`,
      { method: "POST" }
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Error adding book");
    }
  }
};