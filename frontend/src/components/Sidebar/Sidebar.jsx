import { Link } from "react-router-dom";
import { FaHome, FaHashtag, FaBell, FaBookmark, FaUser, FaSun, FaMoon, FaSignOutAlt } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

function Sidebar() {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();

  return (
    <div className="h-screen sticky top-0 p-6">
      <h1 className="text-3xl font-bold text-blue-500 mb-10">SocialFeed</h1>

      <nav className="flex flex-col gap-6 text-xl">
        <Link
          to="/"
          className="flex items-center gap-4 hover:text-blue-400 transition"
        >
          <FaHome />
          Home
        </Link>

        <Link
          to="/explore"
          className="flex items-center gap-4 hover:text-blue-400 transition"
        >
          <FaHashtag />
          Explore
        </Link>

        <Link
          to="/notifications"
          className="flex items-center justify-between hover:text-blue-400 transition"
        >
          <div className="flex items-center gap-4">
            <FaBell />
            Notifications
          </div>

          <span className="bg-red-500 text-xs px-2 py-1 rounded-full text-black dark:text-white">4</span>
        </Link>

        <Link
          to="/bookmarks"
          className="flex items-center gap-4 hover:text-blue-400 transition"
        >
          <FaBookmark />
          Bookmarks
        </Link>

        <Link
          to="/profile"
          className="flex items-center gap-4 hover:text-blue-400 transition"
        >
          <FaUser />
          Profile
        </Link>
      </nav>

      <button className="mt-10 w-full bg-blue-500 hover:bg-blue-600 rounded-full py-3 font-semibold text-white">
        Post
      </button>

      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center gap-3 w-full py-3 rounded-full border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          {theme === "dark" ? (
            <>
              <FaSun className="text-yellow-500" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <FaMoon className="text-blue-500" />
              <span>Dark Mode</span>
            </>
          )}
        </button>
        
        <button
          onClick={logout}
          className="mt-4 flex items-center justify-center gap-3 w-full py-3 rounded-full border border-gray-200 dark:border-gray-800 hover:bg-red-50 hover:text-red-500 hover:border-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-500 dark:hover:border-red-500 transition text-gray-500 dark:text-gray-400"
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
