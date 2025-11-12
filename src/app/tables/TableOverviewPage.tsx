"use client";

import Badge from "@/component/ui/Badge";
import Button from "@/component/ui/Button";
import DataTable, { type Column } from "@/component/ui/DataTable";
import Modal from "@/component/ui/Modal";
import { useDataTable } from "@/hooks/useDataTable";
import { useTableApi } from "@/service/table";
import type {
  BulkLabelsTablesRequest,
  TableList,
  UpdateTableLabelRequest,
} from "@/type/table";
import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router";
import BulkLabelTableForm from "@/component/tables/BulkLabelTableForm";
import EditTableLabelsForm from "../../component/tables/EditTableForm";

const TableOverviewPage = () => {
  const { addLabelsTables, updateTableLabels, useTableLables, useTables } =
    useTableApi();

  const table = useDataTable<TableList>();
  const { data, isLoading, mutate } = useTables(table);
  const { data: labels } = useTableLables();

  const existingLabels = useMemo(
    () => labels?.data.map((item) => item.name) || [],
    [labels]
  );

  // // Modal bulk label table
  const [isBulkLabelOpen, setIsBulkLabelOpen] = useState(false);

  // Modal edit
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<TableList | null>(null);

  const handleBulkLabelTable = async (data: BulkLabelsTablesRequest) => {
    try {
      await addLabelsTables({
        labels: data.labels,
        table_ids: table.selectedIDs.map(String),
      });
      setIsBulkLabelOpen(false);
      mutate();
      return true;
    } catch (error) {
      console.error("Error assigning organization:", error);
      return false;
    }
  };

  const handleEditTable = async (id: string, data: UpdateTableLabelRequest) => {
    try {
      await updateTableLabels(id, data);
      handleCloseEditModal();
      mutate(); // refresh table
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const handleCloseEditModal = () => {
    setIsEditOpen(false);
    setEditingTable(null);
  };

  const openEdit = useCallback((row: TableList) => {
    setEditingTable(row);
    setIsEditOpen(true);
  }, []);

  const columns = useMemo<Column<TableList>[]>(
    () => [
      {
        key: "no",
        label: "No",
        render: (_, no) => no,
      },
      {
        key: "name",
        label: "Name",
        sortable: true,
      },
      {
        key: "labels",
        label: "Labels",
        filterOptions: existingLabels,
        render: (row) => (
          <div className="flex flex-wrap gap-1">
            {row.labels && row.labels.length > 0 ? (
              row.labels.map((label) => <Badge key={label} label={label} />)
            ) : (
              <span className="text-sm text-gray-500">No labels</span>
            )}
          </div>
        ),
      },
      {
        key: "status",
        label: "Status",
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
            <Button size="sm" onClick={() => openEdit(row)}>
              Edit
            </Button>
          </div>
        ),
      },
    ],
    [existingLabels, openEdit]
  );

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Tables</h1>
      <DataTable
        selectable
        actions={
          <div className="flex gap-2">
            {table.selectedIDs.length > 0 && (
              <Button size="sm" onClick={() => setIsBulkLabelOpen(true)}>
                New Label
              </Button>
            )}
          </div>
        }
        data={data?.data ?? []}
        meta={data?.meta}
        columns={columns}
        isLoading={isLoading}
        {...table}
      />

      {/* Modal Edit */}
      <Modal
        isOpen={isEditOpen}
        onClose={handleCloseEditModal}
        closeOutside={false}
      >
        {editingTable && (
          <EditTableLabelsForm
            table={editingTable}
            onSubmit={handleEditTable}
            onCancel={handleCloseEditModal}
          />
        )}
      </Modal>

      {/* Modal Bulk Label Table */}
      <Modal
        isOpen={isBulkLabelOpen}
        onClose={() => setIsBulkLabelOpen(false)}
        closeOutside={false}
      >
        <BulkLabelTableForm
          onCancel={() => setIsBulkLabelOpen(false)}
          onSubmit={handleBulkLabelTable}
        />
      </Modal>
    </div>
  );
};

export default TableOverviewPage;
