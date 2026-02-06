import Button from "@/component/ui/Button";
import TableStatio, {
  type TableStatioHandle,
} from "@/component/ui/TableStatio";
import type { Table } from "@/type/table";
import {
  formatCellsToPayload,
  tableResponseToRowObjects,
  transpose,
} from "@/utils/table";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Globe, Shuffle } from "lucide-react";
import type { CellChange } from "handsontable/common";
import { createPortal } from "react-dom";
import { useTableApi } from "@/service/table";
import Switch from "@/component/ui/Switch";

const TableViewer = ({
  id,
  year,
  isLocked,
  table,
  onRevalidate,
  years,
}: {
  id: string;
  year: number | null;
  isLocked?: boolean;
  table: Table;
  years?: number[];
  onRevalidate: (type: string) => void;
}) => {
  const { updateTableFact } = useTableApi(); // ✅ add note API
  const lastPayloadRef = useRef<string>("");
  const tableRef = useRef<TableStatioHandle>(null);

  const [locale, setLocale] = useState<"id" | "en">("id");
  const [showLocaleHelp, setShowLocaleHelp] = useState(false);
  const [helpPos, setHelpPos] = useState<{ top: number; left: number } | null>(
    null,
  );
  const helpButtonRef = useRef<HTMLButtonElement>(null);
  const [swap, setSwap] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );

  const dims = useMemo(() => table?.dimensions ?? [], [table]);

  const computedTable = useMemo(() => {
    if (!table)
      return {
        data: [],
        colHeaders: [],
        rowHeaders: [],
        parentRows: new Set<string>(),
        rowDimension: null,
        colDimension: null,
      };
    const base = tableResponseToRowObjects(table, years);

    // Determine row and column dimensions based on swap
    const rowDim = !swap ? dims[0] : dims.length === 2 ? dims[1] : null;
    const colDim = !swap ? (dims.length === 2 ? dims[1] : null) : dims[0];

    if (!swap)
      return {
        ...base,
        rowDimension: rowDim ?? null,
        colDimension: colDim ?? null,
      };

    const transposedDataValues = transpose(
      base.rowHeaders.map((rowHeader) =>
        base.colHeaders.map(
          (colHeader) =>
            base.data.find((_r, i) => base.rowHeaders[i] === rowHeader)?.[
              colHeader
            ] ?? null,
        ),
      ),
    );

    // When transposed, parent rows become parent columns
    // We need to track which columns are parent columns
    const parentColumns = new Set<string>(Array.from(base.parentRows));

    const baseTransposed = {
      data: transposedDataValues.map((rowValues) =>
        Object.fromEntries(base.rowHeaders.map((h, i) => [h, rowValues[i]])),
      ),
      rowHeaders: base.colHeaders,
      colHeaders: base.rowHeaders,
      parentRows: new Set<string>(), // No parent rows when swapped (they become parent columns)
      parentColumns, // Track parent columns
      rowDimension: rowDim,
      colDimension: colDim,
    };

    return baseTransposed;
  }, [table, years, swap, dims]);

  const {
    data,
    rowHeaders,
    colHeaders,
    parentRows,
    rowDimension,
    colDimension,
  } = computedTable;

  // Extract parentColumns if exists (from transposed data)
  const parentColumns =
    "parentColumns" in computedTable
      ? (computedTable.parentColumns as Set<string>)
      : undefined;

  // 🔹 Save table data
  const handleSave = useCallback(
    async (changes: CellChange[]) => {
      const payloadFactRequest = formatCellsToPayload(
        changes,
        rowHeaders,
        dims,
        year,
        swap,
      );

      if (!payloadFactRequest) return;

      const payloadString = JSON.stringify(payloadFactRequest);
      if (lastPayloadRef.current === payloadString) return;

      setStatus("saving");
      try {
        await updateTableFact(id, payloadFactRequest);
        lastPayloadRef.current = payloadString;
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 2000);
        onRevalidate("facts");
      } catch {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 3000);
      }
    },
    [rowHeaders, dims, year, swap, updateTableFact, id, onRevalidate],
  );

  // 🔹 Hitung posisi popup locale
  useEffect(() => {
    if (showLocaleHelp && helpButtonRef.current) {
      const rect = helpButtonRef.current.getBoundingClientRect();
      setHelpPos({ top: rect.bottom + 6, left: rect.right - 260 });
    }
  }, [showLocaleHelp]);

  // 🔹 Tutup popup kalau klik di luar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        helpButtonRef.current &&
        !helpButtonRef.current.contains(e.target as Node)
      ) {
        setShowLocaleHelp(false);
      }
    };
    if (showLocaleHelp) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showLocaleHelp]);

  return (
    <div className="space-y-4 relative">
      {/* 🟣 Toolbar */}
      <div className="flex flex-wrap items-center gap-4 p-3 rounded-2xl border border-white/30 bg-white/20 backdrop-blur-xl shadow-sm max-md:flex-col max-md:items-stretch">
        {/* 🔁 Swap */}
        <Button
          variant="ghost"
          onClick={() => {
            setSwap((p) => !p);
            onRevalidate("swap");
          }}
          className="flex items-center gap-1 max-md:w-full"
        >
          <Shuffle className="w-4 h-4" />
          Tukar Baris / Kolom
        </Button>

        {/* ➕ Add */}
        {/* flex  */}
        {/* <Button
          variant="ghost"
          className="items-center gap-1 max-md:w-full hidden"
        >
          <Plus className="w-4 h-4" />
          Tambah Baris / Kolom
        </Button> */}

        {/* 🗑 Delete */}
        {/* flex  */}
        {/* <Button
          variant="ghost"
          className="items-center gap-1 max-md:w-full hidden"
        >
          <Trash className="w-4 h-4" />
          Hapus Baris / Kolom
        </Button> */}
        {/* 🌐 Locale */}
        <div className="flex items-center gap-2 ml-auto max-md:ml-0 max-md:w-full max-md:flex justify-center">
          <Globe className="w-4 h-4 text-gray-600" />

          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as "id" | "en")}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1 bg-white/60 backdrop-blur-md focus:outline-none"
          >
            <option value="id">Indonesia</option>
            <option value="en">English</option>
          </select>

          <button
            ref={helpButtonRef}
            onClick={(e) => {
              e.stopPropagation();
              setShowLocaleHelp((v) => !v);
            }}
            className="text-gray-500 hover:text-gray-800 px-1"
          >
            ?
          </button>
        </div>
        {/* 💾 Status + AutoSave */}
        <div className="flex items-center gap-3 max-md:w-full max-md:justify-between">
          <div className="text-xs font-medium">
            {status === "saving" && (
              <span className="px-3 rounded-full bg-white/40 text-gray-700 animate-pulse">
                Menyimpan…
              </span>
            )}
            {status === "saved" && (
              <span className="px-3 rounded-full bg-green-400/30 text-green-800">
                Tersimpan ✓
              </span>
            )}
            {status === "error" && (
              <span className="px-3 rounded-full bg-red-400/30 text-red-800">
                Gagal menyimpan — mencoba lagi…
              </span>
            )}
          </div>

          <Switch
            disabled
            label="Auto Simpan"
            checked={autoSave}
            onChange={setAutoSave}
          />
        </div>
      </div>

      {/* 🧮 Table */}
      <TableStatio
        ref={tableRef}
        isLocked={isLocked}
        data={data}
        colHeaders={colHeaders}
        rowHeaders={rowHeaders}
        parentRows={parentRows}
        aggregate={
          dims.length === 1
            ? !swap // Jika tidak di-swap, aggregate untuk row (bottom)
              ? (table?.aggregate ?? null)
              : null // Jika di-swap, aggregate akan jadi column (right), bukan row
            : dims.length === 2 && rowDimension?.is_aggregated === true
              ? "sum" // Placeholder, will be overridden by rowAggregates
              : null
        }
        rowAggregates={
          dims.length === 1 && !swap && table?.aggregate
            ? // Dimension = 1, not swapped: rowAggregates = all columns same aggregate
              colHeaders.map(() => table.aggregate!)
            : dims.length === 2 &&
                rowDimension?.is_aggregated === true &&
                colDimension
              ? // Map column headers to their aggregates from column dimension values
                (() => {
                  const aggregates = colHeaders.map((colName) => {
                    const colValue = colDimension.values.find(
                      (v) => v.name === colName,
                    );
                    return colValue?.aggregate ?? table.aggregate ?? null;
                  });
                  return aggregates;
                })()
              : undefined
        }
        colAggregates={
          dims.length === 1 && swap && table?.aggregate
            ? // Dimension = 1, swapped: colAggregates = all rows same aggregate
              rowHeaders.map(() => table.aggregate!)
            : dims.length === 2 &&
                colDimension?.is_aggregated === true &&
                rowDimension
              ? // Map row headers to their aggregates from row dimension values
                (() => {
                  const aggregates = rowHeaders.map((rowName) => {
                    // Check if this column is a parent column (when transposed)
                    if (parentColumns && parentColumns.has(rowName)) {
                      // Parent columns (former parent rows) should aggregate their children
                      // Use their own aggregate if defined, fallback to table aggregate or "sum"
                      const rowValue = rowDimension.values.find(
                        (v) => v.name === rowName,
                      );
                      return rowValue?.aggregate ?? table.aggregate ?? "sum";
                    }

                    const rowValue = rowDimension.values.find(
                      (v) => v.name === rowName,
                    );
                    return rowValue?.aggregate ?? table.aggregate ?? null;
                  });
                  return aggregates;
                })()
              : undefined
        }
        needsColAggregate={
          (dims.length === 1 && swap && table?.aggregate !== null) ||
          (dims.length === 2 && colDimension?.is_aggregated === true)
        }
        locale={locale}
        onChange={(changes) => {
          if (autoSave && changes) handleSave(changes);
        }}
      />
      <p className="text-xs text-gray-500">
        Silakan masukkan angka <b>tanpa pemisah ribuan</b>. Contoh: <br />•
        Untuk 1.234 (Indonesia), ketik <code>1234</code> <br />• Untuk 1,234
        (English), ketik <code>1234</code>
      </p>

      {/* 🌐 Popup Portal */}
      {showLocaleHelp &&
        helpPos &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: helpPos.top,
              left: helpPos.left,
              zIndex: 9999,
            }}
            className="bg-white shadow-lg rounded-lg p-3 w-64 text-sm text-gray-700 border border-gray-200"
          >
            <p>Mengatur format angka pada tabel:</p>
            <p className="mt-2 text-xs text-gray-600">
              • Indonesia: <code>1.234,56</code> <br />• English:{" "}
              <code>1,234.56</code>
            </p>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default TableViewer;
