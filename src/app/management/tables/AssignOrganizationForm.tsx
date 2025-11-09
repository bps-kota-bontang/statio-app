"use client";

import { useCallback, useState, type FormEvent } from "react";
import Button from "@/component/ui/Button";
import type { AssignOrganizationRequest } from "@/type/table";
import { useRequiredFields } from "@/hooks/useRequiredFields";
import Select from "@/component/ui/Select";
import { useOrganizations } from "@/service/organization";

interface AssignOrganizationFormProps {
  onSubmit?: (data: AssignOrganizationRequest) => Promise<boolean>;
  onCancel?: () => void;
}

const AssignOrganizationForm = ({
  onSubmit,
  onCancel,
}: AssignOrganizationFormProps) => {
  const [organizationId, setOrganizationId] = useState<string>("");

  const { data: organizations } = useOrganizations();

  const { errors, validate } = useRequiredFields<AssignOrganizationRequest>();

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!onSubmit) return;

      const isValid = validate({ organization_id: organizationId }, [
        "organization_id",
      ]);

      if (!isValid) return;

      const success = await onSubmit({
        organization_id: organizationId,
      });
      if (success) {
        setOrganizationId("");
      }
    },
    [onSubmit, validate, organizationId]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4 relative">
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
      {/* Buttons */}
      <div className="flex justify-end gap-2 mt-3">
        <Button type="button" onClick={onCancel} variant="secondary">
          Cancel
        </Button>
        <Button type="submit">Assign</Button>
      </div>
    </form>
  );
};

export default AssignOrganizationForm;
