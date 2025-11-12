"use client";

import DataTable, { type Column } from "@/component/ui/DataTable";
import Modal from "@/component/ui/Modal";
import { useDataTable } from "@/hooks/useDataTable";
import { useIndicatorApi } from "@/service/indicator";
import type {
  Indicator,
  UpdateIndicatorRequest,
  CreateIndicatorRequest,
} from "@/type/indicator";
import { useMemo, useCallback, useState } from "react";
import CreateIndicatorForm from "@/component/management/indicators/CreateIndicatorForm";
import EditIndicatorForm from "@/component/management/indicators/EditIndicatorForm";
import Button from "@/component/ui/Button";
import { Plus } from "lucide-react";

const IndicatorPage = () => {
  const {
    createIndicator,
    updateIndicator,
    useIndicatorMeasures,
    useIndicators,
    useIndicatorUnits,
  } = useIndicatorApi();

  const table = useDataTable<Indicator>(["measure", "unit"]);

  const { data: measures } = useIndicatorMeasures();

  const existingIndicatorMeasures = useMemo(
    () => measures?.data.map((dim) => dim.measure) || [],
    [measures]
  );

  const { data: units } = useIndicatorUnits();

  const existingIndicatorUnits = useMemo(
    () => units?.data.map((unit) => unit.unit) || [],
    [units]
  );

  const { data, isLoading, mutate } = useIndicators(table);

  // Modal create
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Modal edit
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingIndicator, setEditingIndicator] = useState<Indicator | null>(
    null
  );

  const handleCreateIndicator = async (data: CreateIndicatorRequest) => {
    try {
      await createIndicator(data);
      setIsCreateOpen(false);
      mutate();
      return true;
    } catch (error) {
      console.error("Error creating indicator:", error);
      return false;
    }
  };

  const handleEditIndicator = async (
    id: string,
    data: UpdateIndicatorRequest
  ) => {
    try {
      await updateIndicator(id, data);
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
    setEditingIndicator(null);
  };

  const openEdit = useCallback((row: Indicator) => {
    setEditingIndicator(row);
    setIsEditOpen(true);
  }, []);

  const columns = useMemo<Column<Indicator>[]>(
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
        key: "measure",
        label: "Measure",
        sortable: true,
        filterOptions: existingIndicatorMeasures,
      },
      {
        key: "unit",
        label: "Unit",
        sortable: true,
        filterOptions: existingIndicatorUnits,
        render: (row) => row.unit || "-",
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
    [existingIndicatorMeasures, existingIndicatorUnits, openEdit]
  );

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Indicators</h1>
      <DataTable
        actions={
          <Button onClick={() => setIsCreateOpen(true)} size="sm">
            <Plus className="w-5 h-5 mr-2" />
            New Indicator
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
        <CreateIndicatorForm
          onSubmit={handleCreateIndicator}
          onCancel={() => setIsCreateOpen(false)}
        />
      </Modal>

      {/* Modal Edit */}
      <Modal
        isOpen={isEditOpen}
        onClose={handleCloseEditModal}
        closeOutside={false}
      >
        {editingIndicator && (
          <EditIndicatorForm
            indicator={editingIndicator}
            onSubmit={handleEditIndicator}
            onCancel={handleCloseEditModal}
          />
        )}
      </Modal>
    </div>
  );
};

export default IndicatorPage;
