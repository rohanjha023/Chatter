function SuggestedUsers() {
  const users = [
    {
      id: 1,
      name: "Aman",
      username: "@aman",
      image: "https://i.pravatar.cc/150?img=12",
    },
    {
      id: 2,
      name: "Priya",
      username: "@priya",
      image: "https://i.pravatar.cc/150?img=14",
    },
    {
      id: 3,
      name: "Rahul",
      username: "@rahul",
      image: "https://i.pravatar.cc/150?img=18",
    },
  ];

  return (
    <div className="bg-gray-900 rounded-xl p-5 mt-6">
      <h2 className="text-xl font-bold mb-5">Who to Follow</h2>

      {users.map((user) => (
        <div
          key={user.id}
          className="flex items-center justify-between mb-4"
        >
          <div className="flex items-center gap-3">
            <img
              src={user.image}
              className="w-12 h-12 rounded-full"
            />

            <div>
              <h3>{user.name}</h3>
              <p className="text-gray-400">{user.username}</p>
            </div>
          </div>

          <button className="bg-white text-black px-4 py-1 rounded-full">
            Follow
          </button>
        </div>
      ))}
    </div>
  );
}

export default SuggestedUsers;