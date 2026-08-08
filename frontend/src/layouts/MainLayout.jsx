import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import RightSidebar from "../components/RightSidebar/RightSidebar";

function MainLayout() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <div className="grid grid-cols-12 max-w-7xl mx-auto">

        <div className="col-span-3 border-r border-gray-200 dark:border-gray-800">
          <Sidebar />
        </div>

        <div className="col-span-6 border-r border-gray-200 dark:border-gray-800">
          <Outlet />
        </div>

        <div className="col-span-3">
          <RightSidebar />
        </div>

      </div>

      <button className="fixed bottom-6 right-6 bg-blue-500 w-16 h-16 rounded-full text-3xl md:hidden shadow-lg">
        +
      </button>
    </div>
  );
}

export default MainLayout;