"use client";

import Badge from "@/component/ui/Badge";
import Button from "@/component/ui/Button";
import DataTable, { type Column } from "@/component/ui/DataTable";
import Modal from "@/component/ui/Modal";
import { useDataTable } from "@/hooks/useDataTable";
import type {
  CreateDimensionRequest,
  Dimension,
  UpdateDimensionRequest,
} from "@/type/dimension";
import { useMemo, useCallback, useState } from "react";
import CreateDimensionForm from "@/app/management/dimensions/CreateDimensionForm";
import EditDimensionForm from "@/app/management/dimensions/EditDimensionForm";
import { Plus } from "lucide-react";
import { useDimensionApi } from "@/service/dimension";

export default function DimensionExample() {
  const table = useDataTable<Dimension>();
  const { useDimensions, createDimension, updateDimension } = useDimensionApi();
  const { data, isLoading, mutate } = useDimensions(table);
  // Modal create
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Modal edit
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingDimension, setEditingDimension] = useState<Dimension | null>(
    null
  );

  const handleCreateDimension = async (data: CreateDimensionRequest) => {
    try {
      await createDimension(data);
      setIsCreateOpen(false);
      mutate(); // refresh data
      return true; // beri tahu form bahwa submit sukses
    } catch (error) {
      console.error("Error creating dimension:", error);
      return false; // beri tahu form bahwa submit gagal
    }
  };

  const handleEditDimension = async (
    id: string,
    data: UpdateDimensionRequest
  ) => {
    try {
      await updateDimension(id, data);
      handleCloseEditModal();
      mutate(); // refresh table
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const handleCloseEditModal = useCallback(() => {
    setIsEditOpen(false);
    setEditingDimension(null);
  }, []);

  const openEdit = useCallback((row: Dimension) => {
    setEditingDimension(row);
    setIsEditOpen(true);
  }, []);

  const columns = useMemo<Column<Dimension>[]>(
    () => [
      {
        key: "no",
        label: "No",
        sortable: true,
        render: (_, no) => no,
      },
      {
        key: "name",
        label: "Name",
        sortable: true,
      },
      {
        key: "values",
        label: "Values",
        sortable: false,
        render: (row) => (
          <div className="flex flex-wrap gap-2">
            {row.values.map((value) => (
              <Badge key={value.id} label={value.name} />
            ))}
          </div>
        ),
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
      <h1 className="text-xl font-semibold">Dimensions</h1>

      {/* Data Table */}
      <DataTable
        actions={
          <Button onClick={() => setIsCreateOpen(true)} size="sm">
            <Plus className="w-5 h-5 mr-2" />
            New Dimension
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
        <CreateDimensionForm
          onSubmit={handleCreateDimension}
          onCancel={() => setIsCreateOpen(false)}
        />
      </Modal>

      {/* Modal Edit */}
      <Modal
        isOpen={isEditOpen}
        onClose={handleCloseEditModal}
        closeOutside={false}
      >
        {editingDimension && (
          <EditDimensionForm
            dimension={editingDimension}
            onSubmit={handleEditDimension}
            onCancel={handleCloseEditModal}
          />
        )}
      </Modal>
    </div>
  );
}
