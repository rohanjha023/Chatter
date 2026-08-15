// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", (req, res, next) => {
  console.log("AUTH ROUTE /register hit");
  console.log("Body keys:", Object.keys(req.body || {}));
  next();
}, registerUser);

router.post("/login", (req, res, next) => {
  console.log("AUTH ROUTE /login hit");
  console.log("Body email:", req.body?.email || "NO_EMAIL");
  next();
}, loginUser);

router.get("/me", (req, res, next) => {
  console.log("AUTH ROUTE /me hit");
  console.log("Auth header present:", !!req.headers.authorization);
  next();
}, protect, getMe);

module.exports = router;
