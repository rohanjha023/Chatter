function Profile() {
  return (
    <div className="text-white">

      <div className="h-52 bg-gradient-to-r from-blue-600 to-purple-600"></div>

      <div className="p-6">

        <img
          src="https://i.pravatar.cc/150?img=10"
          className="w-36 h-36 rounded-full border-4 border-black -mt-20"
        />

        <h1 className="text-3xl font-bold mt-4">
          Rohan Kumar
        </h1>

        <p className="text-gray-400">
          @rohan
        </p>

        <p className="mt-4">
          MERN Stack Developer | React | Node | MongoDB 🚀
        </p>

        <button className="mt-6 border px-5 py-2 rounded-full hover:bg-white hover:text-black transition">
          Edit Profile
        </button>

        <div className="flex gap-12 mt-8">

          <div>
            <h2 className="text-2xl font-bold">35</h2>
            <p className="text-gray-400">Posts</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold">980</h2>
            <p className="text-gray-400">Followers</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold">250</h2>
            <p className="text-gray-400">Following</p>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Profile;