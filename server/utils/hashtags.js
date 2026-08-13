// utils/hashtags.js
// Pulls "#word" tags out of post text. Used when a post is created so we
// can (a) store them on the Post document and (b) bump their trending
// counter (see services/hashtagService.js).

const extractHashtags = (text = "") => {
  const matches = text.match(/#[a-zA-Z0-9_]+/g) || [];
  // Lowercase + dedupe + strip the leading "#" for storage.
  const unique = new Set(matches.map((tag) => tag.slice(1).toLowerCase()));
  return Array.from(unique);
};

module.exports = { extractHashtags };
