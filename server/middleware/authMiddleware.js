// middleware/authMiddleware.js
// Protects any route it's attached to. Expects:
//   Authorization: Bearer <jwt-token>
// On success it attaches the logged-in user (minus password) to req.user
// so every controller after this can just read req.user.id / req.user._id.

const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  console.log("AUTH MIDDLEWARE => authorization header:", req.headers.authorization || "MISSING");

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log("AUTH MIDDLEWARE => token present:", !!token);

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("AUTH MIDDLEWARE => decoded payload:", decoded);

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        console.log("AUTH MIDDLEWARE => user not found for id:", decoded.id);
        return res.status(401).json({ message: "Not authorized, user not found" });
      }

      console.log("AUTH MIDDLEWARE => user found:", req.user._id.toString());
      next();
    } catch (error) {
      console.error("AUTH MIDDLEWARE => jwt verification failed");
      console.error(error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    console.log("AUTH MIDDLEWARE => missing or malformed Authorization header");
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = { protect };
