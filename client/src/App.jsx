// src/App.jsx
// This file was missing from the uploaded project — it's what index.html /
// main.jsx actually render. Defines every page route in the app.
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Notifications from "./pages/Notifications";
import Bookmarks from "./pages/Bookmarks";
import Profile from "./pages/Profile";
import Landing from "./pages/Landing/Landing";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-app text-app flex items-center justify-center">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />

      {/* Everything below requires a logged-in user. */}
      <Route
        path="/"
        element={
          user ? (
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          ) : (
            <Landing />
          )
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookmarks"
        element={
          <ProtectedRoute>
            <Bookmarks />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:username"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
