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
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router";
import BulkLabelTableForm from "@/component/tables/BulkLabelTableForm";
import EditTableLabelsForm from "@/component/tables/EditTableForm";
import { CheckCircle, FileIcon, SendIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useOrganizationApi } from "@/service/organization";
import type { StatioContextType } from "@/component/layout/StatioLayout";

const TableOverviewPage = () => {
  const { setBreadcrumbs } = useOutletContext<StatioContextType>();

  useEffect(() => {
    document.title = "Tables | Statio";
    setBreadcrumbs([{ label: "Dashboard", href: "/" }, { label: "Tables" }]);
  }, [setBreadcrumbs]);

  const { user } = useAuth();
  const { addLabelsTables, updateTableLabels, useTableLables, useTables } =
    useTableApi();
  const { useOrganizations } = useOrganizationApi();
  const { data: organizations } = useOrganizations();

  const table = useDataTable<TableList>();
  const { data, isLoading, mutate } = useTables(table);
  const { data: labels } = useTableLables();

  const existingLabels = useMemo(
    () => labels?.data.map((item) => item.name) || [],
    [labels],
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
      ...(user?.roles.includes("admin") || user?.roles.includes("viewer")
        ? [
            {
              key: "organization_id",
              label: "Organization",
              sortable: true,
              filterOptions:
                organizations?.data.map((org) => {
                  return { label: org.name, value: org.id };
                }) || [],
              render: (row: TableList) => row.organization?.name ?? "-",
            },
          ]
        : []),
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
        key: "missing_facts",
        label: "Missing Facts",
        filterOptions: [
          {
            label: "Missing Facts",
            value: String(true),
          },
          {
            label: "No Missing Facts",
            value: String(false),
          },
        ],
        sortable: true,
        filterIncludeEmpty: false,
        render: (row) => {
          const summary = row.insight_facts_summary;
          if (!summary)
            return <span className="text-sm text-gray-500">No data</span>;

          const percentFilled = Math.round(
            (summary.total_filleds / summary.total_expecteds) * 100,
          );

          return (
            <div className="flex flex-col gap-1 w-32">
              {/* Badge Total Missing */}
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-full inline-block ${
                  summary.total_missings === 0
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {summary.total_missings}/{summary.total_expecteds} missing
              </span>

              {/* Progress Bar */}
              <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`absolute top-0 left-0 h-2 rounded-full transition-all ${
                    percentFilled === 100 ? "bg-green-500" : "bg-blue-500"
                  }`}
                  style={{ width: `${percentFilled}%` }}
                />
              </div>

              {/* Optional: percent text */}
              <span className="text-[10px] text-gray-500">
                {percentFilled}% filled ({summary.total_missings} missing)
              </span>
            </div>
          );
        },
      },
      {
        key: "status",
        label: "Status",
        filterOptions: [
          {
            label: "Draft",
            value: "draft",
          },
          {
            label: "Submitted",
            value: "submitted",
          },
          {
            label: "Finalized",
            value: "finalized",
          },
        ],
        filterIncludeEmpty: false,
        render: (row) => {
          const status = row.status;

          const variants = {
            draft: {
              text: "Draft",
              class: "bg-gray-100 text-gray-700 border border-gray-300",
              icon: <FileIcon className="w-3 h-3" />,
            },
            submitted: {
              text: "Submitted",
              class: "bg-blue-100 text-blue-700 border border-blue-300",
              icon: <SendIcon className="w-3 h-3" />,
            },
            finalized: {
              text: "Finalized",
              class: "bg-green-100 text-green-700 border border-green-300",
              icon: <CheckCircle className="w-3 h-3" />,
            },
          };

          const s = variants[status];

          return (
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${s.class}`}
            >
              {s.icon}
              {s.text}
            </span>
          );
        },
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
              Label
            </Button>
          </div>
        ),
      },
    ],
    [existingLabels, openEdit, organizations?.data, user?.roles],
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
