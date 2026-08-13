// src/pages/Home.jsx
import { Sidebar, RightPanel } from "../components/Sidebar/Sidebar";
import Feed from "../components/Feed/Feed";

function Home() {
  return (
    <div className="min-h-screen bg-app text-app flex justify-center">
      <Sidebar />
      <main className="w-full max-w-2xl border-x border-app">
        <Feed />
      </main>
      <RightPanel />
    </div>
  );
}

export default Home;
