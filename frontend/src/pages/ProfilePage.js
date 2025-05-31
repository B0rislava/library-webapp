import React, { useState, useEffect } from "react";
import { authFetch } from "../utils/authFetch";
import Modal from "../modals/ConfirmationModal/ConfirmationModal";
import { FiEdit2, FiLogOut, FiTrash2, FiBook, FiUser, FiX, FiCheck } from "react-icons/fi";

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
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (!user) {
    return <div className="error-message">Failed to load user profile</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar">
            <FiUser size={32} />
          </div>
          <h2>Your Profile</h2>
          {!editing && (
            <div className="profile-actions">
              <button
                className="btn-icon edit-btn"
                onClick={() => setEditing(true)}
                aria-label="Edit profile"
              >
                <FiEdit2 size={20} />
              </button>
              <button
                className="btn-icon logout-btn"
                onClick={handleLogout}
                aria-label="Logout"
              >
                <FiLogOut size={20} />
              </button>
              <button
                className="btn-icon delete-btn"
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
              <div className="info-item">
                <span className="info-label">Name</span>
                <span className="info-value">{user.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email</span>
                <span className="info-value">{user.email}</span>
              </div>
            </div>

            <div className="section-divider">
              <FiBook size={20} />
              <h3>Your Book Collection</h3>
            </div>

            <div className="filter-control">
              <label>Filter by Status:</label>
              <div className="status-tabs">
                {["All", "Not started", "Started", "Finished"].map((status) => (
                  <button
                    key={status}
                    className={`status-tab ${selectedStatus === status ? "active" : ""}`}
                    onClick={() => setSelectedStatus(status)}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {userBooks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <FiBook size={48} />
                </div>
                <p>Your bookshelf is empty</p>
                <button
                  className="btn-primary"
                  onClick={() => window.location.href = "/books"}
                >
                  Browse Books
                </button>
              </div>
            ) : (
              <div className="books-grid">
                {userBooks
                  .filter(
                    (book) =>
                      selectedStatus === "All" || book.status === selectedStatus
                  )
                  .map((book) => (
                    <div key={book.book_id} className="book-card">
                      <div className="book-cover">
                        {book.cover_image ? (
                          <img src={book.cover_image} alt={book.title} />
                        ) : (
                          <div className="cover-placeholder">
                            <FiBook size={32} />
                          </div>
                        )}
                      </div>

                      <div className="book-details">
                        <h4 className="book-title">{book.title}</h4>
                        <p className="book-author">{book.author}</p>
                        <p className="book-year">{book.year}</p>

                        <div className="progress-container">
                          <div className="page-input-group">
                            <div className="input-row">
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
                                className="page-input"
                              />
                            </div>

                            <div className="input-row">
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
                                className="page-input"
                                placeholder="Enter total"
                              />
                            </div>
                          </div>

                          <div className="progress-display">
                            <div className="progress-bar">
                              <div
                                className="progress-fill"
                                style={{ width: `${book.progress}%` }}
                              ></div>
                            </div>
                            <span className="progress-text">
                              {book.progress}% {book.status === 'Finished' && '(Completed)'}
                            </span>
                          </div>
                        </div>

                        <div className="book-controls">
                          <select
                            value={book.status}
                            onChange={(e) =>
                              handleStatusChange(book.book_id, e.target.value)
                            }
                            className="status-select"
                          >
                            <option value="Not started">Not started</option>
                            <option value="Started">Started</option>
                            <option value="Finished">Finished</option>
                          </select>

                          <button
                            className="btn-remove"
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
          <form onSubmit={handleEditSubmit} className="edit-form">
            <div className="form-group">
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

            <div className="form-group">
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

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Leave blank to keep current"
              />
              <div className="form-note">Minimum 8 characters</div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary save-btn">
                <FiCheck size={18} />
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="btn-secondary"
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

      <style jsx>{`
        :root {
          --primary: #4361ee;
          --primary-dark: #3a56d4;
          --secondary: #6c757d;
          --danger: #e5383b;
          --success: #2ecc71;
          --light: #f8f9fa;
          --dark: #212529;
          --gray: #6c757d;
          --light-gray: #e9ecef;
          --border: #dee2e6;
          --card-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
        }

        .profile-container {
          max-width: 1200px;
          margin: 2rem auto;
          padding: 0 1rem;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .profile-card {
          background: white;
          border-radius: 16px;
          box-shadow: var(--card-shadow);
          overflow: hidden;
          padding: 2.5rem;
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 2rem;
          position: relative;
        }

        .avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 2rem;
          flex-shrink: 0;
        }

        .profile-header h2 {
          margin: 0;
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--dark);
        }

        .profile-actions {
          margin-left: auto;
          display: flex;
          gap: 0.75rem;
        }

        .btn-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          background: var(--light);
          color: var(--gray);
        }

        .btn-icon:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .edit-btn:hover { background: #e7f4ff; color: var(--primary); }
        .logout-btn:hover { background: #fff8e6; color: #f39c12; }
        .delete-btn:hover { background: #ffebee; color: var(--danger); }

        .profile-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }

        .info-item {
          background: var(--light);
          border-radius: 12px;
          padding: 1.25rem;
        }

        .info-label {
          display: block;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--gray);
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        .info-value {
          font-size: 1.1rem;
          color: var(--dark);
          font-weight: 500;
        }

        .section-divider {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin: 2.5rem 0 1.5rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--border);
        }

        .section-divider h3 {
          margin: 0;
          font-size: 1.4rem;
          color: var(--dark);
        }

        .filter-control {
          margin-bottom: 2rem;
        }

        .status-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.75rem;
        }

        .status-tab {
          padding: 0.5rem 1.25rem;
          border-radius: 20px;
          background: var(--light);
          border: 1px solid var(--border);
          color: var(--gray);
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.9rem;
        }

        .status-tab:hover, .status-tab.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        .empty-state {
          text-align: center;
          padding: 3rem 2rem;
          background: var(--light);
          border-radius: 16px;
          margin: 2rem 0;
        }

        .empty-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(67, 97, 238, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          color: var(--primary);
        }

        .empty-state p {
          color: var(--gray);
          margin-bottom: 1.5rem;
          font-size: 1.1rem;
        }

        .books-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .book-card {
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
          display: flex;
          background: white;
        }

        .book-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
        }

        .book-cover {
          width: 100px;
          flex-shrink: 0;
          background: #f5f7ff;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .book-cover img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .cover-placeholder {
          color: var(--primary);
          opacity: 0.7;
        }

        .book-details {
          padding: 1.25rem;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .book-title {
          margin: 0 0 0.25rem;
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--dark);
        }

        .book-author, .book-year {
          margin: 0;
          font-size: 0.85rem;
          color: var(--gray);
        }

        .progress-container {
          margin: 1rem 0;
        }

        .page-input-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .input-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .input-row label {
          font-size: 0.8rem;
          color: var(--gray);
          width: 85px;
        }

        .page-input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 0.9rem;
          text-align: right;
        }

        .progress-display {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .progress-bar {
          height: 8px;
          background: var(--light-gray);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: var(--primary);
          border-radius: 4px;
          transition: width 0.5s ease;
        }

        .progress-text {
          font-size: 0.75rem;
          color: var(--gray);
          text-align: right;
        }

        .book-controls {
          display: flex;
          gap: 0.75rem;
          margin-top: auto;
        }

        .status-select {
          flex: 1;
          padding: 0.5rem;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: white;
          font-size: 0.85rem;
          cursor: pointer;
        }

        .btn-remove {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(229, 56, 59, 0.1);
          border: none;
          color: var(--danger);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-remove:hover {
          background: rgba(229, 56, 59, 0.2);
        }

        .edit-form {
          padding: 1rem 0;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: var(--dark);
          font-size: 0.95rem;
        }

        .form-group input {
          width: 100%;
          padding: 0.9rem 1.2rem;
          border: 1px solid var(--border);
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.2s ease;
        }

        .form-group input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.15);
          outline: none;
        }

        .form-note {
          font-size: 0.8rem;
          color: var(--gray);
          margin-top: 0.25rem;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .btn-primary {
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 0.9rem 1.75rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
        }

        .btn-primary:hover {
          background: var(--primary-dark);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(67, 97, 238, 0.25);
        }

        .btn-secondary {
          background: white;
          color: var(--gray);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 0.9rem 1.75rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
        }

        .btn-secondary:hover {
          background: var(--light);
          transform: translateY(-2px);
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          gap: 1rem;
        }

        .loading-spinner {
          border: 4px solid rgba(67, 97, 238, 0.1);
          border-radius: 50%;
          border-top: 4px solid var(--primary);
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-message {
          text-align: center;
          padding: 2rem;
          color: var(--danger);
          font-size: 1.2rem;
          margin-top: 2rem;
        }

        /* Responsive styles */
        @media (max-width: 768px) {
          .profile-card {
            padding: 1.5rem;
          }

          .profile-header {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }

          .profile-actions {
            margin-left: 0;
            margin-top: 1rem;
          }

          .books-grid {
            grid-template-columns: 1fr;
          }

          .book-card {
            flex-direction: column;
          }

          .book-cover {
            width: 100%;
            height: 150px;
          }

          .form-actions {
            flex-direction: column;
          }

          .input-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.25rem;
          }

          .input-row label {
            width: auto;
          }

          .page-input {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default ProfilePage;