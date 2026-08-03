import { useCallback, useState, type FormEvent } from "react";
import Button from "@/component/ui/Button";
import Input from "@/component/ui/Input";
import Select from "@/component/ui/Select";
import { useRequiredFields } from "@/hooks/useRequiredFields";
import type { TableList } from "@/type/table";
import type { ProjectTable, ProjectTableRequest } from "@/type/project";

interface ProjectTableFormProps {
  tables: TableList[];
  relation?: ProjectTable;
  onSubmit: (data: ProjectTableRequest) => Promise<boolean>;
  onCancel: () => void;
}

const ProjectTableForm = ({
  tables,
  relation,
  onSubmit,
  onCancel,
}: ProjectTableFormProps) => {
  const [tableID, setTableID] = useState(relation?.table_id ?? "");
  const [page, setPage] = useState(relation?.page ?? "");
  const [tableNumber, setTableNumber] = useState(relation?.table_number ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { errors, validate } = useRequiredFields<ProjectTableRequest>();

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      const { isValid } = validate(
        { table_id: tableID, page, table_number: tableNumber },
        ["table_id", "page", "table_number"],
      );
      if (!isValid) return;

      setIsSubmitting(true);
      await onSubmit({
        table_id: tableID,
        page: page.trim(),
        table_number: tableNumber.trim(),
      });
      setIsSubmitting(false);
    },
    [onSubmit, page, tableID, tableNumber, validate],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold">
        {relation ? "Edit Project Table" : "Add Table to Project"}
      </h2>
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Table</label>
        {relation ? (
          <Input value={relation.table_name} onChange={() => undefined} disabled />
        ) : (
          <Select
            options={tables.map((table) => ({ value: table.id, label: table.name }))}
            value={tableID}
            onChange={setTableID}
            placeholder="-- Select table --"
          />
        )}
        {errors.table_id && <p className="text-xs text-red-500">{errors.table_id}</p>}
      </div>
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Page</label>
        <Input value={page} onChange={setPage} placeholder="e.g. 12-13" />
        {errors.page && <p className="text-xs text-red-500">{errors.page}</p>}
      </div>
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Table Number</label>
        <Input value={tableNumber} onChange={setTableNumber} placeholder="e.g. 2.1" />
        {errors.table_number && (
          <p className="text-xs text-red-500">{errors.table_number}</p>
        )}
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

export default ProjectTableForm;
