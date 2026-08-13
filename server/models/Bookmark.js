// models/Bookmark.js
// Private "save for later" list — one document per (user, post).
// Bookmarks are never shown to anyone but the user who made them.

const mongoose = require("mongoose");

const BookmarkSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
  },
  { timestamps: true }
);

BookmarkSchema.index({ user: 1, post: 1 }, { unique: true });

module.exports = mongoose.model("Bookmark", BookmarkSchema);
