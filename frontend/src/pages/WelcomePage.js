import { useNavigate, Link } from "react-router-dom";
import "../styles/WelcomePage.css";
import { useUser } from "../hooks/useUser";


function WelcomePage() {
  const { user, loading } = useUser();

  if (loading) {
    return <div className="welcome-container">Loading...</div>;
  }

  if (user) {
    // Logged in user - show custom welcome
    return (
      <div className="welcome-container">
        <div className="welcome-card">
          <div className="header-section">
            <div className="logo-circle">
              <div className="book-icon">📚</div>
            </div>
            <h1 className="welcome-title">Welcome back, {user.name}!</h1>
          </div>

          <p className="welcome-subtitle">
            Let's pick up where you left off.
          </p>

          <div className="button-group">
            <Link to="/books" className="auth-link">
              <button className="auth-btn primary-btn">
                Go to My Library
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in - show standard welcome
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