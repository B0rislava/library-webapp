import React, { useState, useEffect } from "react";
import { authFetch } from "../utils/authFetch";

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [showConfirm, setShowConfirm] = useState(false);
  const [userBooks, setUserBooks] = useState([]);  // <-- добавено

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authFetch("http://127.0.0.1:8003/users/me");
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
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
      const response = await authFetch("http://127.0.0.1:8003/books/user-books");
      if (!response.ok) throw new Error("Failed to fetch user books");
      const data = await response.json();
      setUserBooks(data);
    } catch (error) {
      console.error("Error fetching user books:", error);
    }
  }

  if (user) {
    fetchUserBooks();
  }
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

      if (!response.ok) {
        throw new Error(text);
      }

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


  const handleCancelReservation = async (bookId) => {
  try {
    const response = await authFetch(`http://127.0.0.1:8003/books/${bookId}/cancel`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to cancel reservation");
    }

    // Обнови списъка локално
    setUserBooks(prevBooks => prevBooks.filter(book => book.id !== bookId));
  } catch (error) {
    console.error("Error cancelling reservation:", error);
    alert("Failed to cancel reservation");
  }
};


  if (!user) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: "500px", margin: "auto" }}>
      <h2>Profile</h2>
      {!editing ? (
        <>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>

          {/* Тук добавяме списъка с книги */}
          <h3>Your Reserved Books:</h3>
          {userBooks.length === 0 ? (
            <p>You have no reserved books.</p>
          ) : (
            <ul>
              {userBooks.map((book) => (
                <li key={book.id}>
                  <strong>{book.title}</strong> by {book.author} ({book.year})
                  <button
                    style={{ marginLeft: "10px", color: "red" }}
                    onClick={() => handleCancelReservation(book.id)}
                   >
                   Cancel Reservation
                   </button>
                </li>
              ))}
            </ul>
          )}

          <button onClick={() => setEditing(true)}>Edit Profile</button>
          <button onClick={handleLogout} style={{ marginLeft: "10px" }}>Logout</button>
          <button onClick={() => setShowConfirm(true)} style={{ color: "red", marginLeft: "10px" }}>
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
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="New Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <button type="submit">Save</button>
          <button type="button" onClick={() => setEditing(false)}>Cancel</button>
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
