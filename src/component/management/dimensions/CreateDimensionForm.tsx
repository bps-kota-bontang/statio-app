"use client";

import { useCallback, useMemo, useState, type FormEvent } from "react";
import Button from "@/component/ui/Button";
import Badge from "@/component/ui/Badge";
import { Plus, X } from "lucide-react";
import Input from "@/component/ui/Input";
import { AnimatePresence, motion } from "framer-motion";
import type { CreateDimensionRequest } from "@/type/dimension";
import { useRequiredFields } from "@/hooks/useRequiredFields";
import { useDimensionApi } from "@/service/dimension";

interface CreateDimensionFormProps {
  onSubmit?: (data: CreateDimensionRequest) => Promise<boolean>;
  onCancel?: () => void;
}

const CreateDimensionForm = ({
  onSubmit,
  onCancel,
}: CreateDimensionFormProps) => {
  const { useDimensions } = useDimensionApi();
  const [name, setName] = useState("");
  const [valueInput, setValueInput] = useState("");
  const [values, setValues] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { errors, validate } = useRequiredFields<CreateDimensionRequest>();

  const { data } = useDimensions({
    perPage: 1000,
  });

  const existingNames = useMemo(
    () => data?.data.map((dim) => dim.name) || [],
    [data]
  );

  const existingValues = useMemo(
    () => data?.data.flatMap((dim) => dim.values.map((val) => val.name)) || [],
    [data]
  );

  const handleAddValue = useCallback(
    (val?: string) => {
      const v = val ?? valueInput.trim();
      if (!v || values.includes(v)) return;
      setValues((prev) => [...prev, v]);
      setValueInput("");
    },
    [valueInput, values]
  );

  const handleRemoveValue = useCallback((val: string) => {
    setValues((prev) => prev.filter((v) => v !== val));
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!onSubmit) return;

      const isValid = validate({ name, values }, ["name"], ["values"]);
      if (!isValid) return;
      setIsSubmitting(true);
      const success = await onSubmit({ name, values });
      setIsSubmitting(false);
      if (success) {
        setName("");
        setValues([]);
        setValueInput("");
      }
    },
    [name, values, onSubmit, validate]
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
        <div className="relative flex gap-2 w-full">
          <Input
            value={valueInput}
            onChange={setValueInput}
            suggestions={existingValues.filter((v) => !values.includes(v))}
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
          "+" untuk menambahkannya.
        </p>
        {errors.values && (
          <p className="text-xs text-red-500">{errors.values}</p>
        )}

        {/* Badges */}
        <div className="flex flex-wrap gap-3 mt-3">
          <AnimatePresence>
            {values.map((val, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative flex items-center"
              >
                <div key={val} className="relative">
                  <Badge label={val} copyable={false} />
                  <button
                    type="button"
                    onClick={() => handleRemoveValue(val)}
                    className="absolute -top-2 -right-2 w-4 h-4 text-xs bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
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
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create"}
        </Button>
      </div>
    </form>
  );
};

export default CreateDimensionForm;
