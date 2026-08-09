import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import axios from "axios";
import PostCard from "../../components/PostCard/PostCard";

function Profile() {
  const { user, updateProfile, token } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || "https://i.pravatar.cc/150?img=10");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!token || !user?._id) return;
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const { data } = await axios.get(`/api/posts/user/${user._id}`, config);
        setPosts(data);
      } catch (error) {
        console.error("Error fetching user posts:", error);
      } finally {
        setPostsLoading(false);
      }
    };

    fetchUserPosts();
  }, [token, user?._id]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    const tempErrors = {};
    if (displayName.trim().length < 2) {
      tempErrors.displayName = "Full Name must be at least 2 characters long";
    } else if (!/^[a-zA-Z\s]+$/.test(displayName)) {
      tempErrors.displayName = "Full Name can only contain letters and spaces";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("displayName", displayName);
    formData.append("bio", bio);
    if (avatar) {
      formData.append("avatar", avatar);
    }

    try {
      await toast.promise(updateProfile(formData), {
        loading: "Updating profile...",
        success: "Profile updated successfully!",
        error: (err) => err.response?.data?.message || "Failed to update profile",
      });
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-black dark:text-white transition-colors duration-300">
      {/* Cover Image Placeholder */}
      <div className="h-52 bg-gradient-to-r from-blue-600 to-purple-600 relative"></div>

      <div className="p-6 relative">
        {/* Avatar */}
        <div className="relative -mt-24 inline-block">
          <img
            src={user?.avatarUrl || "https://i.pravatar.cc/150?img=10"}
            alt="Profile Avatar"
            className="w-36 h-36 rounded-full border-4 border-white dark:border-black object-cover shadow-lg"
          />
        </div>

        {/* Edit Button */}
        <div className="absolute right-6 top-6">
          <button
            onClick={() => {
              setDisplayName(user?.displayName || "");
              setBio(user?.bio || "");
              setAvatar(null);
              setAvatarPreview(user?.avatarUrl || "https://i.pravatar.cc/150?img=10");
              setErrors({});
              setIsEditing(true);
            }}
            className="border border-gray-300 dark:border-gray-700 px-5 py-2 rounded-full font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            Edit Profile
          </button>
        </div>

        {/* User Info */}
        <div className="mt-4">
          <h1 className="text-3xl font-bold">{user?.displayName || "Anonymous"}</h1>
          <p className="text-gray-500 dark:text-gray-400">@{user?.username || "username"}</p>
        </div>

        {/* Bio */}
        <p className="mt-4 text-gray-700 dark:text-gray-300 text-lg leading-relaxed max-w-xl">
          {user?.bio || "No bio added yet. Write something about yourself!"}
        </p>

        {/* Stats */}
        <div className="flex gap-12 mt-8 border-t border-gray-200 dark:border-gray-800 pt-6">
          <div>
            <h2 className="text-2xl font-bold">{posts.length}</h2>
            <p className="text-gray-500 dark:text-gray-400">Posts</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold">{user?.followers?.length || 0}</h2>
            <p className="text-gray-500 dark:text-gray-400">Followers</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold">{user?.following?.length || 0}</h2>
            <p className="text-gray-500 dark:text-gray-400">Following</p>
          </div>
        </div>
      </div>

      {/* User's Posts list */}
      <div className="mt-4 border-t border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold p-6 border-b border-gray-200 dark:border-gray-800">Posts</h2>
        {postsLoading ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">You haven't posted anything yet.</div>
        ) : (
          posts.map(post => (
            <PostCard 
              key={post._id} 
              post={post} 
              onDelete={(id) => setPosts(posts.filter(p => p._id !== id))}
            />
          ))
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-bold">Edit Profile</h2>
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 flex flex-col gap-6">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative group cursor-pointer w-24 h-24">
                  <img
                    src={avatarPreview}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover border-2 border-blue-500 group-hover:opacity-75 transition"
                  />
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-xs opacity-0 group-hover:opacity-100 rounded-full transition cursor-pointer">
                    Change
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Click to upload a new photo</span>
              </div>

              {/* Full Name Input */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Full Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value);
                    if (errors.displayName) setErrors(prev => ({ ...prev, displayName: "" }));
                  }}
                  className={`w-full p-3 rounded-lg border bg-transparent outline-none focus:ring-2 focus:ring-blue-500 transition ${
                    errors.displayName ? "border-red-500 focus:ring-red-500" : "border-gray-200 dark:border-gray-800"
                  }`}
                  required
                />
                {errors.displayName && <p className="text-red-500 text-xs mt-1">{errors.displayName}</p>}
              </div>

              {/* Bio Input */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows="3"
                  className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 rounded-full border border-gray-300 dark:border-gray-700 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-blue-500 text-white font-semibold hover:bg-blue-600 transition shadow-md"
                  disabled={loading}
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