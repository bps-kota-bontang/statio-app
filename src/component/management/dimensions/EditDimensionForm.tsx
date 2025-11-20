"use client";

import { useCallback, useMemo, useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/component/ui/Button";
import Badge from "@/component/ui/Badge";
import { Plus, Check, X } from "lucide-react";
import Input from "@/component/ui/Input";
import { useDimensionApi } from "@/service/dimension";
import type {
  Dimension,
  UpdateDimensionRequest,
  UpdateDimensionValueRequest,
} from "@/type/dimension";
import { useRequiredFields } from "@/hooks/useRequiredFields";

interface EditDimensionFormProps {
  dimension: Dimension;
  onSubmit?: (id: string, data: UpdateDimensionRequest) => Promise<boolean>;
  onCancel?: () => void;
}

const EditDimensionForm = ({
  dimension,
  onSubmit,
  onCancel,
}: EditDimensionFormProps) => {
  const { useDimensions } = useDimensionApi();
  const [name, setName] = useState(dimension.name);
  const [valueInput, setValueInput] = useState("");
  const [values, setValues] = useState<UpdateDimensionValueRequest[]>(
    dimension.values
      .map((v) => ({ id: v.id, name: v.name?.trim() ?? "" }))
      .filter((v) => v.name !== "") // Hapus value kosong dari awal
  );

  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const { errors, validate } = useRequiredFields<UpdateDimensionRequest>();

  const { data } = useDimensions({ perPage: 1000 });

  const existingNames = useMemo(
    () =>
      data?.data.map((dim) => dim.name).filter((n) => n !== dimension.name) ||
      [],
    [data, dimension.name]
  );

  const existingValues = useMemo(
    () =>
      data?.data
        .flatMap((dim) => dim.values.map((val) => val.name))
        .filter((v) => !values.some((val) => val.name === v)) || [],
    [data, values]
  );

  const handleAddValue = useCallback(() => {
    const v = valueInput.trim();
    if (!v) return;

    // Pastikan tidak ada duplikat (case-insensitive)
    const exists = values.some(
      (val) => val?.name?.toLowerCase() === v.toLowerCase()
    );
    if (exists) return;

    setValues((prev) => [...prev, { name: v }]);
    setValueInput("");
  }, [valueInput, values]);

  const handleRemoveValue = useCallback((valName: string) => {
    setValues((prev) => prev.filter((v) => v.name !== valName));
  }, []);

  const handleUpdateValueName = useCallback(
    (index: number, newName: string) => {
      setValues((prev) =>
        prev.map((v, i) =>
          i === index
            ? { ...v, name: newName.trimStart() } // trim agar tak ada spasi kosong di depan
            : v
        )
      );
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!onSubmit) return;

      const trimmedName = name.trim();
      const cleanedValues = values
        .map((v) => ({
          id: v.id,
          name: v.name?.trim() ?? "",
        }))
        .filter((v) => v.name !== ""); // buang value kosong

      if (trimmedName === "") {
        alert("Nama dimensi tidak boleh kosong.");
        return;
      }

      if (cleanedValues.length === 0) {
        alert("Minimal harus ada satu value yang tidak kosong.");
        return;
      }

      const isValid = validate({ name: trimmedName, values: cleanedValues }, [
        "name",
      ]);
      if (!isValid) return;

      // Bangun payload yang mengikuti aturan:
      // 1. Jika tidak diubah → kirim id saja
      // 2. Jika diubah → kirim id + name
      // 3. Jika baru → hanya name
      const payloadValues: UpdateDimensionValueRequest[] = cleanedValues.map(
        (v) => {
          const original = dimension.values.find((ov) => ov.id === v.id);

          if (!v.id) return { name: v.name }; // value baru

          if (original && original.name === v.name) return { id: v.id }; // tidak diubah

          return { id: v.id, name: v.name }; // diubah
        }
      );

      const success = await onSubmit(dimension.id, {
        name: trimmedName,
        values: payloadValues,
      });

      if (success) setEditingIndex(null);
    },
    [name, values, onSubmit, validate, dimension]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4 relative">
      {/* Name */}
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Name</label>
        <Input
          value={name}
          onChange={setName}
          onSelect={setName}
          suggestions={existingNames}
          placeholder="Contoh: Jenis Tanaman, Tingkat Pendidikan"
        />
        <p className="text-xs text-gray-500 mt-1">
          Nama dimensi yang sama tidak perlu dibuat ulang, kecuali opsinya
          berbeda.
        </p>
        {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
      </div>

      {/* Values */}
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Values</label>
        <div className="relative flex gap-2 w-full mb-2">
          <Input
            value={valueInput}
            onChange={setValueInput}
            suggestions={existingValues}
            onSelect={setValueInput}
            className="flex-1"
            placeholder="Contoh: Padi, SMA, Laki-laki, Puskesmas"
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
          Tambahkan opsi yang sesuai untuk dimensi ini. Tekan enter atau tombol
          "+" untuk menambahkannya. Jika ingin mengubah nama opsi, klik pada
          opsi tersebut.
        </p>
        {errors.values && (
          <p className="text-xs text-red-500">{errors.values}</p>
        )}

        <div className="flex flex-wrap gap-3 mt-3">
          <AnimatePresence>
            {values
              .filter(
                (val, index) =>
                  editingIndex === index || (val.name && val.name.trim() !== "")
              )
              .map((val, index) => (
                <motion.div
                  key={val.id ?? index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative flex items-center"
                >
                  {editingIndex === index ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={val.name}
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
                        label={val.name ?? ""}
                        copyable={false}
                        onClick={() => {
                          setEditingIndex(index);
                        }}
                        className="cursor-pointer"
                      />
                      {/* Tombol edit & delete */}
                      <button
                        type="button"
                        onClick={() => handleRemoveValue(val.name ?? "")}
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

export default EditDimensionForm;
