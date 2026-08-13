// models/Like.js
// One document per (user, post) like. The unique compound index is what
// actually enforces "a user can only like a post once" at the DB level —
// postController.js relies on this instead of re-checking manually.

const mongoose = require("mongoose");

const LikeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true, index: true },
  },
  { timestamps: true }
);

LikeSchema.index({ user: 1, post: 1 }, { unique: true });

module.exports = mongoose.model("Like", LikeSchema);
