// routes/postRoutes.js
const express = require("express");
const router = express.Router();
const {
  createPost,
  getFeedPosts,
  getUserPosts,
  getPostById,
  editPost,
  deletePost,
  toggleLike,
  addComment,
  getComments,
  toggleRepost,
  getTrending,
} = require("../controllers/postController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Specific/static paths BEFORE the "/:id" dynamic ones.
router.get("/feed", protect, getFeedPosts);
router.get("/trending/hashtags", protect, getTrending);
router.get("/user/:userId", protect, getUserPosts);

router.post("/", protect, upload.array("images", 4), createPost);

router.get("/:id", protect, getPostById);
router.put("/:id", protect, editPost);
router.delete("/:id", protect, deletePost);
router.put("/:id/like", protect, toggleLike);
router.post("/:id/comments", protect, addComment);
router.get("/:id/comments", protect, getComments);
router.post("/:id/repost", protect, toggleRepost);

module.exports = router;
