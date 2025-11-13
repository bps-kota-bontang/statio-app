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
import { Globe, Plus, Save, Shuffle, Trash } from "lucide-react";
import type { CellChange } from "handsontable/common";
import { createPortal } from "react-dom";
import { useTableApi } from "@/service/table";
import Switch from "@/component/ui/Switch";

const TableViewer = ({
  id,
  year,
  table,
  onRevalidate,
  years,
}: {
  id: string;
  year: number | null;
  table: Table;
  years?: number[];
  onRevalidate: () => void;
}) => {
  const { updateTableFact, updateTableNotes } = useTableApi(); // ✅ add note API
  const lastPayloadRef = useRef<string>("");
  const tableRef = useRef<TableStatioHandle>(null);
  const [notes, setNotes] = useState(table.notes || ""); // ✅ preload notes if exist
  const [locale, setLocale] = useState<"id" | "en">("id");
  const [showLocaleHelp, setShowLocaleHelp] = useState(false);
  const [helpPos, setHelpPos] = useState<{ top: number; left: number } | null>(
    null
  );
  const helpButtonRef = useRef<HTMLButtonElement>(null);
  const [swap, setSwap] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const [noteStatus, setNoteStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle"); // ✅ for note saving state

  const dims = useMemo(() => table?.dimensions ?? [], [table]);

  const { data, colHeaders, rowHeaders } = useMemo(() => {
    if (!table) return { data: [], colHeaders: [], rowHeaders: [] };
    const base = tableResponseToRowObjects(table, years);
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
  }, [table, years, swap]);

  // 🔹 Save table data
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
    [rowHeaders, dims, year, swap, updateTableFact, id]
  );

  const handleNotesChange = (v: string) => setNotes(v);

  // ✅ Save notes to backend
  const handleSaveNote = async () => {
    if (!notes.trim()) return;
    setNoteStatus("saving");
    try {
      await updateTableNotes(id, { notes });
      setNoteStatus("saved");
      setTimeout(() => setNoteStatus("idle"), 2000);
      onRevalidate();
    } catch {
      setNoteStatus("error");
      setTimeout(() => setNoteStatus("idle"), 3000);
    }
  };

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
      <div className="flex items-center gap-4 p-3 rounded-2xl border border-white/30 bg-white/20 backdrop-blur-xl shadow-sm">
        <Button
          variant="ghost"
          onClick={() => {
            setSwap((p) => !p);
            onRevalidate();
          }}
          className="flex items-center gap-1"
        >
          <Shuffle className="w-4 h-4" />
          Tukar Baris / Kolom
        </Button>

        <Button variant="ghost" className="flex items-center gap-1">
          <Plus className="w-4 h-4" />
          Tambah Baris / Kolom
        </Button>

        <Button variant="ghost" className="flex items-center gap-1">
          <Trash className="w-4 h-4" />
          Hapus Baris / Kolom
        </Button>

        {/* 🌐 Locale Selector */}
        <div className="flex items-center gap-1 ml-auto">
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
            aria-label="Tentang Locale"
          >
            ?
          </button>
        </div>

        {/* 💾 Status + Auto Save */}
        <div className="flex items-center gap-3">
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
        data={data}
        colHeaders={colHeaders}
        rowHeaders={rowHeaders}
        dimensionCount={dims.length}
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

      {/* 📝 Notes + Save */}
      <div className="mt-4 flex gap-4 flex-col">
        <textarea
          className="w-full h-32 p-3 rounded-lg bg-gray-100 font-mono text-xs"
          placeholder="Jika ada catatan khusus terkait data pada tabel ini, silakan tuliskan di sini ya..."
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value)}
        />

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={handleSaveNote}
            disabled={noteStatus === "saving"}
            className="flex items-center gap-2 shadow-lg backdrop-blur-xl border"
          >
            <Save className="w-4 h-4" />
            {noteStatus === "saving" ? "Menyimpan..." : "Simpan Catatan"}
          </Button>

          {noteStatus === "saved" && (
            <span className="text-sm text-green-600">Catatan tersimpan ✓</span>
          )}
          {noteStatus === "error" && (
            <span className="text-sm text-red-600">
              Gagal menyimpan catatan
            </span>
          )}
        </div>
      </div>

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
          document.body
        )}
    </div>
  );
};

export default TableViewer;
