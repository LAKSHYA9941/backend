// --------------------------------------------------
// Axios API Client
// --------------------------------------------------
// Configures a shared Axios instance for all API calls.
//
// Key features:
// 1. Base URL set to the backend server
// 2. Credentials included (for httpOnly cookies)
// 3. Request interceptor: attaches the access token
// 4. Response interceptor: auto-refreshes expired tokens
// --------------------------------------------------

import axios from "axios";

// The backend server URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// Create an Axios instance with default config.
// Using an instance (instead of the global axios) lets us
// configure interceptors without affecting other HTTP calls.
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Send cookies (refresh token) with every request
});

// --------------------------------------------------
// Request Interceptor
// --------------------------------------------------
// Runs BEFORE every request is sent.
// Reads the access token from localStorage and adds
// it to the Authorization header.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      // Set the Bearer token in the Authorization header.
      // The backend's authenticate middleware expects this format.
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --------------------------------------------------
// Response Interceptor
// --------------------------------------------------
// Runs AFTER every response is received.
// If we get a 401 (token expired), it automatically
// tries to refresh the access token using the refresh
// token cookie, then retries the original request.
api.interceptors.response.use(
  // Success handler -- just pass through
  (response) => response,

  // Error handler -- check if we can retry
  async (error) => {
    const originalRequest = error.config;

    // Only try to refresh if:
    // 1. We got a 401 status (unauthorized / expired token)
    // 2. We haven't already retried this request (prevent infinite loop)
    // 3. The failed request wasn't the refresh-token endpoint itself
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh-token")
    ) {
      originalRequest._retry = true; // Mark as retried

      try {
        // Call the refresh endpoint.
        // The refresh token is sent automatically via the httpOnly cookie
        // because we set withCredentials: true.
        const response = await api.post("/auth/refresh-token");

        // Store the new access token
        const { accessToken } = response.data;
        localStorage.setItem("accessToken", accessToken);

        // Update the original request's auth header with the new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // Retry the original request with the new token
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed -- the user needs to login again.
        // Clear stored data and redirect to login.
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // For non-401 errors, or if refresh already failed, reject normally
    return Promise.reject(error);
  }
);

export default api;
