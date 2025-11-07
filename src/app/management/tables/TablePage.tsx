"use client";

import Badge from "@/component/ui/Badge";
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
import { createTable, useTables } from "@/service/table";
import type { CreateTableRequest, TableList } from "@/type/table";
import { Plus } from "lucide-react";
import { useMemo, useCallback, useState } from "react";
import { Link } from "react-router";
import CreateTableForm from "@/app/management/tables/CreateTableForm";
import { getRowNumber } from "@/utils/table";

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
  // const [isEditOpen, setIsEditOpen] = useState(false);
  // const [editingTable, setEditingTable] = useState<Table | null>(null);

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

  // const handleEditTable = async (id: string, data: UpdateTableRequest) => {
  //   try {
  //     await updateTable(id, data);
  //     handleCloseEditModal();
  //     mutate();
  //     return true;
  //   } catch (error) {
  //     console.error(error);
  //     return false;
  //   }
  // };

  // const handleCloseEditModal = () => {
  //   setIsEditOpen(false);
  //   setEditingTable(null);
  // };

  // const openEdit = useCallback((row: Table) => {
  //   setEditingTable(row);
  //   setIsEditOpen(true);
  // }, []);

  const columns = useMemo<Column<TableList>[]>(
    () => [
      { key: "no", label: "No", sortable: true },
      {
        key: "name",
        label: "Name",
        sortable: true,
      },
      {
        key: "indicator_name",
        label: "Indicator",
        filterOptions: existingIndicatorNames,
      },
      {
        key: "indicator_measure",
        label: "Measure",
        filterOptions: existingIndicatorMeasures,
      },
      {
        key: "indicator_unit",
        label: "Unit",
        filterOptions: existingIndicatorUnits,
      },
      {
        key: "dimensions",
        label: "Dimensions",
        filterOptions: existingDimensionNames,
      },
      {
        key: "actions",
        label: "Actions",
        sortable: false,
      },
    ],
    [
      existingDimensionNames,
      existingIndicatorMeasures,
      existingIndicatorNames,
      existingIndicatorUnits,
    ]
  );

  const renderRow = useCallback(
    (row: TableList, index: number) => (
      <tr key={row.id} className="hover:bg-gray-50">
        <td className="px-4 py-2 text-sm">
          {getRowNumber(index, table.page, table.perPage)}
        </td>
        <td className="px-4 py-2 text-sm">{row.name}</td>
        <td className="px-4 py-2 text-sm">{row.indicator.name}</td>
        <td className="px-4 py-2 text-sm">{row.indicator.measure}</td>
        <td className="px-4 py-2 text-sm">{row.indicator.unit ?? "-"}</td>
        <td className="px-4 py-2 text-sm">
          <div className="flex flex-wrap gap-2">
            {row.dimensions.map((dimension, index) => (
              <Badge key={index} label={dimension} />
            ))}
          </div>
        </td>
        <td className="px-4 py-2 text-sm flex gap-2">
          <Link to={`/tables/${row.id}`} target="_blank">
            <Button size="sm">View</Button>
          </Link>
        </td>
      </tr>
    ),
    [table.page, table.perPage]
  );

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Tables</h1>
      <DataTable
        actions={
          <Button onClick={() => setIsCreateOpen(true)} size="sm">
            <Plus className="w-5 h-5 mr-2" />
            New Table
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
        <CreateTableForm
          onSubmit={handleCreateTable}
          onCancel={() => setIsCreateOpen(false)}
        />
      </Modal>

      {/* Modal Edit */}
      {/* <Modal
        isOpen={isEditOpen}
        onClose={handleCloseEditModal}
        closeOutside={false}
      >
        {editingTable && (
          <EditTableForm
            table={editingTable}
            onSubmit={handleEditTable}
            onCancel={handleCloseEditModal}
          />
        )}
      </Modal> */}
    </div>
  );
};

export default TablePage;
