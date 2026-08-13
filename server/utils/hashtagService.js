// utils/hashtagService.js
// Trending hashtags, backed by Redis when available (fast sorted-set
// increments), otherwise by a plain MongoDB aggregation over recent posts.
// postController.js calls bumpHashtags() when a post is created, and
// getTrendingHashtags() for the "Trending" sidebar.

const { redisClient, isRedisReady } = require("../config/redis");
const Post = require("../models/Post");

const TRENDING_KEY = "trending:hashtags";

/** Call once per new post, with that post's hashtags array. */
const bumpHashtags = async (hashtags = []) => {
  if (!hashtags.length) return;

  if (isRedisReady()) {
    try {
      const pipeline = redisClient.pipeline();
      hashtags.forEach((tag) => pipeline.zincrby(TRENDING_KEY, 1, tag));
      await pipeline.exec();
      return;
    } catch (err) {
      console.warn("Redis hashtag bump failed, ignoring (Mongo fallback still works):", err.message);
    }
  }
  // No Redis write needed for the Mongo fallback — getTrendingHashtags()
  // recomputes counts directly from the Post collection on read.
};

/** Returns top N trending hashtags as [{ tag, count }]. */
const getTrendingHashtags = async (limit = 10) => {
  if (isRedisReady()) {
    try {
      // ZREVRANGE ... WITHSCORES gives [tag1, score1, tag2, score2, ...]
      const raw = await redisClient.zrevrange(TRENDING_KEY, 0, limit - 1, "WITHSCORES");
      const result = [];
      for (let i = 0; i < raw.length; i += 2) {
        result.push({ tag: raw[i], count: Number(raw[i + 1]) });
      }
      if (result.length) return result;
    } catch (err) {
      console.warn("Redis hashtag read failed, using MongoDB fallback:", err.message);
    }
  }

  // MongoDB fallback: count hashtag occurrences on posts from the last 7 days.
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const rows = await Post.aggregate([
    { $match: { createdAt: { $gte: since }, hashtags: { $exists: true, $ne: [] } } },
    { $unwind: "$hashtags" },
    { $group: { _id: "$hashtags", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
  ]);

  return rows.map((r) => ({ tag: r._id, count: r.count }));
};

module.exports = { bumpHashtags, getTrendingHashtags };
