const jwt = require("jsonwebtoken");

// Middleware to protect routes using JWT
function authMiddleware(req, res, next) {
  const authHeader = req.header("Authorization");

  // Check if token is present
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "No token, access denied" });
  }

  const token = authHeader.split(" ")[1]; // Extract token part

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user ID to request object for access in next handler
    req.user = decoded; // { userId: ..., iat: ..., exp: ... }

    next(); // Proceed to next middleware/route
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    res.status(401).json({ msg: "Invalid or expired token" });
  }
}

module.exports = authMiddleware;
