function Notifications() {
  const notifications = [
    {
      id: 1,
      user: "Aman",
      message: "liked your post ❤️",
    },
    {
      id: 2,
      user: "Priya",
      message: "started following you 👤",
    },
    {
      id: 3,
      user: "Rahul",
      message: "commented on your post 💬",
    },
    {
      id: 4,
      user: "Neha",
      message: "reposted your post 🔁",
    },
  ];

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">
        Notifications
      </h1>

      {notifications.map((item) => (
        <div
          key={item.id}
          className="bg-gray-900 rounded-xl p-5 mb-4"
        >
          <h2 className="font-bold">{item.user}</h2>

          <p className="text-gray-400 mt-2">
            {item.message}
          </p>
        </div>
      ))}
    </div>
  );
}

export default Notifications;