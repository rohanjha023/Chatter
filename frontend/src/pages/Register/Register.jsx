import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

function Register() {
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Strict Validations
    if (displayName.trim().length < 2) {
      return toast.error("Full Name must be at least 2 characters long");
    }
    if (!/^[a-zA-Z\s]+$/.test(displayName)) {
      return toast.error("Full Name can only contain letters and spaces");
    }
    if (username.length < 3) {
      return toast.error("Username must be at least 3 characters long");
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return toast.error("Username can only contain letters, numbers, and underscores");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return toast.error("Please enter a valid email address");
    }
    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters long");
    }

    try {
      await register(username, email, password, displayName);
      toast.success("Registration successful!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black text-black dark:text-white">
      <div className="w-[400px] bg-gray-100 dark:bg-gray-900 p-8 rounded-xl shadow-lg">
        <h1 className="text-4xl font-bold text-center text-blue-500 mb-8">
          Register
        </h1>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-200 dark:bg-gray-800 outline-none mb-4 focus:ring-2 focus:ring-blue-500"
            required
          />

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-200 dark:bg-gray-800 outline-none mb-4 focus:ring-2 focus:ring-blue-500"
            required
          />

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
            Register
          </button>
        </form>

        <p className="text-center mt-5 text-gray-600 dark:text-gray-400">
          Already have an account?
          <Link to="/login" className="text-blue-500 ml-2 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;