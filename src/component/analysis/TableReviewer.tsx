import { useMemo, useState } from "react";
import Modal from "@/component/ui/Modal";
import { buildPivotFromFacts, SINGLE_VALUE_COL_ID } from "@/utils/table";
import TablePivot from "@/component/ui/TablePivot";
import type { Fact } from "@/type/fact";
import { useTableApi } from "@/service/table";
import type { Table } from "@/type/table";
import FactChart from "@/component/analysis/FactChart";
import type { PivotColumn, PivotRow } from "@/type/pivot";

const TableReviewer = ({
  table,
  years,
}: {
  table: Table;
  years?: number[];
}) => {
  const { getTableFacts } = useTableApi();

  const [isOpen, setIsOpen] = useState(false);
  const [facts, setFacts] = useState<Fact[] | null>(null);
  const [row, setRow] = useState<PivotRow | null>(null);
  const [column, setColumn] = useState<PivotColumn | null>(null);

  const pivot = useMemo(
    () => buildPivotFromFacts(table, years),
    [table, years]
  );

  const isYear = (id: string) => years?.includes(Number(id));

  const handleCellClick = async (row: PivotRow, col: PivotColumn) => {
    const dimension_value_ids: string[] = [];
    if (row.id !== SINGLE_VALUE_COL_ID && !isYear(row.id)) {
      dimension_value_ids.push(row.id);
      setRow(row);
    }
    if (col.id !== SINGLE_VALUE_COL_ID && !isYear(col.id)) {
      dimension_value_ids.push(col.id);
      setColumn(col);
    }

    const resp = await getTableFacts(table.id, dimension_value_ids);
    setFacts(resp.data || []);
    setIsOpen(true); // buka modal
  };

  return (
    <div className="space-y-4 relative">
      <TablePivot pivot={pivot} onClickCell={handleCellClick} />
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        {facts && (
          <FactChart
            facts={facts}
            rowName={row?.name}
            columnName={column?.name}
          />
        )}
      </Modal>
    </div>
  );
};

export default TableReviewer;
