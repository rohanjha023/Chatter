import { Link } from "react-router-dom";
import { FaHome, FaHashtag, FaBell, FaBookmark, FaUser } from "react-icons/fa";

function Sidebar() {
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

          <span className="bg-red-500 text-xs px-2 py-1 rounded-full">4</span>
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

      <button className="mt-10 w-full bg-blue-500 hover:bg-blue-600 rounded-full py-3 font-semibold">
        Post
      </button>
    </div>
  );
}

export default Sidebar;
