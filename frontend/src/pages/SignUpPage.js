import React from "react";
import { useState} from "react"
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useForm } from "../hooks/useForm";
import "../styles/SignUpPage.css";

function SignupPage() {
  const navigate = useNavigate();
  const { signup, error: authError, loading } = useAuth();
  const { values, handleChange, resetForm } = useForm({name: "", email: "", password: "", confirmPassword: "", role: "user",});
  const [validationError, setValidationError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (values.password !== values.confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }

    if (values.password.length < 8) {
      setValidationError("Password must be at least 8 characters");
      return;
    }

    setValidationError("");
    await signup(values.name, values.email, values.password, values.role);
    resetForm();
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Sign Up</h2>
          <div className="logo-circle">
            <div className="book-icon">📚</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={values.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={values.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={values.password}
              onChange={handleChange}
              required
              minLength="8"
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={values.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Role:</label>
            <select
              name="role"
              value={values.role}
              onChange={handleChange}
              className="role-select"
            >
              <option value="user">User</option>
              <option value="librarian">Librarian</option>
            </select>
          </div>

          {(validationError || authError) && (
            <div className="error-message">
              {validationError || authError}
            </div>
          )}

          <button
            type="submit"
            className="auth-btn primary-btn"
            disabled={loading}
          >
            {loading ? "Registering..." : "Sign Up"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <span onClick={() => navigate("/signin")} className="auth-link">
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;