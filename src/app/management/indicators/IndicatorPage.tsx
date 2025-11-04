"use client";

import DataTable, { type Column } from "@/component/ui/DataTable";
import Modal from "@/component/ui/Modal";
import { useDataTable } from "@/hooks/useDataTable";
import {
  createIndicator,
  updateIndicator,
  useIndicatorMeasures,
  useIndicators,
  useIndicatorUnits,
} from "@/service/indicator";
import type {
  Indicator,
  UpdateIndicatorRequest,
  CreateIndicatorRequest,
} from "@/type/indicator";
import { useMemo, useCallback, useState } from "react";
import CreateIndicatorForm from "@/app/management/indicators/CreateIndicatorForm";
import EditIndicatorForm from "@/app/management/indicators/EditIndicatorForm";
import Button from "@/component/ui/Button";
import { Plus } from "lucide-react";

export default function IndicatorExample() {
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
      { key: "no", label: "No", sortable: true },
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
      },
      {
        key: "actions",
        label: "Actions",
        sortable: false,
      },
    ],
    [existingIndicatorMeasures, existingIndicatorUnits]
  );

  const renderRow = useCallback(
    (row: Indicator, index: number) => (
      <tr key={row.id} className="hover:bg-gray-50">
        <td className="px-4 py-2 text-sm">{index + 1}</td>
        <td className="px-4 py-2 text-sm">{row.name}</td>
        <td className="px-4 py-2 text-sm">{row.measure}</td>
        <td className="px-4 py-2 text-sm">{row.unit || "-"}</td>
        <td className="px-4 py-2 text-sm flex gap-2">
          <Button size="sm" onClick={() => openEdit(row)}>
            Edit
          </Button>
        </td>
      </tr>
    ),
    [openEdit]
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
        renderRow={renderRow}
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
}
