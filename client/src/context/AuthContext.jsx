// src/context/AuthContext.jsx
// Central place for "who is logged in" + the dark/light theme toggle.
// Any component can do: const { user, login, logout, toggleTheme } = useAuth();
import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import { connectSocket, disconnectSocket } from "../services/socket";

const AuthContext = createContext(null);

// Adds/removes the "dark" class on <html> — index.css uses that class to
// swap the --color-* CSS variables (see index.css comments).
const applyTheme = (theme) => {
  document.documentElement.classList.toggle("dark", theme === "dark");
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  // On first load: apply saved theme immediately (avoids a light-mode flash),
  // and if we have a token, re-fetch the fresh profile from the server.
  useEffect(() => {
    const savedTheme = user?.themePreference || localStorage.getItem("theme") || "dark";
    applyTheme(savedTheme);

    const token = localStorage.getItem("token");
    if (token) {
      connectSocket(token);
      api
        .get("/auth/me")
        .then((res) => {
          setUser(res.data);
          localStorage.setItem("user", JSON.stringify(res.data));
          applyTheme(res.data.themePreference || savedTheme);
        })
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);
    applyTheme(data.themePreference || "dark");
    connectSocket(data.token);
    return data;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    disconnectSocket();
    setUser(null);
  };

  const toggleTheme = async () => {
    const next = document.documentElement.classList.contains("dark") ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem("theme", next);
    if (user) {
      const updated = { ...user, themePreference: next };
      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));
      // Persist to the backend too, but don't block the UI toggle on it.
      api.put("/users/profile", { themePreference: next }).catch(() => {});
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, toggleTheme }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
