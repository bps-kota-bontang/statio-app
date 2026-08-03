import { useCallback, useState, type FormEvent } from "react";
import Button from "@/component/ui/Button";
import Input from "@/component/ui/Input";
import { useRequiredFields } from "@/hooks/useRequiredFields";
import type { CreateProjectRequest } from "@/type/project";

interface CreateProjectFormProps {
  onSubmit: (data: CreateProjectRequest) => Promise<boolean>;
  onCancel: () => void;
}

const CreateProjectForm = ({ onSubmit, onCancel }: CreateProjectFormProps) => {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { errors, validate } = useRequiredFields<CreateProjectRequest>();

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      const { isValid } = validate({ name }, ["name"]);
      if (!isValid) return;

      setIsSubmitting(true);
      if (await onSubmit({ name: name.trim() })) setName("");
      setIsSubmitting(false);
    },
    [name, onSubmit, validate],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold">New Project</h2>
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
          {isSubmitting ? "Creating..." : "Create"}
        </Button>
      </div>
    </form>
  );
};

export default CreateProjectForm;
