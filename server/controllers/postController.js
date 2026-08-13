// controllers/postController.js
const Post = require("../models/Post");
const User = require("../models/User");
const Like = require("../models/Like");
const Notification = require("../models/Notification");
const { extractHashtags } = require("../utils/hashtags");
const { bumpHashtags, getTrendingHashtags } = require("../utils/hashtagService");
const { uploadImage } = require("../utils/uploadImage");
const { getIO } = require("../socket");
const { sendPushToUser } = require("../utils/push");

const AUTHOR_FIELDS = "username displayName avatarUrl";

// @desc    Create a new post (text + up to 4 images)
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
  try {
    const { content } = req.body;

    if ((!content || !content.trim()) && (!req.files || req.files.length === 0)) {
      return res.status(400).json({ message: "Post content or at least one image is required" });
    }

    // Upload any attached images (field name: "images", up to 4 — see postRoutes.js).
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = await Promise.all(
        req.files.map((file) => uploadImage(file.buffer, file.originalname, "posts", req))
      );
    }

    const hashtags = extractHashtags(content || "");

    const post = await Post.create({
      author: req.user.id,
      content,
      images: imageUrls,
      hashtags,
    });

    await bumpHashtags(hashtags);

    const populatedPost = await Post.findById(post._id).populate("author", AUTHOR_FIELDS);

    // Broadcast the new post to everyone currently on the feed in real time.
    getIO().to("feed").emit("post:new", populatedPost);

    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get the home feed (posts from people you follow + yourself),
//          cursor-paginated for infinite scroll.
// @route   GET /api/posts/feed?cursor=<postId>&limit=10
// @access  Private
const getFeedPosts = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 30);
    const { cursor } = req.query;

    const currentUser = await User.findById(req.user.id);
    if (!currentUser) return res.status(404).json({ message: "User not found" });

    const authorIds = [req.user.id, ...(currentUser.following || [])];

    // Base query: only real top-level posts and quotes belong on the feed
    // (plain replies show up under the post they belong to instead).
    const query = { author: { $in: authorIds }, type: { $in: ["post", "quote", "repost"] } };

    if (cursor) {
      // Cursor-based pagination: "give me posts older than this post's _id".
      // Works because Mongo ObjectIds are chronologically sortable.
      query._id = { $lt: cursor };
    }

    let posts = await Post.find(query)
      .populate("author", AUTHOR_FIELDS)
      .populate({ path: "referencedPost", populate: { path: "author", select: AUTHOR_FIELDS } })
      .sort({ _id: -1 })
      .limit(limit + 1); // fetch one extra to know if there's a next page

    // Fallback for brand-new accounts following nobody yet: show recent public posts.
    if (posts.length === 0 && !cursor) {
      posts = await Post.find({ type: { $in: ["post", "quote", "repost"] } })
        .populate("author", AUTHOR_FIELDS)
        .populate({ path: "referencedPost", populate: { path: "author", select: AUTHOR_FIELDS } })
        .sort({ _id: -1 })
        .limit(limit + 1);
    }

    const hasMore = posts.length > limit;
    const page = hasMore ? posts.slice(0, limit) : posts;
    const nextCursor = hasMore ? page[page.length - 1]._id : null;

    // Attach "did I like this post" flags in one query instead of N queries.
    const postIds = page.map((p) => p._id);
    const myLikes = await Like.find({ user: req.user.id, post: { $in: postIds } }).select("post");
    const likedSet = new Set(myLikes.map((l) => l.post.toString()));

    res.json({
      posts: page.map((p) => ({ ...p.toObject(), isLikedByMe: likedSet.has(p._id.toString()) })),
      nextCursor,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get posts authored by a specific user (their profile feed)
// @route   GET /api/posts/user/:userId
// @access  Private
const getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.userId, type: { $in: ["post", "quote", "repost"] } })
      .populate("author", AUTHOR_FIELDS)
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get a single post with its author populated
// @route   GET /api/posts/:id
// @access  Private
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("author", AUTHOR_FIELDS);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Edit your own post's text (images/type are not editable)
// @route   PUT /api/posts/:id
// @access  Private
const editPost = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ message: "Content cannot be empty" });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only edit your own posts" });
    }

    post.content = content;
    post.hashtags = extractHashtags(content);
    await post.save();

    const populated = await Post.findById(post._id).populate("author", AUTHOR_FIELDS);
    getIO().to("feed").emit("post:edited", populated);
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete your own post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only delete your own posts" });
    }

    await post.deleteOne();
    await Like.deleteMany({ post: post._id });
    // Also drop replies that belonged to this post so the thread doesn't dangle.
    await Post.deleteMany({ parentPost: post._id });

    getIO().to("feed").emit("post:deleted", { postId: post._id });
    res.json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Like or unlike a post (toggle)
// @route   PUT /api/posts/:id/like
// @access  Private
const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const existingLike = await Like.findOne({ user: req.user.id, post: post._id });
    let liked;

    if (existingLike) {
      await existingLike.deleteOne();
      post.likesCount = Math.max(0, post.likesCount - 1);
      liked = false;
    } else {
      await Like.create({ user: req.user.id, post: post._id });
      post.likesCount += 1;
      liked = true;
    }
    await post.save();

    // Real-time count update for anyone viewing this post right now.
    getIO().to("feed").emit("post:updated", { postId: post._id, likesCount: post.likesCount, repostsCount: post.repostsCount });

    // Notify the author (but never notify yourself for liking your own post).
    if (liked && post.author.toString() !== req.user.id) {
      const notification = await Notification.create({ recipient: post.author, sender: req.user.id, type: "like", post: post._id });
      getIO().to(`user:${post.author}`).emit("notification:new", {
        _id: notification._id,
        type: "like",
        sender: { _id: req.user._id, username: req.user.username, displayName: req.user.displayName, avatarUrl: req.user.avatarUrl },
        post: post._id,
        createdAt: notification.createdAt,
      });
      const author = await User.findById(post.author);
      sendPushToUser(author, { title: "New like", body: `${req.user.displayName} liked your post` });
    }

    res.json({ liked, likesCount: post.likesCount });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Add a comment (reply) to a post
// @route   POST /api/posts/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ message: "Comment cannot be empty" });

    const parentPost = await Post.findById(req.params.id);
    if (!parentPost) return res.status(404).json({ message: "Post not found" });

    const comment = await Post.create({
      author: req.user.id,
      content,
      type: "reply",
      parentPost: parentPost._id,
    });

    parentPost.repliesCount += 1;
    await parentPost.save();

    const populatedComment = await Post.findById(comment._id).populate("author", AUTHOR_FIELDS);

    getIO().to("feed").emit("post:comment", { postId: parentPost._id, comment: populatedComment });

    if (parentPost.author.toString() !== req.user.id) {
      const notification = await Notification.create({ recipient: parentPost.author, sender: req.user.id, type: "reply", post: parentPost._id });
      getIO().to(`user:${parentPost.author}`).emit("notification:new", {
        _id: notification._id,
        type: "reply",
        sender: { _id: req.user._id, username: req.user.username, displayName: req.user.displayName, avatarUrl: req.user.avatarUrl },
        post: parentPost._id,
        createdAt: notification.createdAt,
      });
      const author = await User.findById(parentPost.author);
      sendPushToUser(author, { title: "New reply", body: `${req.user.displayName} replied to your post` });
    }

    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get comments (replies) for a post, oldest first
// @route   GET /api/posts/:id/comments
// @access  Private
const getComments = async (req, res) => {
  try {
    const comments = await Post.find({ parentPost: req.params.id, type: "reply" })
      .populate("author", AUTHOR_FIELDS)
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Repost, or unrepost, a post. Pass `content` in the body to make
//          it a quote-post (repost + your own commentary) instead.
// @route   POST /api/posts/:id/repost
// @access  Private
const toggleRepost = async (req, res) => {
  try {
    const original = await Post.findById(req.params.id);
    if (!original) return res.status(404).json({ message: "Post not found" });

    const { content } = req.body;
    const type = content && content.trim() ? "quote" : "repost";

    // Only plain reposts (no commentary) are toggleable/undo-able, like Twitter.
    const existing = await Post.findOne({ author: req.user.id, referencedPost: original._id, type: "repost" });

    if (existing && type === "repost") {
      await existing.deleteOne();
      original.repostsCount = Math.max(0, original.repostsCount - 1);
      await original.save();
      getIO().to("feed").emit("post:updated", { postId: original._id, likesCount: original.likesCount, repostsCount: original.repostsCount });
      return res.json({ reposted: false, repostsCount: original.repostsCount });
    }

    const repost = await Post.create({
      author: req.user.id,
      content: type === "quote" ? content : undefined,
      type,
      referencedPost: original._id,
    });

    original.repostsCount += 1;
    await original.save();

    const populated = await Post.findById(repost._id)
      .populate("author", AUTHOR_FIELDS)
      .populate({ path: "referencedPost", populate: { path: "author", select: AUTHOR_FIELDS } });

    getIO().to("feed").emit("post:new", populated);
    getIO().to("feed").emit("post:updated", { postId: original._id, likesCount: original.likesCount, repostsCount: original.repostsCount });

    if (original.author.toString() !== req.user.id) {
      await Notification.create({ recipient: original.author, sender: req.user.id, type: "repost", post: original._id });
    }

    res.status(201).json({ reposted: true, repostsCount: original.repostsCount, post: populated });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Top trending hashtags right now
// @route   GET /api/posts/trending/hashtags
// @access  Private
const getTrending = async (req, res) => {
  try {
    const trending = await getTrendingHashtags(10);
    res.json(trending);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
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
};
