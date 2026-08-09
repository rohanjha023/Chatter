import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import MainLayout from "../layouts/MainLayout";

import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Profile from "../pages/Profile/Profile";
import Explore from "../pages/Explore/Explore";
import Notifications from "../pages/Notifications/Notifications";
import Bookmarks from "../pages/Bookmarks/Bookmarks";
import NotFound from "../pages/NotFound/NotFound";
import Landing from "../pages/Landing/Landing";

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route 
        path="/" 
        element={user ? <MainLayout /> : <Landing />}
      >
        {user && <Route index element={<Home />} />}
        <Route path="profile" element={<Profile />} />
        <Route path="explore" element={<Explore />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="bookmarks" element={<Bookmarks />} />
      </Route>

      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
      <Route path="*" element={<NotFound />} />  
    </Routes>
  );
}

export default AppRoutes;