// routes/bookmarkRoutes.js
const express = require("express");
const router = express.Router();
const { toggleBookmark, getBookmarks } = require("../controllers/bookmarkController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getBookmarks);
router.post("/:postId", protect, toggleBookmark);

module.exports = router;
