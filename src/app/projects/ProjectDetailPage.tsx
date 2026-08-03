import { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext, useParams } from "react-router";
import { Plus } from "lucide-react";
import Button from "@/component/ui/Button";
import DataTable, { type Column } from "@/component/ui/DataTable";
import Modal from "@/component/ui/Modal";
import ProjectTableForm from "@/component/projects/ProjectTableForm";
import { useConfirm } from "@/hooks/useConfirm";
import { useProjectApi } from "@/service/project";
import { useTableApi } from "@/service/table";
import type { ProjectTable, ProjectTableRequest } from "@/type/project";
import type { StatioContextType } from "@/component/layout/StatioLayout";
import Loading from "@/component/ui/Loading";
import Error from "@/component/ui/Error";

const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { setBreadcrumbs } = useOutletContext<StatioContextType>();
  const { useProject, addTable, updateTable, removeTable } = useProjectApi();
  const { useTables } = useTableApi();
  const { data: projectResponse, isLoading, mutate } = useProject(id);
  const { data: tablesResponse } = useTables({ perPage: 1000 });
  const { ask, ConfirmDialog } = useConfirm();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingRelation, setEditingRelation] = useState<ProjectTable | null>(
    null,
  );
  const project = projectResponse?.data;
  const relations = useMemo(() => project?.tables ?? [], [project?.tables]);

  useEffect(() => {
    document.title = project
      ? `${project.name} | Projects | Statio`
      : "Project | Statio";
    setBreadcrumbs([
      { label: "Dashboard", href: "/" },
      { label: "Projects", href: "/projects" },
      ...(project ? [{ label: project.name }] : [{ label: "Project" }]),
    ]);
  }, [project, setBreadcrumbs]);

  const availableTables = useMemo(() => {
    const assigned = new Set(relations.map((relation) => relation.table_id));
    return (tablesResponse?.data ?? []).filter(
      (table) => !assigned.has(table.id),
    );
  }, [relations, tablesResponse?.data]);

  const handleAdd = async (payload: ProjectTableRequest) => {
    if (!id) return false;
    try {
      await addTable(id, payload);
      setIsAddOpen(false);
      mutate();
      return true;
    } catch (error) {
      console.error("Error adding table to project:", error);
      return false;
    }
  };

  const handleUpdate = async (payload: ProjectTableRequest) => {
    if (!id || !editingRelation) return false;
    try {
      await updateTable(id, editingRelation.table_id, {
        page: payload.page,
        table_number: payload.table_number,
      });
      setEditingRelation(null);
      mutate();
      return true;
    } catch (error) {
      console.error("Error updating project table:", error);
      return false;
    }
  };

  const handleRemove = useCallback(
    async (tableID: string) => {
      if (!id) return;
      await removeTable(id, tableID);
      mutate();
    },
    [id, mutate, removeTable],
  );

  const columns = useMemo<Column<ProjectTable>[]>(
    () => [
      { key: "no", label: "No", sortable: false, render: (_, no) => no },
      { key: "table_name", label: "Table", sortable: true },
      { key: "table_number", label: "Table Number", sortable: true },
      { key: "page", label: "Page", sortable: true },
      {
        key: "actions",
        label: "Actions",
        sortable: false,
        render: (row) => (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setEditingRelation(row)}>
              Edit
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() =>
                ask({
                  title: "Remove Table?",
                  message:
                    "Only this project link will be removed. The table will remain available.",
                  onConfirm: () => handleRemove(row.table_id),
                })
              }
            >
              Remove
            </Button>
          </div>
        ),
      },
    ],
    [ask, handleRemove],
  );

  if (isLoading) return <Loading />;
  if (!project) return <Error message="Project not found." />;

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">{project.name}</h1>
        </div>
      </div>
      <DataTable
        data={relations}
        actions={
          <Button
            onClick={() => setIsAddOpen(true)}
            disabled={availableTables.length === 0}
          >
            <Plus className="w-5 h-5 mr-2" /> Add Table
          </Button>
        }
        columns={columns}
        isLoading={isLoading}
        perPage={relations.length || 10}
        getRowId={(row) => row.table_id}
      />

      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        closeOutside={false}
      >
        <ProjectTableForm
          tables={availableTables}
          onSubmit={handleAdd}
          onCancel={() => setIsAddOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={editingRelation !== null}
        onClose={() => setEditingRelation(null)}
        closeOutside={false}
      >
        {editingRelation && (
          <ProjectTableForm
            tables={[]}
            relation={editingRelation}
            onSubmit={handleUpdate}
            onCancel={() => setEditingRelation(null)}
          />
        )}
      </Modal>

      <ConfirmDialog />
    </div>
  );
};

export default ProjectDetailPage;
