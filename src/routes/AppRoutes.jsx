import { Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Profile from "../pages/Profile/Profile";
import Explore from "../pages/Explore/Explore";
import Notifications from "../pages/Notifications/Notifications";
import Bookmarks from "../pages/Bookmarks/Bookmarks";
import NotFound from "../pages/NotFound/NotFound";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="profile" element={<Profile />} />
        <Route path="explore" element={<Explore />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="bookmarks" element={<Bookmarks />} />
      </Route>

      <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />  
    </Routes>
  );
}

export default AppRoutes;