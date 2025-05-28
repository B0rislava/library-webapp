import React, { useState, useEffect } from "react";
import { authFetch } from "../utils/authFetch";

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const [userBooks, setUserBooks] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authFetch("http://127.0.0.1:8003/users/me");
        if (!response.ok) throw new Error("Failed to fetch user data");
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    async function fetchUserBooks() {
      try {
        const response = await authFetch(
          "http://127.0.0.1:8003/books/user-books",
        );
        if (!response.ok) throw new Error("Failed to fetch user books");
        const data = await response.json();
        setUserBooks(data);
      } catch (error) {
        console.error("Error fetching user books:", error);
      }
    }

    if (user) fetchUserBooks();
  }, [user]);

  useEffect(() => {
    if (editing && user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: "",
      });
    }
  }, [editing, user]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await authFetch("http://127.0.0.1:8003/users/update", {
        method: "PUT",
        body: JSON.stringify(formData),
      });

      const text = await response.text();

      if (response.status === 401) {
        localStorage.removeItem("token");
        alert("Session expired. Please log in again.");
        window.location.href = "/signin";
        return;
      }

      if (!response.ok) throw new Error(text);

      const updatedUser = JSON.parse(text);
      setUser(updatedUser);
      setEditing(false);
    } catch (error) {
      console.error("Server error:", error.message);
      alert(`Error updating profile: ${error.message}`);
    }
  };

  const handleDelete = async () => {
    await authFetch("http://127.0.0.1:8003/users/delete", {
      method: "DELETE",
    });
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/";
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/";
  };

  const handleRemoveBook = async (bookId) => {
    try {
      const response = await authFetch(
        `http://127.0.0.1:8003/books/user-books/${bookId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) throw new Error("Failed to remove Book");

      setUserBooks((prevBooks) =>
        prevBooks.filter((book) => book.book_id !== bookId),
      );
    } catch (error) {
      console.error("Error removing book:", error);
      alert("Failed to remove Book");
    }
  };

  const handleStatusChange = async (bookId, newStatus) => {
    console.log("Changing status to:", newStatus);
    try {
      await authFetch(`http://127.0.0.1:8003/books/user-books/${bookId}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });

      setUserBooks((prevBooks) =>
        prevBooks.map((book) =>
          book.book_id === bookId ? { ...book, status: newStatus } : book,
        ),
      );
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const handleProgressChange = async (bookId, newProgress) => {
    try {
      await authFetch(`http://127.0.0.1:8003/books/user-books/${bookId}`, {
        method: "PUT",
        body: JSON.stringify({ progress: parseInt(newProgress) }),
      });

      setUserBooks((prevBooks) =>
        prevBooks.map((book) =>
          book.book_id === bookId
            ? { ...book, progress: parseInt(newProgress) }
            : book,
        ),
      );
    } catch (error) {
      console.error("Error updating progress:", error);
      alert("Failed to update progress");
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: "600px", margin: "auto" }}>
      <h2>Profile</h2>
      {!editing ? (
        <>
          <p>
            <strong>Name:</strong> {user.name}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>

          <h3>Your books:</h3>
          {userBooks.length === 0 ? (
            <p>You have no added books.</p>
          ) : (
            <ul>
              {userBooks.map((book) => (
                <li key={book.book_id} style={{ marginBottom: "20px" }}>
                  <div>
                    <strong>{book.title}</strong> by {book.author} ({book.year})
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "15px",
                      marginTop: "5px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <label>Status: </label>
                      <select
                        value={book.status}
                        onChange={(e) =>
                          handleStatusChange(book.book_id, e.target.value)
                        }
                      >
                        <option value="Not started">Not started</option>
                        <option value="Started">Started</option>
                        <option value="Finished">Finished</option>
                      </select>
                    </div>

                    {book.status === "Started" && (
                      <div>
                        <label>Progress: </label>
                        <input
                          type="number"
                          value={book.progress}
                          min="0"
                          style={{ width: "30px" }}
                          onChange={(e) =>
                            handleProgressChange(book.book_id, e.target.value)
                          }
                        />
                      </div>
                    )}

                    <button
                      style={{ color: "red", height: "fit-content" }}
                      onClick={() => handleRemoveBook(book.book_id)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <button onClick={() => setEditing(true)}>Edit Profile</button>
          <button onClick={handleLogout} style={{ marginLeft: "10px" }}>
            Logout
          </button>
          <button
            onClick={() => setShowConfirm(true)}
            style={{ color: "red", marginLeft: "10px" }}
          >
            Delete Profile
          </button>
        </>
      ) : (
        <form onSubmit={handleEditSubmit}>
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
          <input
            type="password"
            placeholder="New Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
          <button type="submit">Save</button>
          <button type="button" onClick={() => setEditing(false)}>
            Cancel
          </button>
        </form>
      )}

      {showConfirm && (
        <div>
          <p>Are you sure you want to delete your profile?</p>
          <button onClick={handleDelete}>Yes, delete</button>
          <button onClick={() => setShowConfirm(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
