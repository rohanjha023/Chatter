// models/Post.js
// One schema handles 4 "types" of content, Twitter-style:
//   post    -> a normal post
//   reply   -> a comment on another post (parentPost = the post being replied to)
//   repost  -> a plain retweet, no new content (referencedPost = original post)
//   quote   -> a retweet WITH new commentary (content + referencedPost)
// This avoids a separate "Comment" collection — replies ARE posts, which
// keeps counting/populating/real-time logic in one place.

const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: {
      type: String,
      // Plain reposts don't need their own text; everything else does.
      required: function () {
        return this.type !== "repost";
      },
      trim: true,
      maxlength: 2000,
    },
    images: [{ type: String }],
    type: {
      type: String,
      enum: ["post", "reply", "repost", "quote"],
      default: "post",
      index: true,
    },
    // Set only on replies -> the post being commented on.
    parentPost: { type: mongoose.Schema.Types.ObjectId, ref: "Post", default: null, index: true },
    // Set on reposts/quotes -> the original post being shared.
    referencedPost: { type: mongoose.Schema.Types.ObjectId, ref: "Post", default: null },

    likesCount: { type: Number, default: 0 },
    repostsCount: { type: Number, default: 0 },
    repliesCount: { type: Number, default: 0 },
    viewsCount: { type: Number, default: 0 },

    // Extracted from content on save, e.g. "#react" -> "react" (lowercase, no #).
    hashtags: [{ type: String, index: true }],

    // Scaffolded for the optional AI moderation feature (not implemented —
    // every post is auto-"approved" in postController.js for now).
    moderationStatus: { type: String, enum: ["pending", "approved", "flagged"], default: "approved" },
    moderationScore: { type: Number },

    // Scaffolded for the optional monetization features (not implemented).
    isExclusive: { type: Boolean, default: false },
    isSponsored: { type: Boolean, default: false, index: true },
    sponsorDetails: {
      stripePaymentIntentId: String,
      expiresAt: Date,
    },
  },
  { timestamps: true }
);

// Feed queries filter by author + sort by newest first — this composite
// index makes both the per-user profile feed and cursor pagination fast.
PostSchema.index({ author: 1, createdAt: -1 });

module.exports = mongoose.model("Post", PostSchema);
