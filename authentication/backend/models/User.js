// --------------------------------------------------
// User Model
// --------------------------------------------------
// Defines the schema for users in the system.
// Stores name, email, hashed password, and the
// current refresh token for session management.
// --------------------------------------------------

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // User's display name
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    // User's email -- used for login, must be unique
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true, // Always store emails in lowercase to avoid case-mismatch issues
      trim: true,
    },

    // Hashed password -- never store plaintext passwords
    password: {
      type: String,
      required: [true, "Password is required"],
    },

    // Store the current refresh token (or its hash) here.
    // This lets us revoke it on logout or detect token reuse.
    // Set to null when user logs out.
    refreshToken: {
      type: String,
      default: null,
    },
  },
  {
    // Adds createdAt and updatedAt fields automatically
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
