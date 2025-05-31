import { authFetch } from "../utils/authFetch";

export const getBookById = async (id) => {
  const response = await authFetch(`http://127.0.0.1:8003/books/${id}`);
  if (!response.ok) throw new Error("Book not found");
  return await response.json();
};
