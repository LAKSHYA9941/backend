// --------------------------------------------------
// Navbar Component
// --------------------------------------------------
// The top navigation bar shown on all pages.
// Displays the brand name, navigation links,
// and auth status (login/register or user info + logout).
//
// Uses the useAuth hook to determine if a user is
// logged in and to trigger the logout action.
// --------------------------------------------------

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

function Navbar() {
  // Get auth state and actions from context
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  /**
   * handleLogout - Logs the user out and redirects to login.
   *
   * Calls the logout function from AuthContext,
   * shows a success toast, and navigates to /login.
   */
  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      {/* Brand / Logo -- links to home (products page) */}
      <Link to="/" className="navbar-brand">
        SYS.<span>HUB</span>
      </Link>

      <div className="navbar-links">
        {/* Always show the Products link */}
        <Link to="/" className="btn btn-ghost mono">
          [ DIRECTORY ]
        </Link>

        {user ? (
          <>
            {/* ---- Logged In State ---- */}
            {/* Show "Add Product" button for authenticated users */}
            <Link to="/products/new" className="btn btn-primary">
              [+ NEW ENTRY]
            </Link>

            {/* User avatar and name */}
            <div className="navbar-user">
              <span className="mono" style={{ color: "var(--accent)" }}>USR:</span>
              <span className="mono">{user.name.toUpperCase()}</span>
            </div>

            {/* Logout button */}
            <button onClick={handleLogout} className="btn btn-ghost mono" style={{ borderLeft: "1px solid var(--border-color)", paddingLeft: "16px" }}>
              [ LOGOUT ]
            </button>
          </>
        ) : (
          <>
            {/* ---- Logged Out State ---- */}
            <Link to="/login" className="btn btn-ghost mono">
              [ AUTHENTICATE ]
            </Link>
            <Link to="/register" className="btn btn-primary">
              [ INITIALIZE ]
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
