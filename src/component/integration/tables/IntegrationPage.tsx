"use client";

import Button from "@/component/ui/Button";
import DataTable, { type Column } from "@/component/ui/DataTable";
import { useDataTable } from "@/hooks/useDataTable";
import type { TableList } from "@/type/table";
import { useMemo, useEffect } from "react";
import { Link, useOutletContext } from "react-router";
import { useTableApi } from "@/service/table";

import type { StatioContextType } from "@/component/layout/StatioLayout";

const IntegrationPage = () => {
  const { setBreadcrumbs } = useOutletContext<StatioContextType>();

  useEffect(() => {
    document.title = "Integration Tables | Statio";
    setBreadcrumbs([
      { label: "Dashboard", href: "/" },
      { label: "Integration", highlight: false },
      { label: "Tables" },
    ]);
  }, [setBreadcrumbs]);

  const table = useDataTable<TableList>();

  const { useTables } = useTableApi();

  const { data, isLoading } = useTables(table);

  const columns = useMemo<Column<TableList>[]>(
    () => [
      {
        key: "no",
        label: "No",
        sortable: true,
        render: (_, no) => no,
      },
      {
        key: "name",
        label: "Name",
        sortable: true,
      },
      {
        key: "actions",
        label: "Actions",
        sortable: false,
        render: (row) => (
          <div className="flex gap-2">
            <Link to={`/tables/${row.id}`} target="_blank">
              <Button size="sm">View</Button>
            </Link>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Tables</h1>
      <DataTable
        data={data?.data ?? []}
        meta={data?.meta}
        columns={columns}
        isLoading={isLoading}
        {...table}
      />
    </div>
  );
};

export default IntegrationPage;
