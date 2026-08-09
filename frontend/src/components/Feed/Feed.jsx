import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import CreatePost from "../CreatePost/CreatePost";
import PostCard from "../PostCard/PostCard";

const initialPosts = [
  {
    id: 1,
    name: "Rohan Kumar",
    username: "rohan",
    content: "Learning React 🚀",
    image: "https://i.pravatar.cc/150?img=1",
    postImage: "https://picsum.photos/600/350?random=1",
  },
  {
    id: 2,
    name: "Aman",
    username: "aman",
    content: "Building Twitter Clone ❤️",
    image: "https://i.pravatar.cc/150?img=2",
    postImage: "https://picsum.photos/600/350?random=2",
  },
  {
    id: 3,
    name: "Priya",
    username: "priya",
    content: "Tailwind CSS is awesome 😍",
    image: "https://i.pravatar.cc/150?img=3",
    postImage: "https://picsum.photos/600/350?random=3",
  },
];

function Feed() {
  const [posts, setPosts] = useState(initialPosts);
  const [search, setSearch] = useState("");
  const { user } = useAuth();

  const addPost = (text, image) => {
    // Agar text bhi nahi aur image bhi nahi hai to post mat banao
    if (!text.trim() && !image) return;

    const newPost = {
      id: Date.now(),
      name: user?.displayName || "Anonymous",
      username: user?.username || "anonymous",
      content: text,
      image: user?.avatarUrl || "https://i.pravatar.cc/150?img=1",
      postImage: image || null,
      isOwnPost: true,
    };

    setPosts([newPost, ...posts]);
  };

  const filteredPosts = posts.filter(
    (post) =>
      post.name.toLowerCase().includes(search.toLowerCase()) ||
      post.content.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <input
        type="text"
        placeholder="Search posts..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-3 rounded-full bg-gray-100 dark:bg-gray-900 outline-none text-black dark:text-white mb-4"
      />

      <CreatePost addPost={addPost} />

      {filteredPosts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onDelete={(id) => setPosts(posts.filter((p) => p.id !== id))}
        />
      ))}
    </>
  );
}

export default Feed;
