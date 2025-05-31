import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function SigninPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8003/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.access_token && data.refresh_token) {
        localStorage.setItem("accessToken", data.access_token);
        localStorage.setItem("refreshToken", data.refresh_token);
        navigate("/books");
      } else {
        setError(data.detail || "Invalid credentials.");
      }
    } catch (err) {
      setError("Error connecting to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Sign In</h2>
          <div className="logo-circle">
            <div className="book-icon">📚</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="auth-btn primary-btn"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account?{" "}
          <span onClick={() => navigate("/signup")} className="auth-link">
            Sign Up
          </span>
        </p>
      </div>

      <style jsx>{`
        .auth-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #e4d1ff 0%, #d8b5ff 100%);
          padding: 2rem;
          box-sizing: border-box;
        }

        .auth-card {
          background: white;
          border-radius: 24px;
          padding: 2.5rem;
          width: 100%;
          max-width: 450px;
          box-shadow: 0 15px 50px rgba(90, 61, 122, 0.15);
          animation: fadeInUp 0.6s ease-out;
        }

        .auth-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .auth-header h2 {
          color: #5a3d7a;
          margin-bottom: 1.5rem;
          font-size: 1.8rem;
        }

        .logo-circle {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #a044ff 0%, #6a3093 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
        }

        .book-icon {
          font-size: 2.5rem;
          color: white;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group input {
          padding: 0.9rem;
          border: 1px solid #d8b5ff;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .form-group input:focus {
          border-color: #a044ff;
          outline: none;
          box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.2);
        }

        .auth-btn {
          padding: 0.9rem;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .primary-btn {
          background: linear-gradient(135deg, #6a3093 0%, #a044ff 100%);
          color: white;
        }

        .primary-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(106, 48, 147, 0.35);
        }

        .primary-btn:disabled {
          background: #b0a4bd;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .auth-footer {
          text-align: center;
          margin-top: 1.5rem;
          color: #7a5c9a;
        }

        .auth-link {
          color: #a044ff;
          cursor: pointer;
          font-weight: 600;
          transition: color 0.2s ease;
        }

        .auth-link:hover {
          color: #6a3093;
          text-decoration: underline;
        }

        .error-message {
          color: #e53e3e;
          background: #fef2f2;
          padding: 0.75rem;
          border-radius: 8px;
          text-align: center;
          margin-top: -0.5rem;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 600px) {
          .auth-container {
            padding: 1.5rem;
          }

          .auth-card {
            padding: 2rem 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}

export default SigninPage;