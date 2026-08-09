import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import CreatePost from "../CreatePost/CreatePost";
import PostCard from "../PostCard/PostCard";
import axios from "axios";
import toast from "react-hot-toast";

function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { token } = useAuth();

  useEffect(() => {
    const fetchFeed = async () => {
      if (!token) return;
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const { data } = await axios.get("/api/posts/feed", config);
        setPosts(data);
      } catch (error) {
        console.error("Error fetching feed posts:", error);
        toast.error("Failed to load feed");
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [token]);

  const addPost = async (text, image) => {
    if (!text.trim() && !image) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.post(
        "/api/posts",
        {
          content: text,
          images: image ? [image] : [],
        },
        config
      );

      setPosts((prevPosts) => [data, ...prevPosts]);
      toast.success("Post published!");
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to post");
    }
  };

  const filteredPosts = posts.filter(
    (post) =>
      post.author?.displayName?.toLowerCase().includes(search.toLowerCase()) ||
      post.author?.username?.toLowerCase().includes(search.toLowerCase()) ||
      post.content?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse mt-4">
        <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-full w-full"></div>
        <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl w-full"></div>
        <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-2xl w-full"></div>
      </div>
    );
  }

  return (
    <>
      <input
        type="text"
        placeholder="Search posts..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-3 rounded-full bg-gray-100 dark:bg-gray-900 outline-none text-black dark:text-white mb-4 focus:ring-2 focus:ring-blue-500"
      />

      <CreatePost addPost={addPost} />

      {filteredPosts.length === 0 ? (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
          No posts found.
        </div>
      ) : (
        filteredPosts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            onDelete={(id) => setPosts(posts.filter((p) => p._id !== id))}
          />
        ))
      )}
    </>
  );
}

export default Feed;
