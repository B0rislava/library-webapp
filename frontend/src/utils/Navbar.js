import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-text">Library</span>
          <span className="logo-highlight">App</span>
        </Link>

        <div className="navbar-links">
          <Link
            to="/books"
            className={`nav-link ${location.pathname === '/books' ? 'active' : ''}`}
          >
            Books
          </Link>
          <Link
            to="/profile"
            className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
          >
            Profile
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
