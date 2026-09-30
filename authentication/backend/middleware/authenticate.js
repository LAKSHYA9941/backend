// --------------------------------------------------
// Authentication Middleware
// --------------------------------------------------
// This middleware protects routes that require a
// logged-in user. It reads the JWT access token from
// the Authorization header, verifies it, and attaches
// the decoded user info to req.user.
// --------------------------------------------------

const jwt = require("jsonwebtoken");

/**
 * authenticate - Verifies the JWT access token.
 *
 * How it works:
 * 1. Extract the token from "Authorization: Bearer <token>" header.
 * 2. If no token is present, return 401 (Unauthorized).
 * 3. Verify the token using ACCESS_TOKEN_SECRET.
 * 4. If valid, attach the decoded payload (contains userId) to req.user.
 * 5. If invalid or expired, return 401.
 */
const authenticate = (req, res, next) => {
  // Step 1: Get the Authorization header value
  const authHeader = req.headers.authorization;

  // Step 2: Check if the header exists and starts with "Bearer "
  // The format must be: "Bearer <actual-token>"
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  // Step 3: Extract just the token part (everything after "Bearer ")
  const token = authHeader.split(" ")[1];

  try {
    // Step 4: Verify the token using the access secret.
    // jwt.verify() will throw an error if the token is:
    //   - expired (TokenExpiredError)
    //   - malformed (JsonWebTokenError)
    //   - signed with a different secret
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Step 5: Attach the decoded payload to the request object.
    // This makes req.user.userId available in all downstream
    // route handlers and controllers.
    req.user = decoded;

    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    // Token verification failed -- could be expired or invalid
    return res.status(401).json({
      success: false,
      message: "Invalid or expired access token.",
    });
  }
};

module.exports = authenticate;
