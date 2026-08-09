import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black text-black dark:text-white">
      <div className="w-[400px] bg-gray-100 dark:bg-gray-900 p-8 rounded-xl shadow-lg">
        <h1 className="text-4xl font-bold text-center text-blue-500 mb-8">
          Login
        </h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-200 dark:bg-gray-800 outline-none mb-4 focus:ring-2 focus:ring-blue-500"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-200 dark:bg-gray-800 outline-none mb-6 focus:ring-2 focus:ring-blue-500"
            required
          />

          <button 
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 p-3 rounded-lg font-bold transition"
          >
            Login
          </button>
        </form>

        <p className="text-center mt-5 text-gray-600 dark:text-gray-400">
          Don't have an account?
          <Link to="/register" className="text-blue-500 ml-2 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;