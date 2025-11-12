"use client";

import { useCallback, useState, type FormEvent } from "react";
import Button from "@/component/ui/Button";
import type { BulkLabelsTablesRequest } from "@/type/table";
import { useRequiredFields } from "@/hooks/useRequiredFields";
import { useDimensionApi } from "@/service/dimension";
import Input from "@/component/ui/Input";
import { Check, Plus, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Badge from "@/component/ui/Badge";

interface BulkLabelTableFormProps {
  onSubmit?: (data: BulkLabelsTablesRequest) => Promise<boolean>;
  onCancel?: () => void;
}

const BulkLabelTableForm = ({
  onSubmit,
  onCancel,
}: BulkLabelTableFormProps) => {
  const { useDimensions } = useDimensionApi();
  const [labelInput, setLabelInput] = useState("");
  const [labels, setLabels] = useState<string[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const { data: dimensions } = useDimensions({
    perPage: 1000,
  });

  const { errors, validate } = useRequiredFields<BulkLabelsTablesRequest>();

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!onSubmit) return;

      const isValid = validate({ labels: labels }, ["labels"]);

      if (!isValid) return;

      const success = await onSubmit({
        labels: labels,
      });
      if (success) {
        setLabels([]);
      }
    },
    [onSubmit, validate, labels]
  );

  const handleAddValue = useCallback(() => {
    const v = labelInput.trim();
    if (!v) return;

    // Pastikan tidak ada duplikat (case-insensitive)
    const exists = labels.some((val) => val?.toLowerCase() === v.toLowerCase());
    if (exists) return;

    setLabels((prev) => [...prev, v]);
    setLabelInput("");
  }, [labelInput, labels]);

  const handleRemoveValue = useCallback((valName: string) => {
    setLabels((prev) => prev.filter((v) => v !== valName));
  }, []);

  const handleUpdateValueName = useCallback(
    (index: number, newName: string) => {
      setLabels((prev) =>
        prev.map((v, i) =>
          i === index
            ? newName.trimStart() // trim agar tak ada spasi kosong di depan
            : v
        )
      );
    },
    []
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4 relative">
      {/* Labels */}
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Labels</label>
        <div className="relative flex gap-2 w-full mb-2">
          <Input
            value={labelInput}
            onChange={setLabelInput}
            suggestions={dimensions?.data.map((dim) => dim.name) || []}
            onSelect={setLabelInput}
            className="flex-1"
            placeholder="Contoh: Bidang Statistik, Bidang IT, dll."
            onEnter={() => handleAddValue()}
          />
          <Button
            type="button"
            onClick={() => handleAddValue()}
            className="p-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white transition"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Tambahkan satu atau lebih label untuk mengkategorikan tabel yang
          dipilih.
        </p>
        {errors.labels && (
          <p className="text-xs text-red-500">{errors.labels}</p>
        )}

        <div className="flex flex-wrap gap-3 mt-3">
          <AnimatePresence>
            {labels
              .filter(
                (val, index) =>
                  editingIndex === index || (val && val.trim() !== "")
              )
              .map((val, index) => (
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
                        onChange={(e) =>
                          handleUpdateValueName(index, e.target.value)
                        }
                        className="border-gray-300 border rounded px-2 py-1 text-sm outline-blue-400 focus:ring-1 focus:ring-blue-400"
                        autoFocus
                      />
                      <Button
                        type="button"
                        onClick={() => setEditingIndex(null)}
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
                        onClick={() => {
                          setEditingIndex(index);
                        }}
                        className="cursor-pointer"
                      />
                      {/* Tombol edit & delete */}
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
        <Button type="submit">Create</Button>
      </div>
    </form>
  );
};

export default BulkLabelTableForm;
