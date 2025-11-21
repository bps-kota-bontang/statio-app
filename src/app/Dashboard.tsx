import type { StatioContextType } from "@/component/layout/StatioLayout";
import { useEffect } from "react";
import { Outlet, useOutletContext } from "react-router";

const Dashboard = () => {
  const { setBreadcrumbs } = useOutletContext<StatioContextType>();

  useEffect(() => {
    setBreadcrumbs([{ label: "Dashboard" }]);
  }, [setBreadcrumbs]);

  return (
    <div>
      <Outlet />
    </div>
  );
};

export default Dashboard;
