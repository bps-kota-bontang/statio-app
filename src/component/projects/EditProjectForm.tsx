import { useCallback, useState, type FormEvent } from "react";
import Button from "@/component/ui/Button";
import Input from "@/component/ui/Input";
import { useRequiredFields } from "@/hooks/useRequiredFields";
import type { UpdateProjectRequest } from "@/type/project";

interface EditProjectFormProps {
  name: string;
  onSubmit: (data: UpdateProjectRequest) => Promise<boolean>;
  onCancel: () => void;
}

const EditProjectForm = ({ name: initialName, onSubmit, onCancel }: EditProjectFormProps) => {
  const [name, setName] = useState(initialName);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { errors, validate } = useRequiredFields<UpdateProjectRequest>();

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      const { isValid } = validate({ name }, ["name"]);
      if (!isValid) return;

      setIsSubmitting(true);
      await onSubmit({ name: name.trim() });
      setIsSubmitting(false);
    },
    [name, onSubmit, validate],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold">Edit Project</h2>
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Name</label>
        <Input value={name} onChange={setName} placeholder="Project name" />
        {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
      </div>
      <div className="flex justify-end gap-2">
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

export default EditProjectForm;
