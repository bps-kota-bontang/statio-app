"use client";

import { useCallback, useMemo, useState, type FormEvent } from "react";
import Button from "@/component/ui/Button";
import Input from "@/component/ui/Input";
import { useOrganizationApi } from "@/service/organization";
import type {
  Organization,
  UpdateOrganizationRequest,
} from "@/type/organization";
import { useRequiredFields } from "@/hooks/useRequiredFields";

interface EditOrganizationFormProps {
  organization: Organization;
  onSubmit?: (id: string, data: UpdateOrganizationRequest) => Promise<boolean>;
  onCancel?: () => void;
}

const EditOrganizationForm = ({
  organization,
  onSubmit,
  onCancel,
}: EditOrganizationFormProps) => {
  const { useOrganizations } = useOrganizationApi();

  const [name, setName] = useState(organization.name);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { errors, validate } = useRequiredFields<UpdateOrganizationRequest>();

  const { data } = useOrganizations({ perPage: 1000 });

  const existingNames = useMemo(() => {
    const names = data?.data.map((dim) => dim.name) || [];
    return Array.from(new Set(names));
  }, [data]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!onSubmit) return;

      const { isValid } = validate(
        {
          name,
        },
        ["name"]
      );
      if (!isValid) return;
      setIsSubmitting(true);
      await onSubmit(organization.id, { name });
      setIsSubmitting(false);
    },
    [name, onSubmit, validate, organization.id]
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
          Jangan menggunakan nama organisasi yang sudah ada.
        </p>
        {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-2 mt-3">
        <Button type="button" onClick={onCancel} variant="secondary">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
};

export default EditOrganizationForm;
