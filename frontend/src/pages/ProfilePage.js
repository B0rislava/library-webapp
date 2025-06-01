import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import { useUserBooks } from "../hooks/useUserBooks";
import { useProfileActions } from "../hooks/useProfileActions";
import { useNotification } from "../hooks/useNotification";
import { useForm } from "../hooks/useForm";
import {
  FiEdit2,
  FiLogOut,
  FiTrash2,
  FiBook,
  FiUser,
  FiX,
  FiCheck,
  FiPlus,
  FiTrendingUp,
  FiClock,
  FiUsers
} from "react-icons/fi";
import Modal from "../modals/ConfirmationModal/ConfirmationModal";
import LoadingState from "../components/common/LoadingState/LoadingState";
import NotificationModal from "../modals/NotificationModal/NotificationModal";
import "../styles/ProfilePage.css";

function ProfilePage() {
  // Hooks for data management
  const { user, loading: userLoading, error: userError, updateUser } = useUser();
  const { books: userBooks, loading: booksLoading, error: booksError,
          updateStatus, updateProgress, removeBook } = useUserBooks();
  const { notification, showNotification, closeNotification } = useNotification();
  const { handleDeleteProfile, handleLogout } = useProfileActions();

  // Local state
  const [editing, setEditing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [bookToDelete, setBookToDelete] = useState(null);
  const [showProfileDeleteModal, setShowProfileDeleteModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  // Form handling
  const { values, handleChange } = useForm({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
  });

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUser(values);
      setEditing(false);
      showNotification("Profile updated successfully!");
    } catch (error) {
      showNotification(error.message, true);
    }
  };

  const handleStatusChange = async (bookId, newStatus) => {
    try {
      await updateStatus(bookId, newStatus);
    } catch (error) {
      showNotification("Failed to update status", true);
    }
  };

  const handlePageChange = async (bookId, currentPage, totalPages) => {
    try {
      await updateProgress(bookId, currentPage, totalPages);
    } catch (error) {
      showNotification("Failed to update progress", true);
    }
  };

  const handleRemoveBook = async (bookId) => {
    try {
      await removeBook(bookId);
      setBookToDelete(null);
      showNotification("Book removed from your collection");
    } catch (error) {
      showNotification("Failed to remove book", true);
    }
  };

  if (userLoading || booksLoading) return <LoadingState />;
  if (userError || booksError) {
    return (
      <div className="profile-error-message">{userError || booksError}</div>
    );
  }

  if (!user) {
    return (
      <div className="profile-error-message">Failed to load user profile</div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        {/* Profile Header Section */}
        <div className="profile-header">
          <div className="profile-avatar">
            <FiUser size={32} />
          </div>
          <h2>Your Profile</h2>

          {!editing && (
            <div className="profile-actions">
              <button onClick={() => setEditing(true)} className="profile-btn-icon profile-edit-btn">
                <FiEdit2 size={20} />
              </button>
              <button
                onClick={() => setShowLogoutModal(true)}
                className="profile-btn-icon profile-logout-btn"
                >
                <FiLogOut size={20} />
              </button>
              <button onClick={() => setShowProfileDeleteModal(true)} className="profile-btn-icon profile-delete-btn">
                <FiTrash2 size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Profile Content - Edit Mode or View Mode */}
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
              {user?.role === "librarian" && (
                <div className="profile-info-item">
                  <span className="profile-info-label">Role</span>
                  <span className="profile-info-value">Librarian</span>
                </div>
              )}
            </div>

            {user?.role === "librarian" ? (
              <div className="librarian-dashboard">
                {/* Statistics Cards */}
                <div className="stats-cards">
                  <div className="stat-card">
                    <h4>Total Books</h4>
                    <p className="stat-value">1,245</p>
                    <p className="stat-description">in library</p>
                  </div>

                  <div className="stat-card">
                    <h4>Registered Users</h4>
                    <p className="stat-value">586</p>
                    <p className="stat-description">readers</p>
                  </div>

                  <div className="stat-card">
                    <h4>Active Loans</h4>
                    <p className="stat-value">127</p>
                    <p className="stat-description">this month</p>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="librarian-actions">
                  <button
                    className="librarian-action-btn"
                    onClick={() => navigate('/admin/books/add')}
                  >
                    <FiPlus size={24} />
                    Add New Book
                  </button>

                  <button
                    className="librarian-action-btn"
                    onClick={() => navigate('/admin/popular-books')}
                  >
                    <FiTrendingUp size={24} />
                    Most Popular Books
                  </button>

                  <button
                    className="librarian-action-btn"
                    onClick={() => navigate('/admin/book-requests')}
                  >
                    <FiClock size={24} />
                    Book Requests
                  </button>

                  <button
                    className="librarian-action-btn"
                    onClick={() => navigate('/admin/user-management')}
                  >
                    <FiUsers size={24} />
                    User Management
                  </button>
                </div>

                {/* Recent Activity Section */}
                <div className="recent-activity">
                  <h3>Recent Activity</h3>
                  <ul className="activity-list">
                    <li>User "John Doe" returned "The Great Gatsby"</li>
                    <li>New book "Atomic Habits" added to catalog</li>
                    <li>5 new users registered this week</li>
                    <li>User "Jane Smith" requested "Dune"</li>
                  </ul>
                </div>
              </div>
            ) : (
              <>
                <div className="profile-section-divider">
                  <FiBook size={20} />
                  <h3>Your Book Collection</h3>
                </div>

                <div className="profile-filter-control">
                  <label>Filter by Status:</label>
                  <div className="profile-status-tabs">
                    {["All", "Not started", "Started", "Finished"].map(
                      (status) => (
                        <button
                          key={status}
                          className={`profile-status-tab ${selectedStatus === status ? "active" : ""}`}
                          onClick={() => setSelectedStatus(status)}
                        >
                          {status}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                {userBooks.filter(
                  (b) =>
                    selectedStatus === "All" || b.status === selectedStatus,
                ).length === 0 ? (
                  <div className="profile-empty-state">
                    <div className="profile-empty-icon">
                      <FiBook size={48} />
                    </div>
                    <p>Your bookshelf is empty</p>
                    <button
                      className="profile-btn-primary"
                      onClick={() => navigate("/books")}
                    >
                      Browse Books
                    </button>
                  </div>
                ) : (
                  <div className="profile-books-grid">
                    {userBooks
                      .filter(
                        (book) =>
                          selectedStatus === "All" ||
                          book.status === selectedStatus,
                      )
                      .map((book) => (
                        <div key={book.book_id} className="profile-book-card">
                          {/* Book Cover */}
                          <div className="profile-book-cover">
                            {book.cover_image ? (
                              <img src={book.cover_image} alt={book.title} />
                            ) : (
                              <div className="profile-cover-placeholder">
                                <FiBook size={32} />
                              </div>
                            )}
                          </div>

                          {/* Book Details */}
                          <div className="profile-book-details">
                            <h4 className="profile-book-title">{book.title}</h4>
                            <p className="profile-book-author">{book.author}</p>
                            <p className="profile-book-year">{book.year}</p>

                            {/* Progress Tracking */}
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
                                        book.total_pages || 0,
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
                                        e.target.value,
                                      )
                                    }
                                    className="profile-page-input"
                                    placeholder="Enter total"
                                  />
                                </div>
                              </div>

                              {/* Progress Bar */}
                              <div className="profile-progress-display">
                                <div className="profile-progress-bar">
                                  <div
                                    className="profile-progress-fill"
                                    style={{ width: `${book.progress}%` }}
                                  ></div>
                                </div>
                                <span className="profile-progress-text">
                                  {book.progress}%{" "}
                                  {book.status === "Finished" && "(Completed)"}
                                </span>
                              </div>
                            </div>

                            {/* Book Controls */}
                            <div className="profile-book-controls">
                              <select
                                value={book.status}
                                onChange={(e) =>
                                  handleStatusChange(
                                    book.book_id,
                                    e.target.value,
                                  )
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
            )}
          </>
        ) : (
          /* Edit Profile Form */
          <form onSubmit={handleEditSubmit} className="profile-edit-form">
            <div className="profile-form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={values.name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
              />
            </div>

            <div className="profile-form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={values.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="profile-form-group">
              <label>New Password</label>
              <input
                type="password"
                name="password"
                value={values.password}
                onChange={handleChange}
                placeholder="Leave blank to keep current"
              />
              <div className="profile-form-note">Minimum 8 characters</div>
            </div>

            <div className="profile-form-actions">
              <button
                type="submit"
                className="profile-btn-primary profile-save-btn"
              >
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

      {/* Modals */}
      <Modal
        show={showProfileDeleteModal}
        onClose={() => setShowProfileDeleteModal(false)}
        onConfirm={handleDeleteProfile}
        title="Delete Profile"
      >
        <p>
          Are you sure you want to delete your profile? This action cannot be
          undone.
        </p>
      </Modal>

      <Modal
        show={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Sign Out"
      >
          <p>Are you sure you want to sign out?</p>
      </Modal>

      <Modal
        show={bookToDelete !== null}
        onClose={() => setBookToDelete(null)}
        onConfirm={() => handleRemoveBook(bookToDelete)}
        title="Remove Book"
      >
        <p>Are you sure you want to remove this book from your collection?</p>
      </Modal>

      <NotificationModal
        isOpen={notification.open}
        onClose={closeNotification}
        message={notification.message}
        isError={notification.isError}
      />
    </div>
  );
}

export default ProfilePage;