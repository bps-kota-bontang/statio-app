import { TOTAL_KEY } from "@/component/ui/TableStatio";
import type { Dimension } from "@/type/dimension";
import type { FactRequest } from "@/type/fact";
import type {
  CellDisplay,
  CellStatus,
  PivotColumn,
  PivotRow,
  PivotTable,
} from "@/type/pivot";
import type { Table } from "@/type/table";
import type { CellChange, RowObject } from "handsontable/common";

/** * Transposes a 2D array (matrix).
 * @param matrix The 2D array to transpose
 * @returns The transposed 2D array
 */
export function transpose<T>(matrix: T[][]): T[][] {
  return matrix[0].map((_, colIndex) => matrix.map((row) => row[colIndex]));
}

/** * Converts a Table response into row objects suitable for Handsontable.
 * @param table The Table object from the API response.
 * @returns An object containing data, rowHeaders, colHeaders, rowMap, colMap, and parentRows.
 */
export function tableResponseToRowObjects(table: Table, years?: number[]) {
  const rowDim = table.dimensions[0];
  const colDim = table.dimensions[1];

  // Build initial row headers
  let rowHeaders = rowDim
    ? rowDim.values.map((v) => v.name)
    : years?.sort((a, b) => a - b).map((item) => String(item)) ?? [];
  
  const colHeaders = colDim
    ? colDim.values.map((v) => v.name)
    : [table.indicator.name];

  // Track which rows are parent rows (for excluding from totals)
  const parentRows = new Set<string>();

  // If table is locked and has parent-child relationships, insert parent rows
  if (table.is_locked && rowDim) {
    const parentsMap = new Map<string, { name: string; children: string[] }>();
    
    // Group children by parent
    rowDim.values.forEach((v) => {
      if (v.parent) {
        const parentName = v.parent.name;
        if (!parentsMap.has(parentName)) {
          parentsMap.set(parentName, { name: parentName, children: [] });
        }
        parentsMap.get(parentName)!.children.push(v.name);
      }
    });

    // Insert parent rows before first child
    const newRowHeaders: string[] = [];
    const insertedParents = new Set<string>();
    
    rowHeaders.forEach((rowName) => {
      // Check if this row has a parent
      const dimValue = rowDim.values.find((v) => v.name === rowName);
      const parentName = dimValue?.parent?.name;
      
      // If has parent and parent not yet inserted, insert parent row first
      if (parentName && !insertedParents.has(parentName)) {
        newRowHeaders.push(parentName);
        insertedParents.add(parentName);
        parentRows.add(parentName); // Mark as parent row
      }
      
      // Add the child row
      newRowHeaders.push(rowName);
    });
    
    rowHeaders = newRowHeaders;
  }

  const rowMap = rowDim
    ? Object.fromEntries(rowDim.values.map((v) => [v.name, v]))
    : {
        [table.indicator.name]: {
          id: table.indicator.id,
          name: table.indicator.name,
        },
      };

  const colMap = colDim
    ? Object.fromEntries(colDim.values.map((v) => [v.name, v]))
    : {
        [table.indicator.name]: {
          id: table.indicator.id,
          name: table.indicator.name,
        },
      };

  const data = rowHeaders.map(() => {
    const row: Record<string, unknown> = {};
    colHeaders.forEach((col) => {
      row[col] = null;
    });
    return row;
  });

  // Fill in fact data
  table.facts?.forEach((f) => {
    let rowIndex: number;

    // cari nilai baris
    if (rowDim) {
      const rowVal = f.dimensions.find((d) => d.id === rowDim?.id)?.value;
      if (!rowVal) return;
      rowIndex = rowHeaders.indexOf(rowVal.name);
      if (rowIndex === -1) return;
    } else {
      rowIndex = rowHeaders.indexOf(String(f.year));
      if (rowIndex === -1) return;
    }

    // cari nilai kolom
    let colKey = "";
    if (colDim) {
      const colVal = f.dimensions.find((d) => d.id === colDim.id)?.value;
      if (!colVal) return;
      colKey = colVal.name;
    } else {
      colKey = table.indicator.name;
    }

    data[rowIndex][colKey] = f.value ?? null;
  });

  // Calculate parent row aggregates if locked
  if (table.is_locked && rowDim) {
    rowDim.values.forEach((v) => {
      if (v.parent) {
        const parentName = v.parent.name;
        const parentIndex = rowHeaders.indexOf(parentName);
        const childIndex = rowHeaders.indexOf(v.name);
        
        if (parentIndex !== -1 && childIndex !== -1) {
          // Aggregate child values to parent
          colHeaders.forEach((colKey) => {
            const childValue = data[childIndex][colKey];
            if (childValue !== null && typeof childValue === 'number') {
              const currentParentValue = data[parentIndex][colKey];
              data[parentIndex][colKey] = 
                (typeof currentParentValue === 'number' ? currentParentValue : 0) + childValue;
            }
          });
        }
      }
    });
  }

  return { data, rowHeaders, colHeaders, rowMap, colMap, parentRows };
}

/** * Formats changed cells into a FactRequest payload.
 * @param cells The changed cells as an array of [rowIndex, colIndex, oldValue, newValue].
 * @param rows The array of row header names.
 * @param dimensions The table dimensions.
 * @param year The year for the fact request.
 * @param swapped Whether the table is swapped (transposed).
 * @returns A FactRequest object or null if no valid data.
 */
export const formatCellsToPayload = (
  cells: CellChange[],
  rows: string[],
  dimensions: Dimension[],
  year: number | null,
  swapped?: boolean,
  locale: "id" | "en" = "id"
): FactRequest | null => {
  const isOneDim = dimensions.length === 1;

  let rowDim: Dimension | null = null;
  let colDim: Dimension | null = null;

  if (isOneDim) {
    // 1 DIMENSI
    if (swapped) {
      // Row = Indicators, Col = Dimension
      rowDim = null;
      colDim = dimensions[0];
    } else {
      // Row = Dimension, Col = Indicators
      rowDim = dimensions[0];
      colDim = null;
    }
  } else {
    if (swapped) {
      rowDim = dimensions[1];
      colDim = dimensions[0];
    } else {
      rowDim = dimensions[0];
      colDim = dimensions[1];
    }
  }

  const data: { dimensions: string[]; value: number | null; year: number }[] =
    [];

  cells?.forEach(([rowIndex, colIndex, , newValue]) => {
    const rowName = rows[rowIndex as number];
    const colName = colIndex;

    const cellDimensions: string[] = [];

    const rowDimValue = rowDim?.values.find((v) => v.name === rowName);
    if (rowDimValue) {
      cellDimensions.push(rowDimValue.id);
    }

    const colDimValue = colDim?.values.find((v) => v.name === colName);
    if (colDimValue) {
      cellDimensions.push(colDimValue.id);
    }

    data.push({
      dimensions: cellDimensions,
      value: formattedNumber(newValue, locale),
      year:
        cellDimensions.length > 0 && year
          ? year
          : swapped
          ? Number(colName)
          : Number(rowName),
    });
  });

  return {
    data,
  };
};

/** * Builds data with total rows and columns.
 * @param data The original data as an array of row objects.
 * @param rowCount The number of data rows (excluding total row).
 * @param columnCount The number of data columns (excluding total column).
 * @param parentRowIndices Set of indices for parent rows to exclude from totals.
 * @returns The new data array with totals included.
 */
export const buildDataWithTotals = (
  data: RowObject[],
  rowCount: number,
  columnCount: number,
  dimensionCount: number,
  parentRowIndices?: Set<number>
) => {
  if (!data || data.length === 0) return [];

  const onlyOneCol = columnCount === 1;
  const onlyOneRow = rowCount === 1;

  // Ambil kunci kolom (exclude kolom total jika ada)
  const colKeys = Object.keys(data[0])
    .filter((key) => key !== TOTAL_KEY)
    .slice(0, columnCount);

  // Ambil hanya row data asli (exclude row total lama jika ada)
  const dataRows = data.slice(0, rowCount); // maksimal rowCount

  // Hitung total tiap row
  let newData: RowObject[] = [...dataRows]; // copy dulu data asli

  if (!onlyOneCol) {
    if (dimensionCount > 0) {
      // Tambahkan TOTAL_KEY tiap row jika lebih dari 1 kolom
      newData = newData.map((row) => {
        const total = colKeys.reduce(
          (sum, key) => sum + (Number(row[key]) || 0),
          0
        );

        return {
          ...row,
          [TOTAL_KEY]: Math.round(total * 100) / 100,
        };
      });
    }
  }

  if (!onlyOneRow) {
    // Hanya push baris total jika lebih dari 1 row

    // Hitung total tiap kolom (exclude parent rows to avoid double counting)
    const colTotals: Record<string, number> = {};
    colKeys.forEach((key) => {
      const total = newData.reduce(
        (sum, row, index) => {
          // Skip parent rows when calculating totals
          if (parentRowIndices && parentRowIndices.has(index)) {
            return sum;
          }
          return sum + (Number((row as Record<string, number>)[key]) || 0);
        },
        0
      );

      colTotals[key] = Math.round(total * 100) / 100;
    });

    if (!onlyOneCol) {
      if (dimensionCount > 0) {
        // Hitung grand total jika lebih dari 1 kolom dan dimensionCount > 0
        const grandTotal = colKeys.reduce((sum, key) => sum + colTotals[key], 0);
        newData.push({
          ...colTotals,
          [TOTAL_KEY]: Math.round(grandTotal * 100) / 100,
        });
      }
    } else {
      // Hanya push total per kolom, tanpa grand total
      if (dimensionCount > 0) newData.push({ ...colTotals });
    }
  }

  // Panjang akhir = rowCount + 1
  return newData;
};

export const formattedNumber = (
  value: number | string,
  locale: "id" | "en" = "id"
): number | null => {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return null;

  let normalized;

  if (locale == "id") {
    // Ganti titik jadi kosong, koma jadi titik
    normalized = value.replace(/\./g, "").replace(/,/g, ".");
  } else {
    // Ganti koma jadi kosong, titik jadi titik
    normalized = value.replace(/,/g, "");
  }

  return normalized ? Number(normalized) : null;
};

/**
 * Hitung nomor urut global berdasarkan index, page, dan perPage.
 * Contoh:
 *  - page = 1, perPage = 10, index = 0 → 1
 *  - page = 2, perPage = 10, index = 0 → 11
 */
export function getRowNumber(
  index: number,
  page: number,
  perPage: number
): number {
  return index + 1 + (page - 1) * perPage;
}

const formatNumber = (n: number | null): string => {
  if (n === null) return "-";
  return n.toLocaleString("id-ID");
};

export const buildCellDisplay = (
  value: number | null,
  oldValue: number | null,
  isOutlier: boolean | null | undefined,
  rowId: string,
  colId: string
): CellDisplay => {
  const hasValue = value !== null && value !== undefined;
  const hasOld = oldValue !== null && oldValue !== undefined;

  let hasChanged = false;
  let diffAbs: number | null = null;
  let diffPct: number | null = null;

  if (hasValue && hasOld && value !== oldValue) {
    hasChanged = true;
    diffAbs = value - oldValue;
    if (oldValue !== 0) diffPct = (diffAbs / oldValue) * 100;
  }

  let text: string;
  if (!hasValue) {
    text = "-";
  } else if (hasChanged && hasOld) {
    const sign = diffAbs! > 0 ? "+" : "";
    const diffAbsStr = `${sign}${formatNumber(diffAbs!)}`;
    const diffPctStr = diffPct !== null ? `${sign}${diffPct.toFixed(1)}%` : "";
    text =
      `${formatNumber(oldValue)} → ${formatNumber(value)}\n` +
      `(${diffAbsStr}${diffPctStr ? " / " + diffPctStr : ""})`;
  } else {
    text = formatNumber(value);
  }

  // Build status array berdasarkan prioritas sebenarnya
  const statuses: CellStatus[] = [];

  if (isOutlier) statuses.push("outlier");
  if (!hasValue) statuses.push("null");
  if (hasChanged) statuses.push("changed");
  if (statuses.length === 0) statuses.push("normal");

  // className pakai status prioritas paling tinggi
  const primary = statuses[0];
  let className = "";
  switch (primary) {
    case "outlier":
      className = "bg-red-100 text-red-900 font-semibold";
      break;
    case "null":
      className = "bg-yellow-50 text-yellow-900 italic";
      break;
    case "changed":
      className = "bg-blue-50";
      break;
    default:
      className = "";
  }

  return {
    rowId,
    colId,
    value: hasValue ? value : null,
    oldValue: hasOld ? oldValue : null,
    isOutlier: !!isOutlier,
    hasChanged,
    diffAbs,
    diffPct,
    text,
    status: statuses, // ← ARRAY
    className,
  };
};

export const SINGLE_VALUE_COL_ID = "value";

function buildPivot0Dim(data: Table, years?: number[]): PivotTable {
  // gunakan years kalau dikirim, kalau tidak ambil distinct dari facts
  const yearList =
    years && years.length > 0
      ? years.sort((a, b) => a - b)
      : Array.from(new Set((data.facts || []).map((f) => f.year))).sort(
          (a, b) => a - b
        );

  const columns: PivotColumn[] = [
    {
      id: SINGLE_VALUE_COL_ID,
      name: data.indicator.name,
    },
  ];

  const factMap = new Map<
    number,
    { value: number | null; old: number | null; outlier: boolean | null }
  >();

  for (const fact of data.facts || []) {
    // asumsi 1 fact per tahun (karena tidak ada dimension)
    factMap.set(fact.year, {
      value: fact.value,
      old: fact.old_value,
      outlier: fact.is_outlier,
    });
  }

  const rows: PivotRow[] = yearList.map((year) => {
    const fact = factMap.get(year);
    const value = fact ? fact.value : null;
    const oldValue = fact ? fact.old : null;
    const isOutlier = fact ? fact.outlier : null;

    const cells: PivotRow["cells"] = {
      [SINGLE_VALUE_COL_ID]: buildCellDisplay(
        value,
        oldValue,
        isOutlier,
        String(year),
        SINGLE_VALUE_COL_ID
      ),
    };

    return {
      id: String(year),
      name: String(year),
      cells,
    };
  });

  return {
    tableName: data.name,
    rowLabel: "Tahun",
    columns,
    rows,
  };
}

function buildPivot1Dim(
  data: Table,
  rowDimensionId: string,
  yearFilter?: number
): PivotTable {
  const rowDim = data.dimensions.find((d) => d.id === rowDimensionId);
  if (!rowDim) {
    throw new Error("Row dimension not found");
  }

  const columns: PivotColumn[] = [
    {
      id: SINGLE_VALUE_COL_ID,
      name: data.indicator.name,
    },
  ];

  // key: rowId
  const factMap = new Map<
    string,
    { value: number | null; old: number | null; outlier: boolean | null }
  >();

  for (const fact of data.facts || []) {
    if (yearFilter !== undefined && fact.year !== yearFilter) continue;

    const rowDimVal = fact.dimensions.find((d) => d.id === rowDimensionId);
    if (!rowDimVal) continue;

    const key = rowDimVal.value.id;
    factMap.set(key, {
      value: fact.value,
      old: fact.old_value,
      outlier: fact.is_outlier,
    });
  }

  const rows: PivotRow[] = rowDim.values
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((rv) => {
      const fact = factMap.get(rv.id);
      const value = fact ? fact.value : null;
      const oldValue = fact ? fact.old : null;
      const isOutlier = fact ? fact.outlier : null;

      const cells: PivotRow["cells"] = {
        [SINGLE_VALUE_COL_ID]: buildCellDisplay(
          value,
          oldValue,
          isOutlier,
          rv.id,
          SINGLE_VALUE_COL_ID
        ),
      };

      return {
        id: rv.id,
        name: rv.name,
        cells,
      };
    });

  return {
    tableName: data.name,
    rowLabel: rowDim.name,
    columns,
    rows,
  };
}

function buildPivot2Dim(
  data: Table,
  rowDimensionId: string,
  colDimensionId: string,
  yearFilter?: number
): PivotTable {
  const rowDim = data.dimensions.find((d) => d.id === rowDimensionId);
  const colDim = data.dimensions.find((d) => d.id === colDimensionId);

  if (!rowDim || !colDim) {
    throw new Error("Row/column dimension not found");
  }

  const columns: PivotColumn[] = colDim.values
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((v) => ({
      id: v.id,
      name: v.name,
    }));

  const factMap = new Map<
    string,
    { value: number | null; old: number | null; outlier: boolean | null }
  >();

  for (const fact of data?.facts || []) {
    if (yearFilter !== undefined && fact.year !== yearFilter) continue;

    const rowDimVal = fact.dimensions.find((d) => d.id === rowDimensionId);
    const colDimVal = fact.dimensions.find((d) => d.id === colDimensionId);

    if (!rowDimVal || !colDimVal) continue;

    const key = `${rowDimVal.value.id}__${colDimVal.value.id}`;

    factMap.set(key, {
      value: fact.value,
      old: fact.old_value,
      outlier: fact.is_outlier,
    });
  }

  const rows: PivotRow[] = rowDim.values
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((rv) => {
      const cells: PivotRow["cells"] = {};

      for (const col of columns) {
        const key = `${rv.id}__${col.id}`;
        const fact = factMap.get(key);

        const value = fact ? fact.value : null;
        const oldValue = fact ? fact.old : null;
        const isOutlier = fact ? fact.outlier : null;

        cells[col.id] = buildCellDisplay(
          value,
          oldValue,
          isOutlier,
          rv.id,
          col.id
        );
      }

      return {
        id: rv.id,
        name: rv.name,
        cells,
      };
    });

  return {
    tableName: data.name,
    rowLabel: rowDim.name,
    columns,
    rows,
  };
}

/**
 * Wrapper utama:
 * - dimensi = 0 → gunakan years sebagai dimension (1 dimensi, rows = tahun)
 * - dimensi = 1 → 1 dimensi (rows = dim[0], kolom = "Nilai")
 * - dimensi = 2 → 2 dimensi (rows = dim[0], cols = dim[1])
 *
 * @param data table
 * @param years optional, dipakai untuk:
 *  - dim 0: sumber list tahun
 *  - dim 1 & 2: jika dikirim, pakai years[0] sebagai filter tahun aktif
 */
export const buildPivotFromFacts = (
  data: Table,
  years?: number[]
): PivotTable => {
  const dimCount = data.dimensions.length;

  if (dimCount === 0) {
    return buildPivot0Dim(data, years);
  }

  if (dimCount === 1) {
    const rowDim = data.dimensions[0];
    return buildPivot1Dim(data, rowDim.id);
  }

  // dimCount >= 2 → pakai 2 dimensi pertama
  const rowDim = data.dimensions[0];
  const colDim = data.dimensions[1];

  return buildPivot2Dim(data, rowDim.id, colDim.id);
};

export const formatThousand = (val: number | string | null) => {
  if (val === null || val === "-" || val === undefined) return "-";

  const num = Number(val);
  if (isNaN(num)) return "-";

  return num.toLocaleString("id-ID");
};

// ========= Formatters ========= //
export const formatNumberUnit = (num: number | null) => {
  if (num === null || isNaN(num)) return "-";
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  // if (num >= 1_000) return (num / 1_000).toFixed(0) + "K";
  return num.toString();
};
