import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router";
import { FolderOpen, Plus } from "lucide-react";
import Button from "@/component/ui/Button";
import DataTable, { type Column } from "@/component/ui/DataTable";
import Modal from "@/component/ui/Modal";
import CreateProjectForm from "@/component/projects/CreateProjectForm";
import EditProjectForm from "@/component/projects/EditProjectForm";
import { useDataTable } from "@/hooks/useDataTable";
import { useConfirm } from "@/hooks/useConfirm";
import { useProjectApi } from "@/service/project";
import type {
  CreateProjectRequest,
  ProjectList,
  UpdateProjectRequest,
} from "@/type/project";
import type { StatioContextType } from "@/component/layout/StatioLayout";

const ProjectsPage = () => {
  const { setBreadcrumbs } = useOutletContext<StatioContextType>();
  const { useProjects, createProject, updateProject, deleteProject } = useProjectApi();
  const table = useDataTable<ProjectList>();
  const { data, isLoading, mutate } = useProjects(table);
  const { ask, ConfirmDialog } = useConfirm();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectList | null>(null);

  useEffect(() => {
    document.title = "Projects | Statio";
    setBreadcrumbs([
      { label: "Dashboard", href: "/" },
      { label: "Projects" },
    ]);
  }, [setBreadcrumbs]);

  const handleCreate = async (payload: CreateProjectRequest) => {
    try {
      await createProject(payload);
      setIsCreateOpen(false);
      mutate();
      return true;
    } catch (error) {
      console.error("Error creating project:", error);
      return false;
    }
  };

  const handleUpdate = async (payload: UpdateProjectRequest) => {
    if (!editingProject) return false;
    try {
      await updateProject(editingProject.id, payload);
      setEditingProject(null);
      mutate();
      return true;
    } catch (error) {
      console.error("Error updating project:", error);
      return false;
    }
  };

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteProject(id);
      mutate();
    },
    [deleteProject, mutate],
  );

  const columns = useMemo<Column<ProjectList>[]>(
    () => [
      { key: "no", label: "No", sortable: true, render: (_, no) => no },
      { key: "name", label: "Name", sortable: true },
      { key: "table_count", label: "Tables", sortable: false },
      {
        key: "actions",
        label: "Actions",
        sortable: false,
        render: (row) => (
          <div className="flex gap-2">
            <Link to={`/projects/${row.id}`}>
              <Button size="sm">Open</Button>
            </Link>
            <Button size="sm" onClick={() => setEditingProject(row)}>
              Edit
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() =>
                ask({
                  title: "Delete Project?",
                  message: "Project and its links will be deleted. Tables remain safe.",
                  onConfirm: () => handleDelete(row.id),
                })
              }
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [ask, handleDelete],
  );

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <FolderOpen className="w-6 h-6 text-blue-600" />
        <h1 className="text-xl font-semibold">Projects</h1>
      </div>
      <DataTable
        actions={
          <Button onClick={() => setIsCreateOpen(true)} size="sm">
            <Plus className="w-5 h-5 mr-2" />
            New Project
          </Button>
        }
        data={data?.data ?? []}
        meta={data?.meta}
        columns={columns}
        isLoading={isLoading}
        {...table}
      />

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} closeOutside={false}>
        <CreateProjectForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={editingProject !== null}
        onClose={() => setEditingProject(null)}
        closeOutside={false}
      >
        {editingProject && (
          <EditProjectForm
            name={editingProject.name}
            onSubmit={handleUpdate}
            onCancel={() => setEditingProject(null)}
          />
        )}
      </Modal>

      <ConfirmDialog />
    </div>
  );
};

export default ProjectsPage;
