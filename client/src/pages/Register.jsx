import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", displayName: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateField = (name, value) => {
    let errorMsg = "";
    if (name === "displayName") {
      if (value.trim().length > 0 && value.trim().length < 2) {
        errorMsg = "At least 2 characters required";
      } else if (value && !/^[a-zA-Z\s]+$/.test(value)) {
        errorMsg = "Only letters and spaces allowed";
      }
    }
    if (name === "username") {
      if (value.length > 0 && value.length < 3) {
        errorMsg = "At least 3 characters required";
      } else if (value && !/^[a-zA-Z0-9_]+$/.test(value)) {
        errorMsg = "Only letters, numbers, and underscores allowed";
      }
    }
    if (name === "email") {
      if (value && !/^(?=[^@]*[a-zA-Z])[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
        errorMsg = "Email must contain letters before @";
      }
    }
    if (name === "password") {
      if (value.length > 0 && value.length < 6) {
        errorMsg = "At least 6 characters required";
      }
    }
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
    return errorMsg;
  };

  const handleChange = (field) => (e) => {
    const val = e.target.value;
    setForm({ ...form, [field]: val });
    validateField(field, val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Strict validations check before submit
    const nameErr = validateField("displayName", form.displayName);
    const userErr = validateField("username", form.username);
    const emailErr = validateField("email", form.email);
    const passErr = validateField("password", form.password);

    if (nameErr || userErr || emailErr || passErr) {
      toast.error("Please resolve the errors first");
      return;
    }

    setLoading(true);
    try {
      await register(form);
      toast.success("Registration successful! Please log in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-app text-app flex items-center justify-center px-4 py-10">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-app-soft border border-app rounded-2xl p-8 flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-center">Create your account</h1>

        <div>
          <label className="block text-sm mb-1 text-gray-400">Full name</label>
          <input
            required
            value={form.displayName}
            onChange={handleChange("displayName")}
            className={`w-full p-3 rounded-lg bg-gray-900 border outline-none focus:border-blue-500 ${errors.displayName ? 'border-red-500' : 'border-gray-700'}`}
          />
          {errors.displayName && <p className="text-red-500 text-xs mt-1 pl-1">{errors.displayName}</p>}
        </div>

        <div>
          <label className="block text-sm mb-1 text-gray-400">Username</label>
          <input
            required
            value={form.username}
            onChange={handleChange("username")}
            className={`w-full p-3 rounded-lg bg-gray-900 border outline-none focus:border-blue-500 ${errors.username ? 'border-red-500' : 'border-gray-700'}`}
          />
          {errors.username && <p className="text-red-500 text-xs mt-1 pl-1">{errors.username}</p>}
        </div>

        <div>
          <label className="block text-sm mb-1 text-gray-400">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={handleChange("email")}
            className={`w-full p-3 rounded-lg bg-gray-900 border outline-none focus:border-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-700'}`}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1 pl-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm mb-1 text-gray-400">Password</label>
          <input
            type="password"
            required
            value={form.password}
            onChange={handleChange("password")}
            className={`w-full p-3 rounded-lg bg-gray-900 border outline-none focus:border-blue-500 ${errors.password ? 'border-red-500' : 'border-gray-700'}`}
          />
          {errors.password && <p className="text-red-500 text-xs mt-1 pl-1">{errors.password}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 py-3 rounded-full font-semibold mt-2"
        >
          {loading ? "Creating account..." : "Sign up"}
        </button>

        <p className="text-center text-sm text-gray-400 mt-3">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
