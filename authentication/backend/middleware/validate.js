// --------------------------------------------------
// Validation Middleware
// --------------------------------------------------
// This middleware runs after express-validator checks
// have been defined on a route. It collects any
// validation errors and returns them as a structured
// 400 response. If there are no errors, it calls next()
// to let the request continue to the controller.
// --------------------------------------------------

const { validationResult } = require("express-validator");

/**
 * validate - Checks for validation errors from express-validator.
 *
 * This is used as the LAST middleware in the validation chain,
 * after all the individual field checks (body, param, query).
 *
 * Example route setup:
 *   router.post("/register", [...validationRules], validate, controller);
 *
 * If validation fails, it returns a response like:
 * {
 *   success: false,
 *   errors: [
 *     { field: "email", message: "Must be a valid email" },
 *     { field: "password", message: "Must be at least 6 characters" }
 *   ]
 * }
 */
const validate = (req, res, next) => {
  // Collect all validation errors from the request
  const errors = validationResult(req);

  // If there are no errors, continue to the controller
  if (errors.isEmpty()) {
    return next();
  }

  // Format errors into a clean array with field name and message.
  // This makes it easy for the frontend to show field-level errors.
  const formattedErrors = errors.array().map((err) => ({
    field: err.path,     // Which field failed validation (e.g., "email", "password")
    message: err.msg,    // The human-readable error message
  }));

  // Return 400 Bad Request with the list of validation errors
  return res.status(400).json({
    success: false,
    errors: formattedErrors,
  });
};

module.exports = validate;
