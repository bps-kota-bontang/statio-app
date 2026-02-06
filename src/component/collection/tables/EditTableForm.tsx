"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Button from "@/component/ui/Button";
import Input from "@/component/ui/Input";
import Select from "@/component/ui/Select";
import type { UpdateTableRequest } from "@/type/table";
import { useRequiredFields } from "@/hooks/useRequiredFields";
import { useDimensionApi } from "@/service/dimension";
import { useOrganizationApi } from "@/service/organization";
import { useIndicatorApi } from "@/service/indicator";
import { useTableApi } from "@/service/table";
import Loading from "@/component/ui/Loading";
import Error from "@/component/ui/Error";

interface EditTableFormProps {
  tableID: string;
  onSubmit?: (id: string, data: UpdateTableRequest) => Promise<boolean>;
  onCancel?: () => void;
}

const EditTableForm = ({ tableID, onSubmit, onCancel }: EditTableFormProps) => {
  const { useDimensions } = useDimensionApi();
  const { useTable } = useTableApi();
  const { useIndicators } = useIndicatorApi();
  const { useOrganizations } = useOrganizationApi();

  const { data, isLoading, error } = useTable(tableID);
  const { data: indicators } = useIndicators({ perPage: 1000 });
  const { data: dimensions } = useDimensions({ perPage: 1000 });
  const { data: organizations } = useOrganizations();
  const { errors, validate } = useRequiredFields<UpdateTableRequest>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [indicatorId, setIndicatorId] = useState<string>("");
  const [organizationId, setOrganizationId] = useState<string>("");
  const [dimensionIds, setDimensionIds] = useState<string[]>([]);

  // ✅ Update form values when table data is loaded
  useEffect(() => {
    if (data?.data) {
      setName(data.data.name ?? "");
      setIndicatorId(data.data.indicator?.id ?? "");
      setOrganizationId(data.data.organization?.id ?? "");
      setDimensionIds(data.data.dimensions?.map((d) => d.id) ?? []);
    }
  }, [data]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!onSubmit) return;

      const { isValid } = validate(
        {
          name,
          indicator_id: indicatorId,
          dimension_ids: dimensionIds,
          organization_id: organizationId,
        },
        ["name", "indicator_id", "organization_id"],
      );
      if (!isValid) return;
      setIsSubmitting(true);
      await onSubmit(tableID, {
        name,
        indicator_id: indicatorId,
        dimension_ids: dimensionIds,
        organization_id: organizationId,
      });
      setIsSubmitting(false);
    },
    [
      dimensionIds,
      indicatorId,
      name,
      onSubmit,
      organizationId,
      tableID,
      validate,
    ],
  );

  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} hideButton />;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 relative">
      {/* Name */}
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Name</label>
        <Input
          value={name}
          onChange={setName}
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
            organizations?.data.map((indicator) => ({
              value: indicator.id,
              label: indicator.name,
            })) ?? []
          }
          value={organizationId}
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
              label:
                dimension.name +
                (dimension.notes ? ` (${dimension.notes})` : ""),
            })) ?? []
          }
          maximumSelection={2}
          value={dimensionIds}
          onChange={setDimensionIds}
          multiple
        />
        <p className="text-xs text-gray-500 mt-1">
          Pilih dimensi yang akan ditampilkan pada tabel (maksimal 2).{" "}
          <span className="text-red-600 font-medium">
            Merubah dimensi akan mempengaruhi data yang telah ada pada tabel.
          </span>
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
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update"}
        </Button>
      </div>
    </form>
  );
};

export default EditTableForm;
