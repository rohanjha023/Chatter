import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="h-screen flex flex-col justify-center items-center text-white bg-black">
      <h1 className="text-7xl font-bold">404</h1>

      <p className="text-gray-400 mt-3">
        Page Not Found
      </p>

      <Link
        to="/"
        className="mt-6 bg-blue-500 px-6 py-3 rounded-full"
      >
        Go Home
      </Link>
    </div>
  );
}

export default NotFound;