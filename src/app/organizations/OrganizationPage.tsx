"use client";

import DataTable, { type Column } from "@/component/ui/DataTable";
import Modal from "@/component/ui/Modal";
import { useDataTable } from "@/hooks/useDataTable";
import { useOrganizationApi } from "@/service/organization";
import type {
  Organization,
  UpdateOrganizationRequest,
  CreateOrganizationRequest,
} from "@/type/organization";
import { useMemo, useCallback, useState, useEffect } from "react";
import CreateOrganizationForm from "@/component/collection/organizations/CreateOrganizationForm";
import EditOrganizationForm from "@/component/collection/organizations/EditOrganizationForm";
import Button from "@/component/ui/Button";
import { Plus } from "lucide-react";
import type { StatioContextType } from "@/component/layout/StatioLayout";
import { useOutletContext } from "react-router";

const OrganizationPage = () => {
  const { setBreadcrumbs } = useOutletContext<StatioContextType>();

  useEffect(() => {
    document.title = "Organizations | Statio";
    setBreadcrumbs([
      { label: "Dashboard", href: "/" },
      { label: "Organizations" },
    ]);
  }, [setBreadcrumbs]);

  const { useOrganizations, createOrganization, updateOrganization } =
    useOrganizationApi();

  const table = useDataTable<Organization>();

  const { data, isLoading, mutate } = useOrganizations(table);

  // Modal create
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Modal edit
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingOrganization, setEditingOrganization] =
    useState<Organization | null>(null);

  const handleCreateOrganization = async (data: CreateOrganizationRequest) => {
    try {
      await createOrganization(data);
      setIsCreateOpen(false);
      mutate();
      return true;
    } catch (error) {
      console.error("Error creating organization:", error);
      return false;
    }
  };

  const handleEditOrganization = async (
    id: string,
    data: UpdateOrganizationRequest
  ) => {
    try {
      await updateOrganization(id, data);
      handleCloseEditModal();
      mutate();
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const handleCloseEditModal = () => {
    setIsEditOpen(false);
    setEditingOrganization(null);
  };

  const openEdit = useCallback((row: Organization) => {
    setEditingOrganization(row);
    setIsEditOpen(true);
  }, []);

  const columns = useMemo<Column<Organization>[]>(
    () => [
      {
        key: "no",
        label: "No",
        sortable: true,
        render: (_, no) => no, // custom render nomor urut
      },
      {
        key: "name",
        label: "Name",
        sortable: true,
      },
      {
        key: "actions",
        label: "Actions",
        sortable: false,
        render: (row) => (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => openEdit(row)}>
              Edit
            </Button>
          </div>
        ),
      },
    ],
    [openEdit]
  );

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Organizations</h1>
      <DataTable
        actions={
          <Button onClick={() => setIsCreateOpen(true)} size="sm">
            <Plus className="w-5 h-5 mr-2" />
            New Organization
          </Button>
        }
        data={data?.data ?? []}
        meta={data?.meta}
        columns={columns}
        isLoading={isLoading}
        {...table}
      />

      {/* Modal Create */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        closeOutside={false}
      >
        <CreateOrganizationForm
          onSubmit={handleCreateOrganization}
          onCancel={() => setIsCreateOpen(false)}
        />
      </Modal>

      {/* Modal Edit */}
      <Modal
        isOpen={isEditOpen}
        onClose={handleCloseEditModal}
        closeOutside={false}
      >
        {editingOrganization && (
          <EditOrganizationForm
            organization={editingOrganization}
            onSubmit={handleEditOrganization}
            onCancel={handleCloseEditModal}
          />
        )}
      </Modal>
    </div>
  );
};

export default OrganizationPage;
