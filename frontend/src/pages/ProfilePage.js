import React, { useState, useEffect } from "react";
import { authFetch } from "../utils/authFetch";
import Modal from "../modals/ConfirmationModal/ConfirmationModal";
import { FiEdit2, FiLogOut, FiTrash2, FiBook, FiUser, FiX, FiCheck } from "react-icons/fi";
import "../styles/ProfilePage.css";

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [userBooks, setUserBooks] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [showProfileDeleteModal, setShowProfileDeleteModal] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await authFetch("http://127.0.0.1:8003/users/me");
        if (!response.ok) throw new Error("Failed to fetch user data");
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    async function fetchUserBooks() {
      try {
        const response = await authFetch(
          "http://127.0.0.1:8003/books/user-books"
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
        headers: {
          "Content-Type": "application/json",
        },
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
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Server error:", error.message);
      alert(`Error updating profile: ${error.message}`);
    }
  };

  const handleDelete = async () => {
    try {
      await authFetch("http://127.0.0.1:8003/users/delete", {
        method: "DELETE",
      });
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/";
    } catch (error) {
      console.error("Error deleting profile:", error);
      alert("Failed to delete profile");
    }
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
        }
      );

      if (!response.ok) throw new Error("Failed to remove Book");

      setUserBooks((prevBooks) =>
        prevBooks.filter((book) => book.book_id !== bookId)
      );
      alert("Book removed successfully!");
    } catch (error) {
      console.error("Error removing book:", error);
      alert("Failed to remove Book");
    }
  };

  const handleStatusChange = async (bookId, newStatus) => {
    try {
      await authFetch(`http://127.0.0.1:8003/books/user-books/${bookId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      setUserBooks((prevBooks) =>
        prevBooks.map((book) =>
          book.book_id === bookId ? { ...book, status: newStatus } : book
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const handlePageChange = async (bookId, currentPage, totalPages) => {
    try {
      // Calculate progress percentage
      const progress = totalPages > 0
        ? Math.min(100, Math.round((currentPage / totalPages) * 100))
        : 0;

      // Automatically mark as finished if progress reaches 100%
      const status = progress >= 100 ? "Finished" : "Started";

      await authFetch(`http://127.0.0.1:8003/books/user-books/${bookId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          progress,
          current_page: parseInt(currentPage) || 0,
          total_pages: parseInt(totalPages) || 0,
          status
        }),
      });

      setUserBooks((prevBooks) =>
        prevBooks.map((book) =>
          book.book_id === bookId
            ? {
                ...book,
                progress,
                current_page: parseInt(currentPage) || 0,
                total_pages: parseInt(totalPages) || 0,
                status
              }
            : book
        )
      );
    } catch (error) {
      console.error("Error updating progress:", error);
      alert("Failed to update progress");
    }
  };

  if (loading) {
    return (
      <div className="profile-loading-container">
        <div className="profile-loading-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (!user) {
    return <div className="profile-error-message">Failed to load user profile</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            <FiUser size={32} />
          </div>
          <h2>Your Profile</h2>
          {!editing && (
            <div className="profile-actions">
              <button
                className="profile-btn-icon profile-edit-btn"
                onClick={() => setEditing(true)}
                aria-label="Edit profile"
              >
                <FiEdit2 size={20} />
              </button>
              <button
                className="profile-btn-icon profile-logout-btn"
                onClick={handleLogout}
                aria-label="Logout"
              >
                <FiLogOut size={20} />
              </button>
              <button
                className="profile-btn-icon profile-delete-btn"
                onClick={() => setShowProfileDeleteModal(true)}
                aria-label="Delete profile"
              >
                <FiTrash2 size={20} />
              </button>
            </div>
          )}
        </div>

        {!editing ? (
          <>
            <div className="profile-info">
              <div className="profile-info-item">
                <span className="profile-info-label">Name</span>
                <span className="profile-info-value">{user.name}</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Email</span>
                <span className="profile-info-value">{user.email}</span>
              </div>
            </div>

            <div className="profile-section-divider">
              <FiBook size={20} />
              <h3>Your Book Collection</h3>
            </div>

            <div className="profile-filter-control">
              <label>Filter by Status:</label>
              <div className="profile-status-tabs">
                {["All", "Not started", "Started", "Finished"].map((status) => (
                  <button
                    key={status}
                    className={`profile-status-tab ${selectedStatus === status ? "active" : ""}`}
                    onClick={() => setSelectedStatus(status)}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {userBooks.length === 0 ? (
              <div className="profile-empty-state">
                <div className="profile-empty-icon">
                  <FiBook size={48} />
                </div>
                <p>Your bookshelf is empty</p>
                <button
                  className="profile-btn-primary"
                  onClick={() => window.location.href = "/books"}
                >
                  Browse Books
                </button>
              </div>
            ) : (
              <div className="profile-books-grid">
                {userBooks
                  .filter(
                    (book) =>
                      selectedStatus === "All" || book.status === selectedStatus
                  )
                  .map((book) => (
                    <div key={book.book_id} className="profile-book-card">
                      <div className="profile-book-cover">
                        {book.cover_image ? (
                          <img src={book.cover_image} alt={book.title} />
                        ) : (
                          <div className="profile-cover-placeholder">
                            <FiBook size={32} />
                          </div>
                        )}
                      </div>

                      <div className="profile-book-details">
                        <h4 className="profile-book-title">{book.title}</h4>
                        <p className="profile-book-author">{book.author}</p>
                        <p className="profile-book-year">{book.year}</p>

                        <div className="profile-progress-container">
                          <div className="profile-page-input-group">
                            <div className="profile-input-row">
                              <label>Current page:</label>
                              <input
                                type="number"
                                min="0"
                                value={book.current_page || 0}
                                onChange={(e) =>
                                  handlePageChange(
                                    book.book_id,
                                    e.target.value,
                                    book.total_pages || 0
                                  )
                                }
                                className="profile-page-input"
                              />
                            </div>

                            <div className="profile-input-row">
                              <label>Total pages:</label>
                              <input
                                type="number"
                                min="1"
                                value={book.total_pages || ""}
                                onChange={(e) =>
                                  handlePageChange(
                                    book.book_id,
                                    book.current_page || 0,
                                    e.target.value
                                  )
                                }
                                className="profile-page-input"
                                placeholder="Enter total"
                              />
                            </div>
                          </div>

                          <div className="profile-progress-display">
                            <div className="profile-progress-bar">
                              <div
                                className="profile-progress-fill"
                                style={{ width: `${book.progress}%` }}
                              ></div>
                            </div>
                            <span className="profile-progress-text">
                              {book.progress}% {book.status === 'Finished' && '(Completed)'}
                            </span>
                          </div>
                        </div>

                        <div className="profile-book-controls">
                          <select
                            value={book.status}
                            onChange={(e) =>
                              handleStatusChange(book.book_id, e.target.value)
                            }
                            className="profile-status-select"
                          >
                            <option value="Not started">Not started</option>
                            <option value="Started">Started</option>
                            <option value="Finished">Finished</option>
                          </select>

                          <button
                            className="profile-btn-remove"
                            onClick={() => setBookToDelete(book.book_id)}
                            aria-label="Remove book"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </>
        ) : (
          <form onSubmit={handleEditSubmit} className="profile-edit-form">
            <div className="profile-form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                placeholder="Enter your full name"
              />
            </div>

            <div className="profile-form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="profile-form-group">
              <label>New Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Leave blank to keep current"
              />
              <div className="profile-form-note">Minimum 8 characters</div>
            </div>

            <div className="profile-form-actions">
              <button type="submit" className="profile-btn-primary profile-save-btn">
                <FiCheck size={18} />
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="profile-btn-secondary"
              >
                <FiX size={18} />
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <Modal
        show={showProfileDeleteModal}
        onClose={() => setShowProfileDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Profile"
      >
        <p>
          Are you sure you want to delete your profile? This action cannot be
          undone and all your data will be permanently lost.
        </p>
      </Modal>

      <Modal
        show={bookToDelete !== null}
        onClose={() => setBookToDelete(null)}
        onConfirm={() => {
          handleRemoveBook(bookToDelete);
          setBookToDelete(null);
        }}
        title="Remove Book"
      >
        <p>Are you sure you want to remove this book from your collection?</p>
      </Modal>
    </div>
  );
}

export default ProfilePage;