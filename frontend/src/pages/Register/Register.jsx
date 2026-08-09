import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

function Register() {
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateField = (name, value) => {
    let errorMsg = "";
    if (name === "displayName") {
      if (value.trim().length > 0 && value.trim().length < 2) errorMsg = "At least 2 characters required";
      else if (value && !/^[a-zA-Z\s]+$/.test(value)) errorMsg = "Only letters and spaces allowed";
    }
    if (name === "username") {
      if (value.length > 0 && value.length < 3) errorMsg = "At least 3 characters required";
      else if (value && !/^[a-zA-Z0-9_]+$/.test(value)) errorMsg = "Only letters, numbers, and underscores allowed";
    }
    if (name === "email") {
      if (value && !/^(?=[^@]*[a-zA-Z])[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) errorMsg = "Email must contain letters before @";
    }
    if (name === "password") {
      if (value.length > 0 && value.length < 6) errorMsg = "At least 6 characters required";
    }
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
    return errorMsg;
  };

  const handleChange = (setter, name) => (e) => {
    const val = e.target.value;
    setter(val);
    validateField(name, val);
  };

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
    if (!/^(?=[^@]*[a-zA-Z])[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      return toast.error("Email must contain letters before @");
    }
    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters long");
    }

    try {
      await register(username, email, password, displayName);
      toast.success("Registration successful! Please login.");
      navigate("/login");
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <input
              type="text"
              placeholder="Full Name"
              value={displayName}
              onChange={handleChange(setDisplayName, "displayName")}
              className={`w-full p-3 rounded-lg bg-gray-200 dark:bg-gray-800 outline-none focus:ring-2 ${errors.displayName ? 'border-2 border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}`}
              required
            />
            {errors.displayName && <p className="text-red-500 text-xs mt-1 pl-1">{errors.displayName}</p>}
          </div>

          <div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={handleChange(setUsername, "username")}
              className={`w-full p-3 rounded-lg bg-gray-200 dark:bg-gray-800 outline-none focus:ring-2 ${errors.username ? 'border-2 border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}`}
              required
            />
            {errors.username && <p className="text-red-500 text-xs mt-1 pl-1">{errors.username}</p>}
          </div>

          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={handleChange(setEmail, "email")}
              className={`w-full p-3 rounded-lg bg-gray-200 dark:bg-gray-800 outline-none focus:ring-2 ${errors.email ? 'border-2 border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}`}
              required
            />
            {errors.email && <p className="text-red-500 text-xs mt-1 pl-1">{errors.email}</p>}
          </div>

          <div className="mb-2">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={handleChange(setPassword, "password")}
              className={`w-full p-3 rounded-lg bg-gray-200 dark:bg-gray-800 outline-none focus:ring-2 ${errors.password ? 'border-2 border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}`}
              required
            />
            {errors.password && <p className="text-red-500 text-xs mt-1 pl-1">{errors.password}</p>}
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 p-3 rounded-lg font-bold transition mt-2"
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