import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";

function SuggestedUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { followUser, token } = useAuth();

  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      if (!token) return;
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const { data } = await axios.get("/api/users", config);
        setUsers(data);
      } catch (error) {
        console.error("Error fetching suggested users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestedUsers();
  }, [token]);

  const handleFollow = async (userId, name) => {
    try {
      await toast.promise(followUser(userId), {
        loading: `Following ${name}...`,
        success: `Now following ${name}!`,
        error: "Failed to follow user",
      });
      // Remove followed user from suggestions
      setUsers((prevUsers) => prevUsers.filter((u) => u._id !== userId));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-100 dark:bg-gray-900 rounded-xl p-5 mt-6 animate-pulse">
        <h2 className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-5"></h2>
        <div className="space-y-4">
          <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return null; // Don't show sidebar widget if there are no suggestions
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 rounded-xl p-5 mt-6 transition-colors duration-300">
      <h2 className="text-xl font-bold mb-5">Who to Follow</h2>

      {users.map((user) => (
        <div
          key={user._id}
          className="flex items-center justify-between mb-4 last:mb-0"
        >
          <div className="flex items-center gap-3">
            <img
              src={user.avatarUrl || `https://i.pravatar.cc/150?u=${user.username}`}
              alt={`${user.displayName}'s avatar`}
              className="w-12 h-12 rounded-full object-cover"
            />

            <div>
              <h3 className="font-semibold text-sm leading-tight">{user.displayName}</h3>
              <p className="text-gray-500 text-xs">@{user.username}</p>
            </div>
          </div>

          <button
            onClick={() => handleFollow(user._id, user.displayName)}
            className="bg-black dark:bg-white text-white dark:text-black font-semibold text-xs px-4 py-1.5 rounded-full hover:opacity-80 transition shadow-sm"
          >
            Follow
          </button>
        </div>
      ))}
    </div>
  );
}

export default SuggestedUsers;