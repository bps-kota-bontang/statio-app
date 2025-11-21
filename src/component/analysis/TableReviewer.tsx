import type { Table } from "@/type/table";
import TablePivot from "@/component/ui/TablePivot";
import { buildPivotFromFacts } from "@/utils/table";

const TableReviewer = ({
  table,
  years,
}: {
  table: Table;
  years?: number[];
}) => {
  const pivot = buildPivotFromFacts(table, years);

  return (
    <div className="space-y-4 relative">
      <TablePivot pivot={pivot} />
    </div>
  );
};

export default TableReviewer;
