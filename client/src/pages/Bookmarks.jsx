// src/pages/Bookmarks.jsx
import { useEffect, useState } from "react";
import { Sidebar } from "../components/Sidebar/Sidebar";
import PostCard from "../components/PostCard/PostCard";
import api from "../services/api";

function Bookmarks() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/bookmarks")
      .then((res) => setPosts(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    await api.delete(`/posts/${id}`);
    setPosts((prev) => prev.filter((p) => p._id !== id));
  };

  return (
    <div className="min-h-screen bg-app text-app flex justify-center">
      <Sidebar />
      <main className="w-full max-w-2xl border-x border-app">
        <h1 className="text-xl font-bold p-4 border-b border-app">Bookmarks</h1>

        {loading && <div className="text-center text-gray-500 py-10">Loading...</div>}
        {!loading && posts.length === 0 && (
          <div className="text-center text-gray-500 py-10">You haven't bookmarked anything yet.</div>
        )}

        {posts.map((post) => (
          <PostCard key={post._id} post={post} onDelete={handleDelete} />
        ))}
      </main>
    </div>
  );
}

export default Bookmarks;
