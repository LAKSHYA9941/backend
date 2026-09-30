// --------------------------------------------------
// Auth Validators
// --------------------------------------------------
// Defines express-validator chains for all auth routes:
// register, login, and refresh-token.
// Each validator is an array of checks that run BEFORE
// the validate middleware collects the errors.
// --------------------------------------------------

const { body } = require("express-validator");

/**
 * registerValidator - Validates registration input fields.
 *
 * Checks:
 * - name: must not be empty, trimmed
 * - email: must be a valid email format
 * - password: minimum 6 characters, at least one number
 * - confirmPassword: must match the password field
 */
const registerValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email address")
    .normalizeEmail(), // Converts to lowercase, removes dots in gmail, etc.

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/\d/)
    .withMessage("Password must contain at least one number"),

  // Custom validator: confirmPassword must match password.
  // We use .custom() because this check depends on another field's value.
  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true; // Return true if validation passes
    }),
];

/**
 * loginValidator - Validates login input fields.
 *
 * Checks:
 * - email: must be a valid email format
 * - password: must not be empty
 *
 * Note: We do NOT check password strength here because the user
 * might have registered with older rules. We only verify it exists.
 */
const loginValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

/**
 * refreshTokenValidator - Validates the refresh token request.
 *
 * The refresh token can come from either:
 * 1. An httpOnly cookie named "refreshToken"
 * 2. The request body as "refreshToken"
 *
 * We check the body here; the controller also checks the cookie.
 * This validator is intentionally light because the main validation
 * (signature verification, DB lookup) happens in the controller.
 */
const refreshTokenValidator = [
  // No strict body validation here -- the token comes from cookies primarily.
  // The controller handles the actual token extraction and verification.
];

module.exports = {
  registerValidator,
  loginValidator,
  refreshTokenValidator,
};
