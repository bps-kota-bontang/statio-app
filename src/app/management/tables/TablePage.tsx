"use client";

import Button from "@/component/ui/Button";
import DataTable, { type Column } from "@/component/ui/DataTable";
import Modal from "@/component/ui/Modal";
import { useDataTable } from "@/hooks/useDataTable";
import { useDimensionNames } from "@/service/dimension";
import {
  useIndicatorMeasures,
  useIndicatorNames,
  useIndicatorUnits,
} from "@/service/indicator";
import { createTable, updateTable, useTables } from "@/service/table";
import type {
  CreateTableRequest,
  TableList,
  UpdateTableRequest,
} from "@/type/table";
import { Plus } from "lucide-react";
import { useMemo, useCallback, useState } from "react";
import CreateTableForm from "@/app/management/tables/CreateTableForm";
import EditTableForm from "./EditIndicatorForm";
import Badge from "@/component/ui/Badge";
import { Link } from "react-router";

const TablePage = () => {
  const table = useDataTable<TableList>();

  const { data, isLoading, mutate } = useTables(table);

  const { data: dimensions } = useDimensionNames();
  const existingDimensionNames = useMemo(
    () => dimensions?.data.map((dim) => dim.name) || [],
    [dimensions]
  );

  const { data: names } = useIndicatorNames();

  const existingIndicatorNames = useMemo(
    () => names?.data.map((dim) => dim.name) || [],
    [names]
  );

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

  // // Modal create
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // // Modal edit
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTableID, setEditingTableID] = useState<string | null>(null);

  const handleCreateTable = async (data: CreateTableRequest) => {
    try {
      await createTable(data);
      setIsCreateOpen(false);
      mutate();
      return true;
    } catch (error) {
      console.error("Error creating table:", error);
      return false;
    }
  };

  const handleEditTable = async (id: string, data: UpdateTableRequest) => {
    try {
      await updateTable(id, data);
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
    setEditingTableID(null);
  };

  const openEdit = useCallback((id: string) => {
    setEditingTableID(id);
    setIsEditOpen(true);
  }, []);

  const columns = useMemo<Column<TableList>[]>(
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
        key: "indicator_name",
        label: "Indicator",
        filterOptions: existingIndicatorNames,
        render: (row) => row.indicator.name,
      },
      {
        key: "indicator_measure",
        label: "Measure",
        filterOptions: existingIndicatorMeasures,
        render: (row) => row.indicator.measure,
      },
      {
        key: "indicator_unit",
        label: "Unit",
        filterOptions: existingIndicatorUnits,
        render: (row) => row.indicator.unit ?? "-",
      },
      {
        key: "dimensions",
        label: "Dimensions",
        filterOptions: existingDimensionNames,
        render: (row) => (
          <div className="flex flex-wrap gap-2">
            {row.dimensions.map((dimension, index) => (
              <Badge key={index} label={dimension} />
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
            <Link to={`/tables/${row.id}`} target="_blank">
              <Button size="sm">View</Button>
            </Link>
            <Button size="sm" onClick={() => openEdit(row.id)}>
              Edit
            </Button>
          </div>
        ),
      },
    ],
    [
      existingDimensionNames,
      existingIndicatorMeasures,
      existingIndicatorNames,
      existingIndicatorUnits,
      openEdit,
    ]
  );

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Tables</h1>
      <DataTable
        selectable
        actions={
          <Button onClick={() => setIsCreateOpen(true)} size="sm">
            <Plus className="w-5 h-5 mr-2" />
            New Table
          </Button>
        }
        data={data?.data ?? []}
        meta={data?.meta}
        columns={columns}
        isLoading={isLoading}
        onSelectionChange={(selectedIDs) => {
          console.log(selectedIDs);
        }}
        {...table}
      />

      {/* Modal Create */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        closeOutside={false}
      >
        <CreateTableForm
          onSubmit={handleCreateTable}
          onCancel={() => setIsCreateOpen(false)}
        />
      </Modal>

      {/* Modal Edit */}
      <Modal
        isOpen={isEditOpen}
        onClose={handleCloseEditModal}
        closeOutside={false}
      >
        {editingTableID && (
          <EditTableForm
            tableID={editingTableID}
            onSubmit={handleEditTable}
            onCancel={handleCloseEditModal}
          />
        )}
      </Modal>
    </div>
  );
};

export default TablePage;
