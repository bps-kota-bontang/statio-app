import type { Table } from "@/type/table";
import TablePivot from "@/component/ui/TablePivot";
import { buildPivotFromFacts } from "@/utils/table";
import { useMemo } from "react";

const TableReviewer = ({
  table,
  years,
}: {
  table: Table;
  years?: number[];
}) => {
  const pivot = useMemo(
    () => buildPivotFromFacts(table, years),
    [table, years]
  );

  return (
    <div className="space-y-4 relative">
      <TablePivot pivot={pivot} />
    </div>
  );
};

export default TableReviewer;
