// controllers/bookmarkController.js
const Bookmark = require("../models/Bookmark");
const Post = require("../models/Post");

// @desc    Bookmark or un-bookmark a post (toggle)
// @route   POST /api/bookmarks/:postId
// @access  Private
const toggleBookmark = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const existing = await Bookmark.findOne({ user: req.user.id, post: post._id });

    if (existing) {
      await existing.deleteOne();
      return res.json({ bookmarked: false });
    }

    await Bookmark.create({ user: req.user.id, post: post._id });
    res.status(201).json({ bookmarked: true });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    List the logged-in user's bookmarked posts, newest first
// @route   GET /api/bookmarks
// @access  Private
const getBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate({
        path: "post",
        populate: { path: "author", select: "username displayName avatarUrl" },
      });

    // A bookmarked post may have since been deleted — filter those out.
    const posts = bookmarks.filter((b) => b.post).map((b) => b.post);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { toggleBookmark, getBookmarks };
