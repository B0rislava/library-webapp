import React from "react";
import { Link, useLocation } from "react-router-dom";

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

      <style jsx>{`
        .navbar {
          background: linear-gradient(135deg, #6a3093 0%, #a044ff 100%);
          color: white;
          padding: 0.75rem 2rem;
          box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .navbar-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .navbar-logo {
          display: flex;
          align-items: center;
          text-decoration: none;
          font-size: 1.6rem;
          font-weight: 700;
          color: white;
          transition: transform 0.2s ease;
        }

        .navbar-logo:hover {
          transform: translateY(-2px);
        }

        .logo-text {
          margin-right: 0.3rem;
        }

        .logo-highlight {
          color: #ff7e33;
        }

        .navbar-links {
          display: flex;
          gap: 2.5rem;
        }

        .nav-link {
          color: rgba(255, 255, 255, 0.85);
          text-decoration: none;
          font-weight: 500;
          font-size: 1.1rem;
          padding: 0.5rem 0;
          position: relative;
          transition: all 0.3s ease;
        }

        .nav-link:hover {
          color: white;
          transform: translateY(-1px);
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 3px;
          background-color: #ff7e33;
          transition: width 0.3s ease;
        }

        .nav-link:hover::after {
          width: 100%;
        }

        .nav-link.active {
          color: white;
          font-weight: 600;
        }

        .nav-link.active::after {
          width: 100%;
          background-color: #ff7e33;
        }

        @media (max-width: 768px) {
          .navbar {
            padding: 0.6rem 1.5rem;
          }

          .navbar-logo {
            font-size: 1.4rem;
          }

          .navbar-links {
            gap: 1.8rem;
          }

          .nav-link {
            font-size: 1rem;
          }
        }
      `}</style>
    </nav>
  );
}

export default Navbar;