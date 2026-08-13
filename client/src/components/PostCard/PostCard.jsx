// src/components/PostCard/PostCard.jsx
// Same UI/interactions as your original file, rewired from local fake state
// to the real backend:
//   - Like  -> PUT  /api/posts/:id/like        (optimistic UI update)
//   - Comment -> POST/GET /api/posts/:id/comments
//   - Repost -> POST /api/posts/:id/repost
//   - Bookmark -> POST /api/bookmarks/:postId
//   - Edit  -> PUT  /api/posts/:id
//   - Delete -> DELETE /api/posts/:id (via onDelete prop, handled in Feed.jsx)
import { useState } from "react";
import {
  FaComment,
  FaHeart,
  FaRetweet,
  FaShare,
  FaEdit,
  FaTrash,
  FaRegBookmark,
  FaBookmark,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

function PostCard({ post, onDelete }) {
  const { user } = useAuth();
  const isOwnPost = post.author?._id === user?._id;

  const [likes, setLikes] = useState(post.likesCount || 0);
  const [liked, setLiked] = useState(post.isLikedByMe || false);

  const [reposts, setReposts] = useState(post.repostsCount || 0);
  const [reposted, setReposted] = useState(false);

  const [comments, setComments] = useState([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [commentsCount, setCommentsCount] = useState(post.repliesCount || 0);

  const [bookmarked, setBookmarked] = useState(false);

  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(post.content);
  const [content, setContent] = useState(post.content);

  // Like — updates the UI immediately, then confirms with the server.
  const handleLike = async () => {
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikes((prev) => (wasLiked ? prev - 1 : prev + 1));
    try {
      const { data } = await api.put(`/posts/${post._id}/like`);
      setLiked(data.liked);
      setLikes(data.likesCount);
    } catch {
      // Roll back on failure.
      setLiked(wasLiked);
      setLikes((prev) => (wasLiked ? prev + 1 : prev - 1));
    }
  };

  // Repost (plain retweet, toggleable — quote-posting isn't wired into this
  // compact card, but the backend endpoint supports it via `content`).
  const handleRepost = async () => {
    try {
      const { data } = await api.post(`/posts/${post._id}/repost`, {});
      setReposted(data.reposted);
      setReposts(data.repostsCount);
    } catch {
      /* ignore */
    }
  };

  // Load comments the first time the comment panel is opened.
  const handleToggleComments = async () => {
    setShowComments((prev) => !prev);
    if (!commentsLoaded) {
      try {
        const { data } = await api.get(`/posts/${post._id}/comments`);
        setComments(data);
        setCommentsLoaded(true);
      } catch {
        /* ignore */
      }
    }
  };

  // Add Comment
  const handleComment = async () => {
    if (!newComment.trim()) return;
    try {
      const { data } = await api.post(`/posts/${post._id}/comments`, { content: newComment });
      setComments((prev) => [...prev, data]);
      setCommentsCount((prev) => prev + 1);
      setNewComment("");
    } catch {
      /* ignore */
    }
  };

  // Bookmark
  const handleBookmark = async () => {
    try {
      const { data } = await api.post(`/bookmarks/${post._id}`);
      setBookmarked(data.bookmarked);
    } catch {
      /* ignore */
    }
  };

  // Share
  const handleShare = async () => {
    const url = `${window.location.origin}/post/${post._id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "SocialFeed", text: content, url });
      } catch (error) {
        console.log(error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        alert("Link Copied ✅");
      } catch {
        alert("Unable to copy link");
      }
    }
  };

  // Edit
  const handleSaveEdit = async () => {
    if (!editText.trim()) return;
    try {
      const { data } = await api.put(`/posts/${post._id}`, { content: editText });
      setContent(data.content);
      setEditing(false);
    } catch {
      /* ignore */
    }
  };

  // Delete
  const handleDelete = () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this post?");
    if (confirmDelete) onDelete(post._id);
  };

  return (
    <div className="border-b border-app p-5">
      <div className="flex gap-4">
        <img
          src={post.author?.avatarUrl || `https://i.pravatar.cc/150?u=${post.author?.username}`}
          alt={post.author?.displayName}
          className="w-12 h-12 rounded-full object-cover"
        />

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-bold">{post.author?.displayName}</h2>
              <p className="text-gray-400">@{post.author?.username}</p>
            </div>

            {isOwnPost && (
              <div className="flex items-center gap-4">
                <button onClick={() => setEditing(true)} className="text-blue-400 hover:text-blue-500" title="Edit Post">
                  <FaEdit />
                </button>
                <button onClick={handleDelete} className="text-red-500 hover:text-red-600" title="Delete Post">
                  <FaTrash />
                </button>
              </div>
            )}
          </div>

          {editing ? (
            <div className="mt-4">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows="3"
                className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 outline-none resize-none"
              />
              <div className="flex gap-3 mt-3">
                <button onClick={handleSaveEdit} className="bg-blue-500 hover:bg-blue-600 px-5 py-2 rounded-full">
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditText(content);
                    setEditing(false);
                  }}
                  className="bg-gray-700 hover:bg-gray-600 px-5 py-2 rounded-full"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              {content && <p className="mt-3 whitespace-pre-wrap break-words">{content}</p>}

              {post.images?.length > 0 && (
                <div className={`mt-4 grid gap-2 ${post.images.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                  {post.images.map((src) => (
                    <img
                      key={src}
                      src={src}
                      alt="Post attachment"
                      className="w-full rounded-2xl border border-app object-cover max-h-[450px]"
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between mt-5 text-gray-400">
            <button onClick={handleToggleComments} className="flex items-center gap-2 hover:text-blue-500">
              <FaComment />
              <span>{commentsCount}</span>
            </button>

            <button
              onClick={handleRepost}
              className={`flex items-center gap-2 ${reposted ? "text-green-500" : "hover:text-green-500"}`}
            >
              <FaRetweet />
              <span>{reposts}</span>
            </button>

            <button onClick={handleLike} className={`flex items-center gap-2 ${liked ? "text-red-500" : "hover:text-red-500"}`}>
              <FaHeart />
              <span>{likes}</span>
            </button>

            <button onClick={handleBookmark} className={`flex items-center gap-2 ${bookmarked ? "text-blue-400" : "hover:text-blue-400"}`}>
              {bookmarked ? <FaBookmark /> : <FaRegBookmark />}
            </button>

            <button onClick={handleShare} className="flex items-center gap-2 hover:text-blue-500">
              <FaShare />
            </button>
          </div>

          {/* Comment Section */}
          {showComments && (
            <div className="mt-5 border-t border-app pt-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleComment();
                  }}
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-2 outline-none focus:border-blue-500"
                />
                <button onClick={handleComment} className="bg-blue-500 hover:bg-blue-600 px-4 rounded-lg">
                  Send
                </button>
              </div>

              <div className="mt-4 space-y-2">
                {comments.map((comment) => (
                  <div key={comment._id} className="bg-gray-900 rounded-lg p-3">
                    <p className="font-semibold text-blue-400">{comment.author?.displayName || "User"}</p>
                    <p className="text-gray-200">{comment.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PostCard;
