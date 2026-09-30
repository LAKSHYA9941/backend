// --------------------------------------------------
// Auth Routes
// --------------------------------------------------
// Defines all authentication-related routes and
// wires them to validators, middleware, and controllers.
//
// Route flow: validator checks -> validate middleware -> controller
// For protected routes: authenticate middleware runs first.
// --------------------------------------------------

const express = require("express");
const router = express.Router();

// Import controller functions
const {
  register,
  login,
  refreshToken,
  logout,
  getMe,
} = require("../controllers/authController");

// Import validation rules
const {
  registerValidator,
  loginValidator,
  refreshTokenValidator,
} = require("../validators/authValidator");

// Import middleware
const validate = require("../middleware/validate");
const authenticate = require("../middleware/authenticate");

// --------------------------------------------------
// PUBLIC ROUTES (no token required)
// --------------------------------------------------

// POST /api/auth/register
// Flow: registerValidator -> validate -> register controller
router.post("/register", registerValidator, validate, register);

// POST /api/auth/login
// Flow: loginValidator -> validate -> login controller
router.post("/login", loginValidator, validate, login);

// POST /api/auth/refresh-token
// Flow: refreshTokenValidator -> validate -> refreshToken controller
// Note: This route is "public" but requires a valid refresh token
// in the cookie or body. The controller handles that verification.
router.post("/refresh-token", refreshTokenValidator, validate, refreshToken);

// --------------------------------------------------
// PROTECTED ROUTES (valid access token required)
// --------------------------------------------------

// POST /api/auth/logout
// Flow: authenticate -> logout controller
// Must be authenticated so we know WHICH user to log out
router.post("/logout", authenticate, logout);

// GET /api/auth/me
// Flow: authenticate -> getMe controller
// Returns the profile of the currently logged-in user
router.get("/me", authenticate, getMe);

module.exports = router;
