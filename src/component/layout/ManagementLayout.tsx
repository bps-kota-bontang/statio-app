import { useAuth } from "@/context/auth/useAuth";
import { Outlet, useOutletContext } from "react-router";
import Error from "@/component/ui/Error";
import type { StatioContextType } from "@/component/layout/StatioLayout";

const ManagementLayout = () => {
  const { setBreadcrumbs } = useOutletContext<StatioContextType>();
  const { user } = useAuth();

  if (!user?.roles?.includes("admin")) {
    return (
      <Error message="Only administrators can access the management section." />
    );
  }

  return <Outlet context={{ setBreadcrumbs }} />;
};

export default ManagementLayout;
