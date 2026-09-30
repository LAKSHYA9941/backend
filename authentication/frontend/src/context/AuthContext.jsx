// --------------------------------------------------
// Auth Context
// --------------------------------------------------
// Provides authentication state and actions to the
// entire React component tree via Context API.
//
// State: user object, loading flag, authentication status
// Actions: login, register, logout, checkAuth
//
// How it works:
// - On app load, checkAuth() calls /api/auth/me to see
//   if the user has a valid session (token in localStorage).
// - login/register/logout update both the server state
//   and the local React state.
// - Any component can use the useAuth() hook to access
//   the current user and auth actions.
// --------------------------------------------------

import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

// Create the context with a default value of null.
// Components should always be wrapped in AuthProvider,
// so this default is just a safety fallback.
const AuthContext = createContext(null);

/**
 * AuthProvider - Wraps the app and provides auth state.
 *
 * Place this at the root of your component tree (in App.jsx)
 * so all pages and components can access auth data.
 */
export function AuthProvider({ children }) {
  // The currently logged-in user object (or null if not logged in)
  const [user, setUser] = useState(null);

  // Loading flag -- true while we're checking if the user is authenticated.
  // We show a loading spinner until this resolves, to prevent
  // the login page from flashing before redirecting authenticated users.
  const [loading, setLoading] = useState(true);

  // --------------------------------------------------
  // Check if the user is already authenticated on app load.
  // This runs once when the AuthProvider mounts.
  // --------------------------------------------------
  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * checkAuth - Verifies if the current user session is valid.
   *
   * Calls GET /api/auth/me with the stored access token.
   * If the token is expired, the Axios interceptor will
   * automatically try to refresh it before this call fails.
   */
  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        // No token stored -- user is not logged in
        setLoading(false);
        return;
      }

      const response = await api.get("/auth/me");
      setUser(response.data.user);
    } catch (error) {
      // Token is invalid or expired and refresh failed.
      // Clear everything and treat user as logged out.
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * register - Creates a new user account.
   *
   * Calls POST /api/auth/register with name, email, password, confirmPassword.
   * Does NOT log the user in -- they must login separately after registering.
   * Returns the API response so the component can show success/error messages.
   */
  const register = async (name, email, password, confirmPassword) => {
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
      confirmPassword,
    });
    return response.data;
  };

  /**
   * login - Authenticates the user and stores tokens.
   *
   * Calls POST /api/auth/login with email and password.
   * On success:
   * - Stores the access token in localStorage
   * - Updates the user state
   * - The refresh token is automatically set as an httpOnly cookie by the server
   */
  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const { accessToken, user: userData } = response.data;

    // Store the access token for use in API requests.
    // We use localStorage here for simplicity. In a production app,
    // you might keep it only in memory to reduce XSS risk.
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("user", JSON.stringify(userData));

    // Update React state so the UI re-renders with the logged-in user
    setUser(userData);
    return response.data;
  };

  /**
   * logout - Ends the user session.
   *
   * Calls POST /api/auth/logout to invalidate the refresh token on the server.
   * Then clears local storage and React state.
   */
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      // Even if the server call fails (e.g., network error),
      // we still clear local state so the user is logged out locally.
      console.error("Logout API error:", error.message);
    }

    // Clear all stored auth data
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setUser(null);
  };

  // The value object provided to all consumers of this context
  const value = {
    user,         // Current user object or null
    loading,      // True while checking auth on initial load
    login,        // Function to log in
    register,     // Function to register
    logout,       // Function to log out
    checkAuth,    // Function to re-check auth status
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth - Custom hook to access auth context.
 *
 * Usage in any component:
 *   const { user, login, logout } = useAuth();
 *
 * Throws an error if used outside of AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
