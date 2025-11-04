import Sidebar from "@/component/layout/statio/Sidebar";
import { Outlet } from "react-router";

const StatioLayout = () => {
  return (
    <div className="flex h-screen w-screen bg-primary">
      {/* Sidebar */}
      <Sidebar />

      {/* Main scroll area */}
      <main className="flex-1 overflow-auto p-6">
        {/* Konten putih (tidak scroll) */}
        <div className="bg-white p-4 rounded-lg shadow-md min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default StatioLayout;
