// --------------------------------------------------
// Auth Controller
// --------------------------------------------------
// Contains all handler functions for authentication:
// register, login, refreshToken, logout, and getMe.
//
// Token Strategy:
// - Access Token: short-lived (15 min), sent in JSON body
// - Refresh Token: long-lived (7 days), sent as httpOnly cookie
//   AND stored in the database for revocation support
// --------------------------------------------------

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// --------------------------------------------------
// Helper: Generate Access Token
// --------------------------------------------------
// Creates a short-lived JWT containing only the userId.
// This token is sent in the response body and stored
// by the frontend (typically in memory or state).
const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId },                              // Payload -- minimal data
    process.env.ACCESS_TOKEN_SECRET,         // Secret key from .env
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" }  // Short expiry
  );
};

// --------------------------------------------------
// Helper: Generate Refresh Token
// --------------------------------------------------
// Creates a long-lived JWT for obtaining new access tokens.
// Stored server-side (in the User document) so it can be
// revoked on logout or if suspicious activity is detected.
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" }
  );
};

// --------------------------------------------------
// POST /api/auth/register
// --------------------------------------------------
// Creates a new user account.
// Does NOT return tokens -- the user must login separately.
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if a user with this email already exists.
    // We use findOne because emails are unique.
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Hash the password with bcrypt.
    // Salt rounds = 10 means bcrypt generates a random salt
    // and runs the hashing algorithm 2^10 = 1024 times.
    // This makes brute-force attacks computationally expensive.
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the user document in MongoDB
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Return the created user WITHOUT the password.
    // Never expose password hashes in API responses.
    res.status(201).json({
      success: true,
      message: "User registered successfully.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Register error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during registration.",
    });
  }
};

// --------------------------------------------------
// POST /api/auth/login
// --------------------------------------------------
// Authenticates a user and issues both tokens.
// Access token goes in the JSON body.
// Refresh token goes in an httpOnly cookie.
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      // Use a GENERIC message -- don't reveal whether the email
      // or password was wrong. This prevents email enumeration attacks.
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Compare the provided password with the stored hash.
    // bcrypt.compare handles the salt extraction internally.
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Same generic message as above
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Generate both tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store the refresh token in the database.
    // This allows us to invalidate it on logout
    // and detect if a stolen token is being reused.
    user.refreshToken = refreshToken;
    await user.save();

    // Set the refresh token as an httpOnly cookie.
    // httpOnly: true  -- JavaScript cannot access this cookie (XSS protection)
    // secure: true    -- Only sent over HTTPS (disabled in development)
    // sameSite: "strict" -- Not sent with cross-site requests (CSRF protection)
    // maxAge: 7 days in milliseconds
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Send the access token in the response body
    res.status(200).json({
      success: true,
      message: "Login successful.",
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during login.",
    });
  }
};

// --------------------------------------------------
// POST /api/auth/refresh-token
// --------------------------------------------------
// Issues a new access token using the refresh token.
// Also rotates the refresh token for added security.
const refreshToken = async (req, res) => {
  try {
    // Get the refresh token from the httpOnly cookie,
    // or fall back to the request body
    const token = req.cookies.refreshToken || req.body.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not found. Please login again.",
      });
    }

    // Verify the refresh token's signature and expiry
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      return res.status(403).json({
        success: false,
        message: "Invalid or expired refresh token. Please login again.",
      });
    }

    // Find the user and check if the stored refresh token matches.
    // If it doesn't match, someone may be reusing a stolen/old token.
    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== token) {
      return res.status(403).json({
        success: false,
        message: "Refresh token mismatch. Please login again.",
      });
    }

    // Issue a new access token
    const newAccessToken = generateAccessToken(user._id);

    // Rotate the refresh token (issue a new one and invalidate the old).
    // This limits the damage if a refresh token is somehow leaked.
    const newRefreshToken = generateRefreshToken(user._id);
    user.refreshToken = newRefreshToken;
    await user.save();

    // Update the cookie with the new refresh token
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error("Refresh token error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during token refresh.",
    });
  }
};

// --------------------------------------------------
// POST /api/auth/logout
// --------------------------------------------------
// Invalidates the refresh token and clears the cookie.
// After logout, the user must login again to get new tokens.
const logout = async (req, res) => {
  try {
    // req.user is set by the authenticate middleware.
    // It contains { userId } from the access token payload.
    const user = await User.findById(req.user.userId);

    if (user) {
      // Clear the stored refresh token in the database
      user.refreshToken = null;
      await user.save();
    }

    // Clear the refresh token cookie from the browser
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    console.error("Logout error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during logout.",
    });
  }
};

// --------------------------------------------------
// GET /api/auth/me
// --------------------------------------------------
// Returns the currently logged-in user's profile.
// Requires a valid access token (authenticate middleware).
const getMe = async (req, res) => {
  try {
    // Find the user by ID from the decoded token payload.
    // .select("-password -refreshToken") excludes sensitive fields.
    const user = await User.findById(req.user.userId).select(
      "-password -refreshToken"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("GetMe error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error fetching user profile.",
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getMe,
};
