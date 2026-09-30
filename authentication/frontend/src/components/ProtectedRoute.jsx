// --------------------------------------------------
// ProtectedRoute Component
// --------------------------------------------------
// A wrapper component that guards routes requiring
// authentication. If the user is not logged in,
// they are redirected to the login page.
//
// Usage in route config:
//   <Route path="/products/new" element={
//     <ProtectedRoute><ProductForm /></ProtectedRoute>
//   } />
// --------------------------------------------------

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute - Redirects unauthenticated users to /login.
 *
 * Props:
 *   children - The component(s) to render if authenticated
 *
 * How it works:
 * 1. Check if auth state is still loading (initial check).
 *    If so, show a spinner to prevent flashing the login page.
 * 2. If loading is done and user is null, redirect to /login.
 * 3. If user exists, render the children normally.
 */
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Still checking auth status -- show loading spinner
  if (loading) {
    return <div className="spinner"></div>;
  }

  // Not authenticated -- redirect to login page.
  // <Navigate> is React Router's programmatic redirect component.
  // 'replace' prevents the protected page from appearing in browser history.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated -- render the protected content
  return children;
}

export default ProtectedRoute;
