function Header() {
  return (
    <div className="sticky top-0 bg-white dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-50">
      <div className="flex justify-between items-center p-4">
        <h1 className="text-2xl font-bold">🏠 Home</h1>

        <button className="bg-blue-500 hover:bg-blue-600 px-5 py-2 rounded-full">
          Upgrade
        </button>
      </div>
    </div>
  );
}

export default Header;