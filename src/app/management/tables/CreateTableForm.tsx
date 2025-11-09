"use client";

import { useCallback, useState, type FormEvent } from "react";
import Button from "@/component/ui/Button";
import Input from "@/component/ui/Input";
import type { CreateTableRequest } from "@/type/table";
import { useRequiredFields } from "@/hooks/useRequiredFields";
import { useIndicators } from "@/service/indicator";
import { useDimensions } from "@/service/dimension";
import Select from "@/component/ui/Select";
import { useOrganizations } from "@/service/organization";

interface CreateTableFormProps {
  onSubmit?: (data: CreateTableRequest) => Promise<boolean>;
  onCancel?: () => void;
}

const CreateTableForm = ({ onSubmit, onCancel }: CreateTableFormProps) => {
  const [name, setName] = useState("");
  const [indicatorId, setIndicatorId] = useState<string>("");
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [dimensionIds, setDimensionIds] = useState<string[]>([]);

  const { data: indicators } = useIndicators({
    perPage: 1000,
  });

  const { data: organizations } = useOrganizations();

  const { data: dimensions } = useDimensions({
    perPage: 1000,
  });

  const { errors, validate } = useRequiredFields<CreateTableRequest>();

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!onSubmit) return;

      const isValid = validate(
        { name, indicator_id: indicatorId, dimension_ids: dimensionIds },
        ["name", "indicator_id"]
      );

      if (!isValid) return;

      const success = await onSubmit({
        name,
        indicator_id: indicatorId,
        dimension_ids: dimensionIds,
        organization_id: organizationId,
      });
      if (success) {
        setName("");
        setIndicatorId("");
        setOrganizationId(null);
        setDimensionIds([]);
      }
    },
    [onSubmit, validate, name, indicatorId, dimensionIds, organizationId]
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
          placeholder="Contoh: Jumlah Penduduk Usia Produktif Menurut Pendidikan Terakhir"
        />
        <p className="text-xs text-gray-500 mt-1">
          Nama tabel yang akan ditampilkan pada daftar tabel.
        </p>
        {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
      </div>
      {/* Indicator */}
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Indicator</label>
        <Select
          options={
            indicators?.data.map((indicator) => ({
              value: indicator.id,
              label: indicator.name,
            })) ?? []
          }
          value={indicatorId}
          onChange={setIndicatorId}
        />
        <p className="text-xs text-gray-500 mt-1">
          Pilih indikator yang akan ditampilkan pada tabel.
        </p>
        {errors.indicator_id && (
          <p className="text-xs text-red-500">{errors.indicator_id}</p>
        )}
      </div>
      {/* Organization */}
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Organization</label>
        <Select
          options={
            organizations?.data.map((organization) => ({
              value: organization.id,
              label: organization.name,
            })) ?? []
          }
          value={organizationId ?? ""}
          onChange={setOrganizationId}
        />
        <p className="text-xs text-gray-500 mt-1">
          Pilih organisasi yang bertanggung jawab atas tabel ini.
        </p>
        {errors.organization_id && (
          <p className="text-xs text-red-500">{errors.organization_id}</p>
        )}
      </div>
      {/* Dimension */}
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Dimension</label>
        <Select
          options={
            dimensions?.data.map((dimension) => ({
              value: dimension.id,
              label: dimension.name,
            })) ?? []
          }
          maximumSelection={2}
          value={dimensionIds}
          onChange={setDimensionIds}
          multiple={true}
        />
        <p className="text-xs text-gray-500 mt-1">
          Pilih dimensi yang akan ditampilkan pada tabel (maksimal 2).
        </p>

        {errors.dimension_ids && (
          <p className="text-xs text-red-500">{errors.dimension_ids}</p>
        )}
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

export default CreateTableForm;
