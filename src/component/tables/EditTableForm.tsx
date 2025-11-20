"use client";

import { useCallback, useMemo, useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/component/ui/Button";
import Badge from "@/component/ui/Badge";
import { Plus, Check, X } from "lucide-react";
import Input from "@/component/ui/Input";
import type { TableList, UpdateTableLabelRequest } from "@/type/table";
import { useTableApi } from "@/service/table";

interface EditTableLabelsFormProps {
  table: TableList;
  onSubmit?: (id: string, data: UpdateTableLabelRequest) => Promise<boolean>;
  onCancel?: () => void;
}

const EditTableLabelsForm = ({
  table,
  onSubmit,
  onCancel,
}: EditTableLabelsFormProps) => {
  const { useTables } = useTableApi();
  const [labelInput, setLabelInput] = useState("");
  const [labels, setLabels] = useState<string[]>(table.labels || []);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const { data } = useTables({ perPage: 1000 });

  const existingValues = useMemo(
    () =>
      data?.data
        ?.flatMap((tbl) => tbl?.labels || [])
        ?.filter((v) => !labels.includes(v)) || [],
    [data, labels]
  );

  const handleAddValue = useCallback(() => {
    const v = labelInput.trim();
    if (!v) return;

    const exists = labels.some((val) => val.toLowerCase() === v.toLowerCase());
    if (exists) return;

    setLabels((prev) => [...prev, v]);
    setLabelInput("");
  }, [labelInput, labels]);

  const handleRemoveValue = useCallback((val: string) => {
    setLabels((prev) => prev.filter((v) => v !== val));
  }, []);

  // 1) Sederhanakan update saat mengetik: hanya ubah nilai sementara
  const handleUpdateValue = useCallback((index: number, newValue: string) => {
    setLabels((prev) => prev.map((v, i) => (i === index ? newValue : v)));
  }, []);

  // 2) Tambah konfirmasi edit untuk Enter / klik ✓
  const confirmEdit = useCallback((index: number) => {
    setLabels((prev) => {
      const raw = prev[index] ?? "";
      const trimmed = raw.trim();

      // kosong -> hapus
      if (trimmed === "") {
        const next = prev.filter((_, i) => i !== index);
        return next;
      }

      // duplikat (case-insensitive) -> jangan ubah, hanya keluar dari mode edit
      const lower = trimmed.toLowerCase();
      const isDup = prev.some(
        (v, i) => i !== index && v.toLowerCase() === lower
      );
      if (isDup) {
        return prev;
      }

      // simpan hasil trim
      const next = [...prev];
      next[index] = trimmed;
      return next;
    });

    setEditingIndex(null);
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!onSubmit) return;

      const cleaned = labels.map((v) => v.trim()).filter(Boolean);

      const success = await onSubmit(table.id, { labels: cleaned });
      if (success) setEditingIndex(null);
    },
    [labels, onSubmit, table.id]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4 relative">
      {/* Label Editor */}
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Labels</label>
        <div className="relative flex gap-2 w-full mb-2">
          <Input
            value={labelInput}
            onChange={setLabelInput}
            suggestions={existingValues}
            onSelect={setLabelInput}
            className="flex-1"
            placeholder="Contoh: Bidang Statistik, Bidang IT, dll."
            onEnter={handleAddValue}
          />
          <Button
            type="button"
            onClick={handleAddValue}
            className="p-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white transition"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Tambahkan atau ubah label tabel. Tekan Enter atau tombol "+" untuk
          menambah label.
        </p>

        <div className="flex flex-wrap gap-3 mt-3">
          <AnimatePresence>
            {labels.map((val, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative flex items-center"
              >
                {editingIndex === index ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => handleUpdateValue(index, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault(); // cegah submit form
                          e.stopPropagation();
                          confirmEdit(index); // konfirmasi edit
                        } else if (e.key === "Escape") {
                          e.preventDefault();
                          setEditingIndex(null); // batal edit
                        }
                      }}
                      onBlur={() => confirmEdit(index)} // opsional: konfirmasi saat blur
                      className="border-gray-300 border rounded px-2 py-1 text-sm outline-blue-400 focus:ring-1 focus:ring-blue-400"
                      autoFocus
                    />
                    <Button
                      type="button"
                      onClick={() => confirmEdit(index)} // klik ✓ konfirmasi edit
                      size="sm"
                    >
                      <Check className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <Badge
                      label={val}
                      copyable={false}
                      onClick={() => setEditingIndex(index)}
                      className="cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveValue(val)}
                      className="absolute -top-2 -right-2 w-4 h-4 text-xs bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-2 mt-3">
        <Button type="button" onClick={onCancel} variant="secondary">
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
};

export default EditTableLabelsForm;
