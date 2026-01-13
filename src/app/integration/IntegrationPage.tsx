"use client";

import Button from "@/component/ui/Button";
import DataTable, { type Column } from "@/component/ui/DataTable";
import { useDataTable } from "@/hooks/useDataTable";
import type { TableList } from "@/type/table";
import { useMemo, useEffect, useState, useCallback } from "react";
import { useOutletContext } from "react-router";
import { useTableApi } from "@/service/table";
import { useToast } from "@/hooks/use-toast";
import type { StatioContextType } from "@/component/layout/StatioLayout";
import ExportTableModal from "@/component/integration/tables/ExportTableModal";
import GenerateTableModal from "@/component/integration/tables/GenerateTableModal";
import { useConfirm } from "@/hooks/useConfirm";
import { CheckCircle, FileIcon, SendIcon } from "lucide-react";

const IntegrationPage = () => {
  const { setBreadcrumbs } = useOutletContext<StatioContextType>();
  const { ask, ConfirmDialog } = useConfirm();

  useEffect(() => {
    document.title = "Integration Tables | Statio";
    setBreadcrumbs([
      { label: "Dashboard", href: "/" },
      { label: "Integration", highlight: false },
      { label: "Tables" },
    ]);
  }, [setBreadcrumbs]);

  const table = useDataTable<TableList>();
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [showDimensionSelect, setShowDimensionSelect] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [availableDimensions, setAvailableDimensions] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [selectedDimensionIds, setSelectedDimensionIds] = useState<string[]>(
    []
  );
  const [selectedTableForExport, setSelectedTableForExport] = useState<
    string | null
  >(null);
  const [selectedTableName, setSelectedTableName] = useState<string>("");
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [currentTableId, setCurrentTableId] = useState<string | null>(null);

  const {
    useTables,
    generateParentTable,
    exportTable,
    commitTable,
    commitTables,
  } = useTableApi();
  const { toast } = useToast();

  const { data, isLoading, mutate } = useTables(table);

  const handleGenerateParent = useCallback((row: TableList) => {
    // Filter dimensions that have parent from TableList
    const dimensionsWithParent = row.dimensions.filter(
      (dim) => dim.has_parent_dimension
    );

    // Show dimension selection dialog
    const dims = dimensionsWithParent.map((dim) => ({
      id: dim.id,
      name: dim.name,
    }));
    setAvailableDimensions(dims);
    setSelectedDimensionIds(dims.map((d) => d.id)); // Select all by default
    setCurrentTableId(row.id);
    setShowDimensionSelect(true);
  }, []);

  const handleConfirmGenerate = useCallback(async () => {
    if (!currentTableId || selectedDimensionIds.length === 0) return;

    try {
      setGeneratingId(currentTableId);
      setShowDimensionSelect(false);

      const response = await generateParentTable(
        currentTableId,
        selectedDimensionIds
      );

      if (response.data) {
        toast({
          title: "Success",
          description: `Parent table has been generated`,
        });

        mutate();
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to generate parent table",
        variant: "destructive",
      });
    } finally {
      setGeneratingId(null);
    }
  }, [
    currentTableId,
    selectedDimensionIds,
    generateParentTable,
    toast,
    mutate,
  ]);

  const handleExportTable = useCallback(
    async (tableId: string, tableName: string) => {
      // Get year range - default to last 5 years including current year
      const years: number[] = [];
      const currentYear = new Date().getFullYear();
      const defaultFromYear = currentYear - 4;
      const defaultToYear = currentYear;

      // Generate years array
      for (let year = defaultFromYear; year <= defaultToYear; year++) {
        years.push(year);
      }

      setSelectedTableForExport(tableId);
      setSelectedTableName(tableName);
      setAvailableYears(years.sort((a, b) => b - a)); // Sort descending
      setIsExportModalOpen(true);
    },
    []
  );

  const handleCommitTable = useCallback(
    async (tableID: string) => {
      await commitTable(tableID);
      mutate();
    },
    [commitTable, mutate]
  );

  const handleCommitTables = useCallback(
    async (tableIDs: string[]) => {
      await commitTables(tableIDs);
      mutate();
    },
    [commitTables, mutate]
  );

  const handleConfirmExport = useCallback(
    async (years: string[], format: "xlsx" | "xls") => {
      if (!selectedTableForExport || years.length === 0) return;

      try {
        await exportTable(selectedTableForExport, years, format);
        setIsExportModalOpen(false);
        setSelectedTableForExport(null);
      } catch (error) {
        console.error("Export failed:", error);
        alert("Export failed. Please try again.");
      }
    },
    [selectedTableForExport, exportTable]
  );

  const toggleDimension = useCallback((dimensionId: string) => {
    setSelectedDimensionIds((prev) =>
      prev.includes(dimensionId)
        ? prev.filter((id) => id !== dimensionId)
        : [...prev, dimensionId]
    );
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
            {row.status == "finalized" && (
              <Button
                size="sm"
                onClick={() =>
                  ask({
                    title: "Commit Table?",
                    message: "Are you sure want to commit this table?",
                    onConfirm: () => handleCommitTable(row.id),
                  })
                }
              >
                Commit
              </Button>
            )}
            {row.has_parent_dimension && (
              <Button
                size="sm"
                onClick={() => handleGenerateParent(row)}
                disabled={generatingId === row.id}
              >
                {generatingId === row.id ? "Generating..." : "Generate"}
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => handleExportTable(row.id, row.name)}
            >
              Export
            </Button>
          </div>
        ),
      },
    ],
    [
      ask,
      generatingId,
      handleCommitTable,
      handleExportTable,
      handleGenerateParent,
    ]
  );

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Tables</h1>
      <DataTable
        data={data?.data ?? []}
        meta={data?.meta}
        selectable
        actions={
          <div className="flex gap-2">
            {table.selectedIDs.length > 0 && (
              <Button
                size="sm"
                onClick={() =>
                  ask({
                    title: "Commit Selected Tables?",
                    message: `Are you sure want to commit ${table.selectedIDs.length} selected tables?`,
                    onConfirm: () =>
                      handleCommitTables(
                        table.selectedIDs.map((t) => String(t))
                      ),
                  })
                }
              >
                Bulk Commit
              </Button>
            )}
          </div>
        }
        columns={columns}
        isLoading={isLoading}
        {...table}
      />

      <GenerateTableModal
        isOpen={showDimensionSelect}
        dimensions={availableDimensions}
        selectedDimensionIds={selectedDimensionIds}
        onToggleDimension={toggleDimension}
        onConfirm={handleConfirmGenerate}
        onCancel={() => {
          setShowDimensionSelect(false);
          setCurrentTableId(null);
        }}
      />

      {/* Export Year Selection Modal */}
      <ExportTableModal
        isOpen={isExportModalOpen}
        tableName={selectedTableName}
        availableYears={availableYears}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleConfirmExport}
      />

      {/* Confirm Dialog Commit */}
      <ConfirmDialog />
    </div>
  );
};

export default IntegrationPage;
