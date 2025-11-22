export type CellStatus = "normal" | "changed" | "null" | "outlier";

export type CellDisplay = {
  rowId: string;
  colId: string;

  value: number | null;
  oldValue: number | null;
  isOutlier: boolean;

  hasChanged: boolean;
  diffAbs: number | null;
  diffPct: number | null;

  text: string;
  status: CellStatus[];
  className: string;
};

export type PivotColumn = {
  id: string;
  name: string;
};

export type PivotRow = {
  id: string;
  name: string;
  cells: Record<string, CellDisplay>;
};

export type PivotTable = {
  tableName: string;
  rowLabel: string;
  columns: PivotColumn[];
  rows: PivotRow[];
};
