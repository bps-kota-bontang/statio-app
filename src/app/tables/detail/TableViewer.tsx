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
import { useCallback, useMemo, useRef, useState } from "react";
import { Plus, Save, Shuffle, Trash } from "lucide-react";
import type { CellChange } from "handsontable/common";
import { updateTableFact } from "@/service/table";

const TableViewer = ({
  id,
  year,
  table,
  onRevalidate,
}: {
  id: string;
  year: number;
  table: Table;
  onRevalidate: () => void;
}) => {
  const lastPayloadRef = useRef<string>("");
  const tableRef = useRef<TableStatioHandle>(null);
  const [notes, setNotes] = useState("");

  const [swap, setSwap] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );

  const dims = useMemo(() => table?.dimensions ?? [], [table]);

  const { data, colHeaders, rowHeaders } = useMemo(() => {
    if (!table) return { data: [], colHeaders: [], rowHeaders: [] };
    const base = tableResponseToRowObjects(table);
    if (!swap) return base;

    const transposedDataValues = transpose(
      base.rowHeaders.map((rowHeader) =>
        base.colHeaders.map(
          (colHeader) =>
            base.data.find((_r, i) => base.rowHeaders[i] === rowHeader)?.[
              colHeader
            ] ?? null
        )
      )
    );

    const baseTransposed = {
      data: transposedDataValues.map((rowValues) =>
        Object.fromEntries(base.rowHeaders.map((h, i) => [h, rowValues[i]]))
      ),
      rowHeaders: base.colHeaders,
      colHeaders: base.rowHeaders,
    };

    return baseTransposed;
  }, [table, swap]);

  const handleSave = useCallback(
    async (changes: CellChange[]) => {
      const payloadFactRequest = formatCellsToPayload(
        changes,
        rowHeaders,
        dims,
        year,
        swap
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
      } catch {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 3000);
      }
    },
    [rowHeaders, dims, year, swap, id]
  );

  const handleNotesChange = (v: string) => {
    setNotes(v);
  };

  return (
    <div className="space-y-4">
      {/* 🟣 Toolbar (Tukar + Auto Save Switch) */}
      <div className="flex items-center gap-4 p-3 rounded-2xl border border-white/30 bg-white/20 backdrop-blur-xl shadow-sm">
        <Button
          variant="ghost"
          onClick={() => {
            setSwap((p) => !p);
            onRevalidate();
          }}
          className="flex items-center gap-1"
        >
          <Shuffle className="w-4 h-4" /> Tukar Baris / Kolom
        </Button>
        <Button variant="ghost" className="flex items-center gap-1">
          <Plus className="w-4 h-4" />
          Tambah Baris / Kolom
        </Button>
        <Button variant="ghost" className="flex items-center gap-1">
          <Trash className="w-4 h-4" /> Hapus Baris / Kolom
        </Button>

        <div className="ml-auto gap-2 flex items-center justify-center">
          {/* Status */}
          <div className="text-xs font-medium">
            {status === "saving" && (
              <span className="px-3  rounded-full bg-white/40 backdrop-blur-md border border-white/40 text-gray-700 animate-pulse">
                Menyimpan…
              </span>
            )}
            {status === "saved" && (
              <span className="px-3  rounded-full bg-green-400/30 backdrop-blur-md border border-green-400/40 text-green-800 transition-opacity duration-700">
                Tersimpan ✓
              </span>
            )}
            {status === "error" && (
              <span className="px-3  rounded-full bg-red-400/30 backdrop-blur-md border border-red-400/50 text-red-800">
                Gagal menyimpan — mencoba lagi…
              </span>
            )}
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-medium text-gray-700">
            Auto Simpan
            <div
              onClick={() => setAutoSave((v) => !v)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
                autoSave ? "bg-green-500/80" : "bg-gray-300/60"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                  autoSave ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </div>
          </label>
        </div>
      </div>

      {/* 📝 Table */}
      <TableStatio
        ref={tableRef}
        data={data}
        colHeaders={colHeaders}
        rowHeaders={rowHeaders}
        onChange={(changes) => {
          if (autoSave && changes) handleSave(changes);
        }}
      />

      {/* 🔄 Status + Tombol Simpan */}
      <div className="mt-4 flex gap-4 flex-col">
        <textarea
          className="w-full h-32 p-3 rounded-lg bg-gray-100 font-mono text-xs"
          placeholder="
        Jika ada catatan khusus terkait data pada tabel ini, silakan tuliskan di sini ya..."
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value)}
        />

        {/* Tombol Simpan */}
        <Button
          variant="primary"
          size="md"
          className="flex items-center gap-2 shadow-lg backdrop-blur-xl border "
        >
          <Save className="w-4 h-4" /> Simpan Catatan
        </Button>
      </div>
    </div>
  );
};

export default TableViewer;
