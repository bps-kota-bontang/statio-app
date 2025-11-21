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

  const setBreadcrumbs = useCallback((items: BreadcrumbItem[]) => {
    setBreadcrumbsState(items);
  }, []);

  return (
    <div className="flex h-screen w-screen bg-primary">
      <Sidebar />

      <main className="flex-1 overflow-auto p-6">
        <div className="bg-white p-4 rounded-lg shadow-md min-h-full">
          <Breadcrumb items={breadcrumbs} />
          <Outlet context={{ breadcrumbs, setBreadcrumbs }} />
        </div>
      </main>
    </div>
  );
};

export default StatioLayout;
