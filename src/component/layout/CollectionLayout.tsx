import { useAuth } from "@/hooks/useAuth";
import { Outlet, useOutletContext } from "react-router";
import Error from "@/component/ui/Error";
import type { StatioContextType } from "@/component/layout/StatioLayout";

const CollectionLayout = () => {
  const { setBreadcrumbs } = useOutletContext<StatioContextType>();
  const { user } = useAuth();

  if (!user?.roles?.includes("admin")) {
    return (
      <Error message="Only administrators can access the collection section." />
    );
  }

  return <Outlet context={{ setBreadcrumbs }} />;
};

export default CollectionLayout;
