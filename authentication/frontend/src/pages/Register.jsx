// --------------------------------------------------
// Register Page
// --------------------------------------------------
// Allows new users to create an account.
//
// Form fields: name, email, password, confirmPassword
// On success: redirects to login page
// On error: shows field-level validation errors
//
// Data flow:
// 1. User fills the form and clicks "Create Account"
// 2. handleSubmit() calls authContext.register()
// 3. register() sends POST /api/auth/register
// 4. Backend validates with express-validator
// 5. If valid, creates user and returns success
// 6. If invalid, returns field-level errors (400)
//    or duplicate email error (409)
// --------------------------------------------------

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  // ---- Form State ----
  // Each field has its own state variable for controlled inputs.
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Loading state to disable the submit button during API call
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stores field-level validation errors from the backend.
  // Structure: { fieldName: "error message" }
  const [errors, setErrors] = useState({});

  /**
   * handleSubmit - Form submission handler.
   *
   * Prevents default form submission (page reload),
   * calls the register API, and handles the response.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();   // Prevent page reload
    setErrors({});        // Clear previous errors
    setIsSubmitting(true);

    try {
      await register(name, email, password, confirmPassword);

      // Registration successful -- redirect to login
      toast.success("Account created! Please login.");
      navigate("/login");
    } catch (error) {
      // Handle different error types from the backend
      const data = error.response?.data;

      if (data?.errors) {
        // Field-level validation errors (400 from express-validator).
        // Convert the array of { field, message } objects into an
        // object keyed by field name for easy lookup in the form.
        const fieldErrors = {};
        data.errors.forEach((err) => {
          fieldErrors[err.field] = err.message;
        });
        setErrors(fieldErrors);
      } else {
        // General error (409 duplicate email, 500 server error, etc.)
        toast.error(data?.message || "Registration failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="card auth-card">
        <h1 className="mono" style={{ fontSize: "2rem", marginBottom: "8px" }}>INIT.SEQ</h1>
        <p className="mono" style={{ color: "var(--text-secondary)", marginBottom: "32px", fontSize: "0.85rem" }}>
          SYS.REGISTER // CREATE NEW IDENTITY
        </p>

        <form onSubmit={handleSubmit}>
          {/* ---- Name Field ---- */}
          <div className="form-group">
            <label htmlFor="name">FULL_NAME</label>
            <input
              id="name"
              type="text"
              className={`form-input ${errors.name ? "input-error" : ""}`}
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {/* Show field-level error if it exists */}
            {errors.name && <p className="field-error">ERR: {errors.name}</p>}
          </div>

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
              placeholder="Min 6 chars + number"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <p className="field-error">ERR: {errors.password}</p>}
          </div>

          {/* ---- Confirm Password Field ---- */}
          <div className="form-group">
            <label htmlFor="confirmPassword">VERIFY_KEY</label>
            <input
              id="confirmPassword"
              type="password"
              className={`form-input ${errors.confirmPassword ? "input-error" : ""}`}
              placeholder="Re-enter access key"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {errors.confirmPassword && (
              <p className="field-error">ERR: {errors.confirmPassword}</p>
            )}
          </div>

          {/* ---- Submit Button ---- */}
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isSubmitting}
            style={{ marginTop: "16px" }}
          >
            {isSubmitting ? "[ PROCESSING... ]" : "[ INITIALIZE ACCOUNT ]"}
          </button>
        </form>

        {/* ---- Footer Link ---- */}
        <div className="auth-footer">
          EXISTING IDENTITY? <Link to="/login">EXECUTE LOGIN</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
