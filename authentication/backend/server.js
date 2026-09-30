// --------------------------------------------------
// Express Server Entry Point
// --------------------------------------------------
// This is the main file that:
// 1. Loads environment variables
// 2. Connects to MongoDB
// 3. Configures middleware (CORS, JSON parsing, cookies)
// 4. Mounts the auth and product route groups
// 5. Starts the HTTP server
// --------------------------------------------------

// Load environment variables from .env FIRST,
// before any other code tries to read process.env values.
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

// Import route handlers
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");

// Create the Express application instance
const app = express();

// --------------------------------------------------
// Middleware Setup
// --------------------------------------------------

// CORS -- allows the frontend (running on a different port) to
// make requests to this API. 'credentials: true' is required
// for cookies (refresh token) to be sent cross-origin.
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true, // Allow cookies to be sent with requests
  })
);

// Parse incoming JSON request bodies.
// This populates req.body with the parsed JSON.
app.use(express.json());

// Parse URL-encoded form data (e.g., from HTML forms).
// 'extended: true' allows nested objects.
app.use(express.urlencoded({ extended: true }));

// Parse cookies from the Cookie header.
// This populates req.cookies, which we use for refresh tokens.
app.use(cookieParser());

// --------------------------------------------------
// Route Mounting
// --------------------------------------------------
// All auth routes are prefixed with /api/auth
// All product routes are prefixed with /api/products
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

// --------------------------------------------------
// Health Check Route
// --------------------------------------------------
// Simple route to verify the server is running.
// Useful for monitoring and deployment health checks.
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Authentication and Product CRUD API is running.",
  });
});

// --------------------------------------------------
// Start Server
// --------------------------------------------------
const PORT = process.env.PORT || 5000;

// Connect to MongoDB first, then start the server.
// We don't want to accept requests before the DB is ready.
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API Base: http://localhost:${PORT}/api`);
  });
});
