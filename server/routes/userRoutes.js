// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const {
  getUserProfile,
  updateProfile,
  getSuggestedUsers,
  followUser,
  subscribeToPush,
  unsubscribeFromPush,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// IMPORTANT: specific routes must come before the "/:username" catch-all,
// otherwise Express would treat "push" or "follow" as a username.
router.get("/", protect, getSuggestedUsers);
router.put("/profile", protect, upload.single("avatar"), updateProfile);
router.put("/follow/:id", protect, followUser);
router.post("/push/subscribe", protect, subscribeToPush);
router.post("/push/unsubscribe", protect, unsubscribeFromPush);
router.get("/:username", protect, getUserProfile);

module.exports = router;
