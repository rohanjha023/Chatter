function Bookmarks() {
  return (
    <div className="p-6 text-black dark:text-white">

      <h1 className="text-3xl font-bold mb-6">
        Bookmarks
      </h1>

      <div className="bg-gray-100 dark:bg-gray-900 rounded-xl p-5">

        <h2 className="font-bold">
          Learning React 🚀
        </h2>

        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Saved 2 hours ago
        </p>

      </div>

      <div className="bg-gray-100 dark:bg-gray-900 rounded-xl p-5 mt-4">

        <h2 className="font-bold">
          MERN Stack Tips
        </h2>

        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Saved Yesterday
        </p>

      </div>

    </div>
  );
}

export default Bookmarks;