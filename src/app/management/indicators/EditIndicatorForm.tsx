"use client";

import { useCallback, useMemo, useState, type FormEvent } from "react";
import Button from "@/component/ui/Button";
import Input from "@/component/ui/Input";
import { useIndicators } from "@/service/indicator";
import type { Indicator, UpdateIndicatorRequest } from "@/type/indicator";
import { useRequiredFields } from "@/hooks/useRequiredFields";

interface EditIndicatorFormProps {
  indicator: Indicator;
  onSubmit?: (id: string, data: UpdateIndicatorRequest) => Promise<boolean>;
  onCancel?: () => void;
}

const EditIndicatorForm = ({
  indicator,
  onSubmit,
  onCancel,
}: EditIndicatorFormProps) => {
  const [name, setName] = useState(indicator.name);
  const [measure, setMeasure] = useState(indicator.measure);
  const [unit, setUnit] = useState(indicator.unit || "");

  const { errors, validate } = useRequiredFields<UpdateIndicatorRequest>();

  const { data } = useIndicators({ perPage: 1000 });

  const existingNames = useMemo(
    () =>
      data?.data.map((dim) => dim.name).filter((n) => n !== indicator.name) ||
      [],
    [data, indicator.name]
  );

  const existingMeasures = useMemo(
    () => data?.data.map((dim) => dim.measure) || [],
    [data]
  );

  const existingUnits = useMemo(
    () =>
      data?.data.map((dim) => dim.unit).filter((item) => item != null) || [],
    [data]
  );

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!onSubmit) return;

      const isValid = validate(
        {
          name,
          measure,
          unit,
        },
        ["name", "measure"]
      );
      if (!isValid) return;

      await onSubmit(indicator.id, { name, measure, unit });
    },
    [name, measure, unit, onSubmit, validate, indicator.id]
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
          placeholder="Contoh: Jumlah Penduduk, Persentase Penduduk, Indeks Pembangunan Manusia"
        />
        <p className="text-xs text-gray-500 mt-1">
          Jika nama indikator sama, pastikan pengukurannya berbeda (misal: total
          vs persentase).
        </p>
        {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
      </div>

      {/* Measure */}
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Measure</label>
        <Input
          value={measure}
          onChange={setMeasure}
          onSelect={setMeasure}
          suggestions={existingMeasures}
          placeholder="Contoh: Total, Rata-rata, Nilai, Indeks, Persentase"
        />
        <p className="text-xs text-gray-500 mt-1">
          Cara pengukuran indikator, misal: total, rata-rata, persentase, dll.
        </p>
        {errors.measure && (
          <p className="text-xs text-red-500">{errors.measure}</p>
        )}
      </div>

      {/* Unit */}
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Unit</label>
        <Input
          value={unit}
          onChange={setUnit}
          onSelect={setUnit}
          suggestions={existingUnits}
          placeholder="Contoh: Orang, Hektar, Rupiah"
        />
        <p className="text-xs text-gray-500 mt-1">
          Satuan pengukuran indikator, misal: orang, hektar, dll. Kosongkan jika
          tidak ada satuan, misal untuk indeks.
        </p>
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

export default EditIndicatorForm;
