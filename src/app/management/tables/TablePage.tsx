"use client";

import Button from "@/component/ui/Button";
import DataTable, { type Column } from "@/component/ui/DataTable";
import Modal from "@/component/ui/Modal";
import { useDataTable } from "@/hooks/useDataTable";
import { useDimensionApi } from "@/service/dimension";
import type {
  AssignOrganizationRequest,
  CreateTableRequest,
  TableList,
  UpdateTableRequest,
} from "@/type/table";
import { Plus } from "lucide-react";
import { useMemo, useCallback, useState } from "react";
import CreateTableForm from "@/component/management/tables/CreateTableForm";
import EditTableForm from "@/component/management/tables/EditTableForm";
import Badge from "@/component/ui/Badge";
import { Link } from "react-router";

import AssignOrganizationForm from "@/component/management/tables/AssignOrganizationForm";
import { useTableApi } from "@/service/table";
import { useIndicatorApi } from "@/service/indicator";
import { useOrganizationApi } from "@/service/organization";

const TablePage = () => {
  const { useDimensionNames } = useDimensionApi();
  const table = useDataTable<TableList>();

  const { useTables } = useTableApi();
  const { useIndicatorNames, useIndicatorMeasures, useIndicatorUnits } =
    useIndicatorApi();
  const { createTable, updateTable } = useTableApi();
  const { useOrganizations, assignTablesToOrganization } = useOrganizationApi();

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
  const { data: organizations } = useOrganizations();

  const existingIndicatorUnits = useMemo(
    () => units?.data.map((unit) => unit.unit) || [],
    [units]
  );

  // // Modal create
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // // Modal edit
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTableID, setEditingTableID] = useState<string | null>(null);

  // // Modal assign organization
  const [isAssignOpen, setIsAssignOpen] = useState(false);

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
      console.error("Error updating table:", error);
      return false;
    }
  };

  const handleAssignOrganization = async (data: AssignOrganizationRequest) => {
    try {
      await assignTablesToOrganization(data.organization_id, table.selectedIDs);
      setIsAssignOpen(false);
      mutate();
      return true;
    } catch (error) {
      console.error("Error assigning organization:", error);
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
        render: (row) => row.indicator?.name,
      },
      {
        key: "organization_id",
        label: "Organization",
        filterOptions:
          organizations?.data.map((org) => {
            return { label: org.name, value: org.id };
          }) || [],
        render: (row) => row.organization?.name ?? "-",
      },
      {
        key: "indicator_measure",
        label: "Measure",
        filterOptions: existingIndicatorMeasures,
        render: (row) => row.indicator?.measure,
      },
      {
        key: "indicator_unit",
        label: "Unit",
        filterOptions: existingIndicatorUnits,
        render: (row) => row.indicator?.unit ?? "-",
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
      organizations?.data,
    ]
  );

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Tables</h1>
      <DataTable
        selectable
        actions={
          <div className="flex gap-2">
            <Button onClick={() => setIsCreateOpen(true)} size="sm">
              <Plus className="w-5 h-5 mr-2" />
              New Table
            </Button>

            {table.selectedIDs.length > 0 && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setIsAssignOpen(true)}
              >
                Assign Organization
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

      {/* Modal Assign Organization */}
      <Modal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        closeOutside={false}
      >
        <AssignOrganizationForm
          onCancel={() => setIsAssignOpen(false)}
          onSubmit={handleAssignOrganization}
        />
      </Modal>
    </div>
  );
};

export default TablePage;
