export type CellStatus = "normal" | "changed" | "null" | "outlier";

export interface CellDisplay {
  rowId: string;
  colId: string;

  value: number | null;
  oldValue: number | null;
  isOutlier: boolean;

  hasChanged: boolean;
  diffAbs: number | null;
  diffPct: number | null;

  text: string;
  status: CellStatus;
  className: string;
}

export interface PivotColumn {
  id: string;
  name: string;
}

export interface PivotRow {
  id: string;
  name: string;
  cells: Record<string, CellDisplay>; // key = colId
}

export interface PivotTable {
  tableName: string;
  rowLabel: string; // nama header kolom pertama (misal: "Kategori ASN", "Tahun", dsb.)
  columns: PivotColumn[];
  rows: PivotRow[];
}

interface TablePivotProps {
  pivot: PivotTable;
}

interface TablePivotProps {
  pivot: PivotTable;
}

const TablePivot = ({ pivot }: TablePivotProps) => {
  const rows = pivot.rows;
  const cols = pivot.columns;

  const outlierCount = rows.reduce(
    (acc, row) =>
      acc + cols.filter((col) => row.cells[col.id].status === "outlier").length,
    0
  );

  const nullCount = rows.reduce(
    (acc, row) =>
      acc + cols.filter((col) => row.cells[col.id].status === "null").length,
    0
  );

  const changedCount = rows.reduce(
    (acc, row) =>
      acc + cols.filter((col) => row.cells[col.id].status === "changed").length,
    0
  );

  return (
    <div className="w-full rounded-lg border bg-white">
      {/* Header  ringkas */}

      {/* Tabel compact */}
      <div className="relative max-h-[360px] overflow-auto">
        <table className="min-w-full text-[11px]">
          <thead>
            <tr className="bg-slate-100 sticky top-0 z-10 ">
              <th className="border-r px-2 py-1 text-left align-middle sticky left-0 z-20 rounded-tl-lg  text-[10px] font-semibold text-slate-600">
                {pivot.rowLabel}
              </th>
              {pivot.columns.map((col, index) => (
                <th
                  key={col.id}
                  className={`${
                    index === pivot.columns.length - 1 ? "rounded-tr-lg" : ""
                  } px-2 py-1 text-center align-middle text-[10px] font-semibold text-slate-600`}
                >
                  <span className="line-clamp-1">{col.name}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pivot.rows.map((row, rowIndex) => (
              <tr
                key={row.id}
                className={rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50/40"}
              >
                <td className="border-r border-b border-t px-2 py-1 bg-slate-100 sticky left-0 z-10 text-[11px] font-medium text-slate-700 align-middle">
                  <span className="line-clamp-1">{row.name}</span>
                </td>
                {pivot.columns.map((col, index) => {
                  const cell = row.cells[col.id];
                  return (
                    <td
                      key={col.id}
                      className={`${
                        index === 0 ? "border-r" : ""
                      } border-b border-t px-1.5 py-0.5 whitespace-pre-line text-right font-mono leading-tight text-[10px] align-middle ${
                        cell.className
                      } ${
                        cell.status === "normal"
                          ? "hover:bg-slate-50"
                          : "hover:brightness-105"
                      } transition-[background-color,filter]`}
                    >
                      {cell.text}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend mini & rapat */}
      <div className="flex items-center justify-between px-2.5 py-1.5">
        <div className="flex flex-wrap gap-2 text-[10px] text-slate-600 ">
          <div className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded border border-blue-100 bg-blue-50" />
            <span>Berubah</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded border border-yellow-200 bg-yellow-50" />
            <span>Null</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded border border-red-200 bg-red-100" />
            <span>Outlier</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Changed badge */}
          {changedCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] border border-blue-200 bg-blue-50 text-blue-700">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              {changedCount} Changed
            </span>
          )}

          {/* Null badge */}
          {nullCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] border border-yellow-200 bg-yellow-50 text-yellow-700">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
              {nullCount} Null
            </span>
          )}

          {/* Outlier badge */}
          {outlierCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] border border-red-200 bg-red-50 text-red-700">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              {outlierCount} Outlier
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TablePivot;
