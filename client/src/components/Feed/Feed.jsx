// src/components/Feed/Feed.jsx
// Same layout/idea as your original file (search bar + CreatePost + list of
// PostCards) — rewired from dummy/local-state data to the real backend:
//   - GET /api/posts/feed for the initial + "load more" pages (cursor pagination)
//   - Socket.io "post:new" event to prepend posts live, without refreshing
//   - Infinite scroll via IntersectionObserver on a bottom sentinel <div>
import { useCallback, useEffect, useRef, useState } from "react";
import CreatePost from "../CreatePost/CreatePost";
import PostCard from "../PostCard/PostCard";
import api from "../../services/api";
import { getSocket } from "../../services/socket";

function Feed() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef(null);

  const loadPage = useCallback(async (cursor) => {
    const { data } = await api.get("/posts/feed", { params: cursor ? { cursor } : {} });
    setPosts((prev) => (cursor ? [...prev, ...data.posts] : data.posts));
    setNextCursor(data.nextCursor);
  }, []);

  // Initial load
  useEffect(() => {
    setLoading(true);
    loadPage(null).finally(() => setLoading(false));
  }, [loadPage]);

  // Real-time: new posts / comment counts / deletions pushed by the server.
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewPost = (post) => {
      // Avoid duplicating your own post (already added optimistically on submit).
      setPosts((prev) => (prev.some((p) => p._id === post._id) ? prev : [post, ...prev]));
    };
    const handleUpdated = ({ postId, likesCount, repostsCount }) => {
      setPosts((prev) => prev.map((p) => (p._id === postId ? { ...p, likesCount, repostsCount } : p)));
    };
    const handleComment = ({ postId }) => {
      setPosts((prev) => prev.map((p) => (p._id === postId ? { ...p, repliesCount: (p.repliesCount || 0) + 1 } : p)));
    };
    const handleDeleted = ({ postId }) => {
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    };

    socket.on("post:new", handleNewPost);
    socket.on("post:updated", handleUpdated);
    socket.on("post:comment", handleComment);
    socket.on("post:deleted", handleDeleted);

    return () => {
      socket.off("post:new", handleNewPost);
      socket.off("post:updated", handleUpdated);
      socket.off("post:comment", handleComment);
      socket.off("post:deleted", handleDeleted);
    };
  }, []);

  // Infinite scroll: when the bottom sentinel becomes visible, fetch the next page.
  useEffect(() => {
    if (!nextCursor) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          setLoadingMore(true);
          loadPage(nextCursor).finally(() => setLoadingMore(false));
        }
      },
      { threshold: 1 }
    );
    const node = sentinelRef.current;
    if (node) observer.observe(node);
    return () => {
      if (node) observer.unobserve(node);
    };
  }, [nextCursor, loadingMore, loadPage]);

  // Create Post — sends multipart/form-data (text + optional images) to the backend.
  const addPost = async (formData) => {
    const { data } = await api.post("/posts", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setPosts((prev) => (prev.some((p) => p._id === data._id) ? prev : [data, ...prev]));
  };

  // Delete Post
  const deletePost = async (id) => {
    await api.delete(`/posts/${id}`);
    setPosts((prev) => prev.filter((post) => post._id !== id));
  };

  // Search (client-side filter over already-loaded posts)
  const filteredPosts = posts.filter(
    (post) =>
      post.author?.displayName?.toLowerCase().includes(search.toLowerCase()) ||
      post.author?.username?.toLowerCase().includes(search.toLowerCase()) ||
      post.content?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Search */}
      <div className="p-4">
        <input
          type="text"
          placeholder="Search posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 rounded-full bg-gray-900 outline-none text-white border border-gray-800 focus:border-blue-500"
        />
      </div>

      {/* Create Post */}
      <CreatePost onPostCreated={addPost} />

      {/* Posts */}
      {loading ? (
        <div className="text-center text-gray-500 py-10">Loading feed...</div>
      ) : filteredPosts.length > 0 ? (
        <>
          {filteredPosts.map((post) => (
            <PostCard key={post._id} post={post} onDelete={deletePost} />
          ))}
          {/* Invisible sentinel that triggers the next page when scrolled into view. */}
          <div ref={sentinelRef} className="h-10" />
          {loadingMore && <div className="text-center text-gray-500 py-4">Loading more...</div>}
          {!nextCursor && <div className="text-center text-gray-600 text-sm py-6">You're all caught up 🎉</div>}
        </>
      ) : (
        <div className="text-center text-gray-500 py-10">No posts found.</div>
      )}
    </>
  );
}

export default Feed;
