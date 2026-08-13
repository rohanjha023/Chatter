// src/components/Sidebar/Sidebar.jsx
// Left navigation column: logo, nav links, dark/light toggle, logout,
// plus the "Trending" and "Who to follow" widgets on the right column
// (kept in this same file for simplicity — rendered separately in Home.jsx).
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHome, FaBell, FaBookmark, FaSignOutAlt, FaMoon, FaSun, FaUser } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

export function Sidebar() {
  const { user, logout, toggleTheme } = useAuth();
  const navigate = useNavigate();
  const isDark = document.documentElement.classList.contains("dark");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="hidden md:flex flex-col justify-between h-screen sticky top-0 py-4 px-3 w-64 border-r border-app">
      <div>
        <h1 className="text-xl font-extrabold px-3 mb-6">SocialFeed</h1>

        <nav className="space-y-1">
          <Link to="/" className="flex items-center gap-4 px-3 py-3 rounded-full hover:bg-gray-800/40 text-lg">
            <FaHome /> Home
          </Link>
          <Link to="/notifications" className="flex items-center gap-4 px-3 py-3 rounded-full hover:bg-gray-800/40 text-lg">
            <FaBell /> Notifications
          </Link>
          <Link to="/bookmarks" className="flex items-center gap-4 px-3 py-3 rounded-full hover:bg-gray-800/40 text-lg">
            <FaBookmark /> Bookmarks
          </Link>
          {user && (
            <Link
              to={`/profile/${user.username}`}
              className="flex items-center gap-4 px-3 py-3 rounded-full hover:bg-gray-800/40 text-lg"
            >
              <FaUser /> Profile
            </Link>
          )}
        </nav>
      </div>

      <div className="space-y-2">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-3 rounded-full hover:bg-gray-800/40 w-full text-left"
        >
          {isDark ? <FaSun /> : <FaMoon />} {isDark ? "Light mode" : "Dark mode"}
        </button>

        {user && (
          <div className="flex items-center gap-3 px-3 py-2">
            <img
              src={user.avatarUrl || `https://i.pravatar.cc/150?u=${user.username}`}
              alt={user.displayName}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{user.displayName}</p>
              <p className="text-gray-400 text-sm truncate">@{user.username}</p>
            </div>
            <button onClick={handleLogout} title="Log out" className="text-gray-400 hover:text-red-500">
              <FaSignOutAlt />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Right-hand widgets: trending hashtags (Redis or MongoDB, from the backend)
// and suggested users to follow.
export function RightPanel() {
  const [trending, setTrending] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const { user, setUser } = useAuth();

  useEffect(() => {
    api.get("/posts/trending/hashtags").then((res) => setTrending(res.data)).catch(() => {});
    api.get("/users").then((res) => setSuggested(res.data)).catch(() => {});
  }, []);

  const handleFollow = async (id) => {
    try {
      await api.put(`/users/follow/${id}`);
      setSuggested((prev) => prev.filter((u) => u._id !== id));
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="hidden lg:block w-80 py-4 px-4 space-y-4">
      <div className="bg-app-soft border border-app rounded-2xl p-4">
        <h2 className="font-bold text-lg mb-3">Trending hashtags</h2>
        {trending.length === 0 && <p className="text-gray-500 text-sm">No trending hashtags yet.</p>}
        {trending.map((t) => (
          <div key={t.tag} className="py-2 border-b border-app last:border-0">
            <p className="font-semibold">#{t.tag}</p>
            <p className="text-gray-500 text-sm">{t.count} posts</p>
          </div>
        ))}
      </div>

      <div className="bg-app-soft border border-app rounded-2xl p-4">
        <h2 className="font-bold text-lg mb-3">Who to follow</h2>
        {suggested.length === 0 && <p className="text-gray-500 text-sm">No suggestions right now.</p>}
        {suggested.map((u) => (
          <div key={u._id} className="flex items-center gap-3 py-2">
            <img src={u.avatarUrl || `https://i.pravatar.cc/150?u=${u.username}`} alt={u.displayName} className="w-10 h-10 rounded-full object-cover" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{u.displayName}</p>
              <p className="text-gray-500 text-sm truncate">@{u.username}</p>
            </div>
            <button
              onClick={() => handleFollow(u._id)}
              className="bg-white text-black text-sm font-semibold px-3 py-1.5 rounded-full hover:bg-gray-200"
            >
              Follow
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
