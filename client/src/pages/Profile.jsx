// src/pages/Profile.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Sidebar } from "../components/Sidebar/Sidebar";
import PostCard from "../components/PostCard/PostCard";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const { username } = useParams();
  const { user: me } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    api.get(`/users/${username}`).then((res) => {
      setProfile(res.data);
      setIsFollowing(res.data.followers?.includes(me?._id));
      api.get(`/posts/user/${res.data._id}`).then((r) => setPosts(r.data));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const handleFollow = async () => {
    const { data } = await api.put(`/users/follow/${profile._id}`);
    setIsFollowing(data.isFollowing);
  };

  const handleDelete = async (id) => {
    await api.delete(`/posts/${id}`);
    setPosts((prev) => prev.filter((p) => p._id !== id));
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-app text-app flex justify-center">
        <Sidebar />
        <main className="w-full max-w-2xl border-x border-app p-10 text-center text-gray-500">Loading...</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app text-app flex justify-center">
      <Sidebar />
      <main className="w-full max-w-2xl border-x border-app">
        <div className="p-6 border-b border-app flex items-center gap-4">
          <img
            src={profile.avatarUrl || `https://i.pravatar.cc/150?u=${profile.username}`}
            alt={profile.displayName}
            className="w-20 h-20 rounded-full object-cover"
          />
          <div className="flex-1">
            <h1 className="text-xl font-bold">{profile.displayName}</h1>
            <p className="text-gray-400">@{profile.username}</p>
            {profile.bio && <p className="mt-2">{profile.bio}</p>}
            <div className="flex gap-4 mt-2 text-sm text-gray-400">
              <span>
                <strong className="text-app">{profile.following?.length || 0}</strong> Following
              </span>
              <span>
                <strong className="text-app">{profile.followers?.length || 0}</strong> Followers
              </span>
            </div>
          </div>
          {me?._id !== profile._id && (
            <button
              onClick={handleFollow}
              className={`px-4 py-2 rounded-full font-semibold ${
                isFollowing ? "bg-gray-700 hover:bg-red-600" : "bg-white text-black hover:bg-gray-200"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          )}
        </div>

        {posts.map((post) => (
          <PostCard key={post._id} post={post} onDelete={handleDelete} />
        ))}
        {posts.length === 0 && <div className="text-center text-gray-500 py-10">No posts yet.</div>}
      </main>
    </div>
  );
}

export default Profile;
