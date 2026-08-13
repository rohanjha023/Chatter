// src/pages/Notifications.jsx
import { useEffect, useState } from "react";
import { FaHeart, FaComment, FaRetweet, FaUserPlus } from "react-icons/fa";
import { Sidebar } from "../components/Sidebar/Sidebar";
import api from "../services/api";
import { getSocket } from "../services/socket";

const ICONS = {
  like: <FaHeart className="text-red-500" />,
  reply: <FaComment className="text-blue-400" />,
  repost: <FaRetweet className="text-green-500" />,
  follow: <FaUserPlus className="text-purple-400" />,
};

const LABELS = {
  like: "liked your post",
  reply: "replied to your post",
  repost: "reposted your post",
  follow: "started following you",
};

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/notifications")
      .then((res) => setNotifications(res.data))
      .finally(() => setLoading(false));

    api.put("/notifications/read-all").catch(() => {});

    // Live-append any notification that arrives while this page is open.
    const socket = getSocket();
    if (!socket) return;
    const handleNew = (notification) => setNotifications((prev) => [notification, ...prev]);
    socket.on("notification:new", handleNew);
    return () => socket.off("notification:new", handleNew);
  }, []);

  return (
    <div className="min-h-screen bg-app text-app flex justify-center">
      <Sidebar />
      <main className="w-full max-w-2xl border-x border-app">
        <h1 className="text-xl font-bold p-4 border-b border-app">Notifications</h1>

        {loading && <div className="text-center text-gray-500 py-10">Loading...</div>}
        {!loading && notifications.length === 0 && (
          <div className="text-center text-gray-500 py-10">No notifications yet.</div>
        )}

        {notifications.map((n) => (
          <div key={n._id} className="flex items-center gap-3 p-4 border-b border-app">
            <span className="text-xl">{ICONS[n.type]}</span>
            <img
              src={n.sender?.avatarUrl || `https://i.pravatar.cc/150?u=${n.sender?.username}`}
              alt={n.sender?.displayName}
              className="w-10 h-10 rounded-full object-cover"
            />
            <p>
              <span className="font-semibold">{n.sender?.displayName}</span>{" "}
              <span className="text-gray-400">{LABELS[n.type]}</span>
            </p>
          </div>
        ))}
      </main>
    </div>
  );
}

export default Notifications;
