// config/redis.js
// Redis is used ONLY for the "trending hashtags" sorted-set counter
// (fast increment + top-N read). It is OPTIONAL:
//   - If REDIS_URL is set in .env and Redis is reachable, we use it.
//   - If not, hashtagService.js automatically falls back to a MongoDB
//     aggregation query on the Post collection, so trending hashtags
//     still work without installing/running Redis. This mirrors the
//     Cloudinary fallback pattern already used in this project.

const Redis = require("ioredis");

let redisClient = null;
let isRedisConfigured = false;

if (process.env.REDIS_URL) {
  try {
    redisClient = new Redis(process.env.REDIS_URL, {
      // Don't crash the whole app if Redis is briefly unavailable —
      // just log it and keep using the Mongo fallback for that request.
      maxRetriesPerRequest: 1,
      retryStrategy: () => null, // stop retrying, fall back instead
      lazyConnect: true,
    });

    redisClient
      .connect()
      .then(() => {
        isRedisConfigured = true;
        console.log("Redis connected — trending hashtags will use Redis.");
      })
      .catch((err) => {
        console.warn(
          "Redis connection failed — falling back to MongoDB for trending hashtags.",
          err.message
        );
        isRedisConfigured = false;
      });

    redisClient.on("error", (err) => {
      // Swallow further errors after startup so the app never crashes
      // because Redis went away; hashtagService checks isRedisConfigured.
      isRedisConfigured = false;
    });
  } catch (err) {
    console.warn("Could not initialize Redis client:", err.message);
  }
} else {
  console.warn(
    "REDIS_URL not set in .env — trending hashtags will use MongoDB aggregation instead of Redis."
  );
}

module.exports = {
  redisClient,
  // Read this as a function elsewhere (isRedisReady()) since the value
  // can flip to false at runtime if Redis disconnects.
  isRedisReady: () => isRedisConfigured,
};
