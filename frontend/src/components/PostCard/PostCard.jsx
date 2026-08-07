import { useState } from "react";
import { FaComment, FaHeart, FaRetweet, FaShare } from "react-icons/fa";

function PostCard({ post, onDelete }) {
  const [likes, setLikes] = useState(125);
  const [liked, setLiked] = useState(false);

  const [reposts, setReposts] = useState(8);
  const [reposted, setReposted] = useState(false);

  const [comments, setComments] = useState(["Awesome 🔥", "Nice Project ❤️"]);

  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");

  
  const handleLike = () => {
    if (liked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setLiked(!liked);
  };

  
  const handleRepost = () => {
    if (reposted) {
      setReposts(reposts - 1);
    } else {
      setReposts(reposts + 1);
    }
    setReposted(!reposted);
  };

  
  const handleComment = () => {
    if (!newComment.trim()) return;

    setComments([...comments, newComment]);
    setNewComment("");
  };


  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "SocialFeed",
          text: post.content,
          url,
        });
      } catch (err) {}
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link Copied");
    }
  };

  return (
    <div className="border-b border-gray-800 p-5">
      <div className="flex gap-4">
        <img
          src={post.image}
          alt={post.name}
          className="w-12 h-12 rounded-full"
        />

        <div className="flex-1">
          <h2 className="font-bold">{post.name}</h2>

          <p className="text-gray-400">@{post.username}</p>

          <p className="mt-3">{post.content}</p>

          {post.postImage && (
            <img
              src={post.postImage}
              alt="Post"
              className="mt-4 w-full rounded-2xl border border-gray-800 object-cover max-h-[450px]"
            />
          )}

          <div className="flex justify-between mt-5 text-gray-400">
            {/* Comment */}
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 hover:text-blue-500"
            >
              <FaComment />
              <span>{comments.length}</span>
            </button>

            {/* Repost */}
            <button
              onClick={handleRepost}
              className={`flex items-center gap-2 ${
                reposted ? "text-green-500" : "hover:text-green-500"
              }`}
            >
              <FaRetweet />
              <span>{reposts}</span>
            </button>

            {/* Like */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 ${
                liked ? "text-red-500" : "hover:text-red-500"
              }`}
            >
              <FaHeart />
              <span>{likes}</span>
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="flex items-center gap-2 hover:text-blue-500"
            >
              <FaShare />
            </button>
          </div>

          {showComments && (
            <div className="mt-5 border-t border-gray-700 pt-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 bg-gray-900 rounded-lg p-2 outline-none"
                />

                <button
                  onClick={handleComment}
                  className="bg-blue-500 hover:bg-blue-600 px-4 rounded-lg"
                >
                  Send
                </button>
              </div>

              <div className="mt-4 space-y-2">
                {comments.map((comment, index) => (
                  <div key={index} className="bg-gray-900 rounded-lg p-3">
                    <p className="font-semibold text-blue-400">User</p>

                    <p>{comment}</p>
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
