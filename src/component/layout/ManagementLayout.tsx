import { useAuth } from "@/context/auth/useAuth";
import { Outlet } from "react-router";
import AccessDenied from "@/component/ui/AccessDenied";

const ManagementLayout = () => {
  const { user } = useAuth();

  if (!user?.roles?.includes("admin")) {
    return (
      <AccessDenied message="Only administrators can access the management section." />
    );
  }

  return <Outlet />;
};

export default ManagementLayout;
