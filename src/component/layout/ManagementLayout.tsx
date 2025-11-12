import { useAuth } from "@/context/auth/useAuth";
import { Outlet } from "react-router";
import Error from "@/component/ui/Error";

const ManagementLayout = () => {
  const { user } = useAuth();

  if (!user?.roles?.includes("admin")) {
    return (
      <Error message="Only administrators can access the management section." />
    );
  }

  return <Outlet />;
};

export default ManagementLayout;
