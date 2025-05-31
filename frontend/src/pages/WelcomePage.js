import { Link } from "react-router-dom";
import "../styles/WelcomePage.css";

function WelcomePage() {
  return (
    <div className="welcome-container">
      <div className="welcome-card">
        <div className="header-section">
          <div className="logo-circle">
            <div className="book-icon">📚</div>
          </div>
          <h1 className="welcome-title">Welcome to LibraryApp</h1>
        </div>

        <p className="welcome-subtitle">
          Your personal library management system. Explore books, track your reading, and discover new favorites.
        </p>

        <div className="button-group">
          <Link to="/signin" className="auth-link">
            <button className="auth-btn primary-btn">
              Sign In
            </button>
          </Link>
          <Link to="/signup" className="auth-link">
            <button className="auth-btn secondary-btn">
              Sign Up
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default WelcomePage;