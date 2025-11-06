import { TOTAL_KEY } from "@/component/ui/TableStatio";
import type { Dimension } from "@/type/dimension";
import type { FactRequest } from "@/type/fact";
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
 * @returns An object containing data, rowHeaders, colHeaders, rowMap, and colMap.
 */
export function tableResponseToRowObjects(table: Table, years?: number[]) {
  const rowDim = table.dimensions[0];
  const colDim = table.dimensions[1];

  const rowHeaders = rowDim
    ? rowDim.values.map((v) => v.name)
    : years?.sort((a, b) => a - b).map((item) => String(item)) ?? []; // tidak ada dimensi, indikator tunggal
  const colHeaders = colDim
    ? colDim.values.map((v) => v.name)
    : [table.indicator.name]; // dimensi tunggal, indikator di kolom

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

  table.facts?.forEach((f) => {
    let rowIndex: number;

    // cari nilai baris
    if (rowDim) {
      const rowVal = f.dimensions.find((d) => d.id === rowDim?.id)?.value;
      if (!rowVal) return;
      rowIndex = rowHeaders.indexOf(rowVal.name);
      if (rowIndex === -1) return; // tidak ditemukan, mungkin nilai dimensi tidak ada di rowHeaders
    } else {
      rowIndex = rowHeaders.indexOf(String(f.year));
      if (rowIndex === -1) return; // tidak ditemukan, mungkin tahun tidak ada di rowHeaders
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

  return { data, rowHeaders, colHeaders, rowMap, colMap };
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
 * @returns The new data array with totals included.
 */
export const buildDataWithTotals = (
  data: RowObject[],
  rowCount: number,
  columnCount: number,
  dimensionCount: number
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
      newData = newData.map((row) => ({
        ...row,
        [TOTAL_KEY]: colKeys.reduce(
          (sum, key) => sum + (Number(row[key]) || 0),
          0
        ),
      }));
    }
  }

  if (!onlyOneRow) {
    // Hanya push baris total jika lebih dari 1 row

    // Hitung total tiap kolom
    const colTotals: Record<string, number> = {};
    colKeys.forEach((key) => {
      colTotals[key] = newData.reduce(
        (sum, row) => sum + (Number((row as Record<string, number>)[key]) || 0),
        0
      );
    });

    if (!onlyOneCol) {
      // Hitung grand total jika lebih dari 1 kolom
      const grandTotal = colKeys.reduce((sum, key) => sum + colTotals[key], 0);
      newData.push({ ...colTotals, [TOTAL_KEY]: grandTotal });
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
