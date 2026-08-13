// src/components/ProtectedRoute/ProtectedRoute.jsx
// Wraps any page that requires login. Redirects to /login if there's no
// user, and shows nothing while we're still checking the saved token.
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-app text-app flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
