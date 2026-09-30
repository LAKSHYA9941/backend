// --------------------------------------------------
// Login Page
// --------------------------------------------------
// Authenticates existing users with email and password.
//
// Data flow:
// 1. User enters email and password
// 2. handleSubmit() calls authContext.login()
// 3. login() sends POST /api/auth/login
// 4. Backend verifies credentials with bcrypt
// 5. On success: returns access token (in body) and
//    sets refresh token (httpOnly cookie)
// 6. AuthContext stores the token and user data
// 7. User is redirected to the products page
// --------------------------------------------------

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // ---- Form State ----
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  /**
   * handleSubmit - Handles the login form submission.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      await login(email, password);

      // Login successful -- redirect to the products page
      toast.success("Welcome back!");
      navigate("/");
    } catch (error) {
      const data = error.response?.data;

      if (data?.errors) {
        // Field-level validation errors from express-validator
        const fieldErrors = {};
        data.errors.forEach((err) => {
          fieldErrors[err.field] = err.message;
        });
        setErrors(fieldErrors);
      } else {
        // General error (401 invalid credentials, etc.)
        // The backend uses a generic message for security:
        // "Invalid email or password" (doesn't reveal which is wrong)
        toast.error(data?.message || "Login failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="card auth-card">
        <h1 className="mono" style={{ fontSize: "2rem", marginBottom: "8px" }}>AUTH.SEQ</h1>
        <p className="mono" style={{ color: "var(--text-secondary)", marginBottom: "32px", fontSize: "0.85rem" }}>
          SYS.LOGIN // PLEASE IDENTIFY
        </p>

        <form onSubmit={handleSubmit}>
          {/* ---- Email Field ---- */}
          <div className="form-group">
            <label htmlFor="email">EMAIL_ADDRESS</label>
            <input
              id="email"
              type="email"
              className={`form-input ${errors.email ? "input-error" : ""}`}
              placeholder="user@system.local"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <p className="field-error">ERR: {errors.email}</p>}
          </div>

          {/* ---- Password Field ---- */}
          <div className="form-group">
            <label htmlFor="password">ACCESS_KEY</label>
            <input
              id="password"
              type="password"
              className={`form-input ${errors.password ? "input-error" : ""}`}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <p className="field-error">ERR: {errors.password}</p>}
          </div>

          {/* ---- Submit Button ---- */}
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isSubmitting}
            style={{ marginTop: "16px" }}
          >
            {isSubmitting ? "[ AUTHENTICATING... ]" : "[ EXECUTE LOGIN ]"}
          </button>
        </form>

        {/* ---- Footer Link ---- */}
        <div className="auth-footer">
          UNREGISTERED? <Link to="/register">INITIALIZE NEW RECORD</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
