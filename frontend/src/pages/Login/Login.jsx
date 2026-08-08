import { Link } from "react-router-dom";

function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black text-black dark:text-white">
      <div className="w-[400px] bg-gray-100 dark:bg-gray-900 p-8 rounded-xl shadow-lg">

        <h1 className="text-4xl font-bold text-center text-blue-500 mb-8">
          Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 rounded-lg bg-gray-800 outline-none mb-4"
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 rounded-lg bg-gray-800 outline-none mb-6"
        />

        <button className="w-full bg-blue-500 hover:bg-blue-600 p-3 rounded-lg font-bold">
          Login
        </button>

        <p className="text-center mt-5 text-gray-600 dark:text-gray-400">
          Don't have an account?
          <Link
            to="/register"
            className="text-blue-500 ml-2"
          >
            Register
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Login;