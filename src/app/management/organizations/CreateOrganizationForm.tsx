"use client";

import { useCallback, useMemo, useState, type FormEvent } from "react";
import Button from "@/component/ui/Button";
import Input from "@/component/ui/Input";
import { useOrganizationApi } from "@/service/organization";
import type { CreateOrganizationRequest } from "@/type/organization";
import { useRequiredFields } from "@/hooks/useRequiredFields";

interface CreateOrganizationFormProps {
  onSubmit?: (data: CreateOrganizationRequest) => Promise<boolean>;
  onCancel?: () => void;
}

const CreateOrganizationForm = ({
  onSubmit,
  onCancel,
}: CreateOrganizationFormProps) => {
  const { useOrganizations } = useOrganizationApi();

  const [name, setName] = useState("");

  const { errors, validate } = useRequiredFields<CreateOrganizationRequest>();

  const { data } = useOrganizations({
    perPage: 1000,
  });

  const existingNames = useMemo(() => {
    const names = data?.data.map((dim) => dim.name) || [];
    return Array.from(new Set(names));
  }, [data]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!onSubmit) return;

      const isValid = validate({ name }, ["name"]);
      if (!isValid) return;

      const success = await onSubmit({ name });
      if (success) {
        setName("");
      }
    },
    [name, onSubmit, validate]
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
          placeholder="Contoh: Dinas Ketenagakerjaan, Dinas Lingkungan Hidup"
        />
        <p className="text-xs text-gray-500 mt-1">
          Hanya menggunakan nama organisasi yang belum ada.
        </p>
        {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
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

export default CreateOrganizationForm;
