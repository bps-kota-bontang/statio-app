import Sidebar from "@/component/sidebar/Sidebar";
import Breadcrumb from "@/component/ui/Breadcrumb";
import type { BreadcrumbItem } from "@/type/breadcrumb";
import { Outlet } from "react-router";
import { useCallback, useState } from "react";

export type StatioContextType = {
  breadcrumbs: BreadcrumbItem[];
  setBreadcrumbs(items: BreadcrumbItem[]): void;
};

const StatioLayout = () => {
  const [breadcrumbs, setBreadcrumbsState] = useState<BreadcrumbItem[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false); // untuk mobile (open/close)
  const [collapsed, setCollapsed] = useState(false); // untuk desktop (minimize/expand)

  const setBreadcrumbs = useCallback((items: BreadcrumbItem[]) => {
    setBreadcrumbsState(items);
  }, []);

  const handleToggleSidebar = () => {
    setCollapsed(false);
    setSidebarOpen(!sidebarOpen);
  };

  const handleToggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen w-screen bg-primary">
      {/* Backdrop untuk mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={handleCloseSidebar}
        />
      )}

      {/* Sidebar - overlay di mobile, fixed di desktop */}
      <div
        className={`fixed md:relative h-full z-50 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <Sidebar
          collapsed={collapsed}
          onToggleCollapsed={handleToggleCollapsed}
        />
      </div>

      <main className="flex-1 overflow-auto p-6 w-full">
        {/* Button untuk toggle sidebar di mobile */}
        <button
          onClick={handleToggleSidebar}
          className="md:hidden mb-4 p-2 bg-white rounded-lg shadow-md hover:bg-gray-100 transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <Breadcrumb items={breadcrumbs} />
          <Outlet context={{ breadcrumbs, setBreadcrumbs }} />
        </div>
      </main>
    </div>
  );
};

export default StatioLayout;
