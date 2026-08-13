// src/pages/Profile.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Sidebar } from "../components/Sidebar/Sidebar";
import PostCard from "../components/PostCard/PostCard";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

function Profile() {
  const { username } = useParams();
  const { user: me } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ displayName: "", bio: "" });
  const [avatarFile, setAvatarFile] = useState(null);

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

  useEffect(() => {
    if (profile && isEditing) {
      setEditForm({ displayName: profile.displayName || "", bio: profile.bio || "" });
      setAvatarFile(null);
    }
  }, [profile, isEditing]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.displayName.trim()) {
      return toast.error("Name is required");
    }
    const formData = new FormData();
    formData.append("displayName", editForm.displayName);
    formData.append("bio", editForm.bio);
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }
    try {
      const { data } = await api.put("/users/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile(data);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating profile");
    }
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
          {me?._id === profile._id ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-full font-semibold bg-app-soft text-app border border-app hover:opacity-80"
            >
              Edit Profile
            </button>
          ) : (
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

      {isEditing && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-app rounded-2xl w-full max-w-md p-6 border border-app shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-app">Edit Profile</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-app font-medium mb-1">Avatar</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAvatarFile(e.target.files[0])}
                  className="w-full text-sm text-app file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600 cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm text-app font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={editForm.displayName}
                  onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                  className="w-full bg-app-soft text-app rounded-lg p-3 outline-none border border-app focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-app font-medium mb-1">Bio</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  rows="3"
                  className="w-full bg-app-soft text-app rounded-lg p-3 outline-none border border-app focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-full border border-app hover:bg-app-soft text-app font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-semibold"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
