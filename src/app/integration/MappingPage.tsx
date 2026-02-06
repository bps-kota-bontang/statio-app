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
import MappingModal, {
  type MappingFormData,
} from "@/component/integration/tables/MappingModal";
import { useConfirm } from "@/hooks/useConfirm";
import { Link } from "react-router";
import Switch from "@/component/ui/Switch";
import DownloadTableModal from "@/component/tables/DownloadTableModal";
import Badge from "@/component/ui/Badge";
import { ArrowLeftRight, CheckCircle, XCircle } from "lucide-react";

const MappingPage = () => {
  const { setBreadcrumbs } = useOutletContext<StatioContextType>();
  const { ConfirmDialog } = useConfirm();

  useEffect(() => {
    document.title = "Integration Mapping | Statio";
    setBreadcrumbs([
      { label: "Dashboard", href: "/" },
      { label: "Integration", highlight: false },
      { label: "Mapping" },
    ]);
  }, [setBreadcrumbs]);

  const table = useDataTable<TableList>();
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  const [selectedMappingTable, setSelectedMappingTable] =
    useState<TableList | null>(null);

  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [selectedTableForDownload, setSelectedTableForDownload] = useState<
    string | null
  >(null);
  const [selectedTableName, setSelectedTableName] = useState<string>("");
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  const {
    useTables,
    updateTableIntegrated,
    mappingTable,
    downloadTable,
    swapTableDimension,
  } = useTableApi();

  const { toast } = useToast();

  const { data, isLoading, mutate } = useTables(table);

  const handleConfirmDownload = useCallback(
    async (years: string[], format: "xlsx" | "xls") => {
      if (!selectedTableForDownload || years.length === 0) return;

      try {
        await downloadTable(selectedTableForDownload, years, format);
        setIsDownloadModalOpen(false);
        setSelectedTableForDownload(null);
      } catch (error) {
        console.error("Download failed:", error);
        alert("Download failed. Please try again.");
      }
    },
    [selectedTableForDownload, downloadTable],
  );

  const handleDownloadTable = useCallback(
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

      setSelectedTableForDownload(tableId);
      setSelectedTableName(tableName);
      setAvailableYears(years.sort((a, b) => b - a)); // Sort descending
      setIsDownloadModalOpen(true);
    },
    [],
  );

  const handleOpenMapping = useCallback((table: TableList) => {
    setSelectedMappingTable(table);
    setIsMappingModalOpen(true);
  }, []);

  const handleSwapDimensions = useCallback(
    async (tableId: string) => {
      try {
        await swapTableDimension(tableId);
        toast({
          title: "Success",
          description: "Table dimensions swapped successfully",
        });
        mutate();
      } catch (error) {
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to swap table dimensions",
          variant: "destructive",
        });
      }
    },
    [swapTableDimension, toast, mutate],
  );

  const handleSubmitMapping = useCallback(
    async (data: MappingFormData) => {
      if (!selectedMappingTable) return;

      try {
        await mappingTable(selectedMappingTable.id, {
          website_table_id: data.websiteTableId || null,
          website_subject_id: data.websiteSubjectId || null,
          website_link: data.websiteLink || null,
        });

        toast({
          title: "Success",
          description: "Table mapping has been saved successfully",
        });

        setIsMappingModalOpen(false);
        setSelectedMappingTable(null);
        mutate();
      } catch (error) {
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to save table mapping",
          variant: "destructive",
        });
      }
    },
    [selectedMappingTable, mappingTable, toast, mutate],
  );

  const handleToggleIntegrated = useCallback(
    async (tableId: string, currentValue: boolean) => {
      try {
        await updateTableIntegrated(tableId, !currentValue);
        toast({
          title: "Success",
          description: "Integration status updated successfully",
        });
        mutate();
      } catch (error) {
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to update integration status",
          variant: "destructive",
        });
      }
    },
    [updateTableIntegrated, toast, mutate],
  );

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
        key: "direction",
        label: "Dimensions",
        filterOptions: [
          {
            label: "0 Dimension",
            value: "0",
          },
          {
            label: "1 Dimension",
            value: "1",
          },
          {
            label: "2 Dimensions",
            value: "2",
          },
        ],
        filterIncludeEmpty: false,
        render: (row) => (
          <div className="flex flex-wrap gap-2 items-center">
            {row.dimensions.length > 0 ? (
              <>
                {row.dimensions.map((dimension, index) => {
                  return <Badge key={index} label={dimension.name} />;
                })}

                {row.dimensions.length > 1 && (
                  <span
                    className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer hover:bg-gray-100 p-1 rounded-full"
                    title="Swap Dimensions"
                  >
                    <ArrowLeftRight
                      className="w-4 h-4"
                      onClick={() => handleSwapDimensions(row.id)}
                    />
                  </span>
                )}
              </>
            ) : (
              <span className="text-sm text-gray-500">No dimensions</span>
            )}
          </div>
        ),
      },
      {
        key: "website_table_id",
        label: "Website Table ID",
        render: (row) => {
          return <p className="text-center">{row.website_table_id || "-"}</p>;
        },
      },
      {
        key: "website_subject_id",
        label: "Website Subject ID",
        render: (row) => {
          return <p className="text-center">{row.website_subject_id || "-"}</p>;
        },
      },
      {
        key: "website_link",
        label: "Website Link",
        render: (row) =>
          row.website_link ? (
            <a
              href={row.website_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              {row.website_link}
            </a>
          ) : (
            "-"
          ),
      },
      {
        key: "can_integrate",
        label: "Integratable",
        filterOptions: [
          { label: "Yes", value: "true" },
          { label: "No", value: "false" },
        ],
        filterIncludeEmpty: false,
        render: (row) => {
          const isIntegrated = row.can_integrate;

          const variants = {
            true: {
              text: "Yes",
              class: "bg-green-100 text-green-700 border border-green-300",
              icon: <CheckCircle className="w-3 h-3" />,
            },
            false: {
              text: "No",
              class: "bg-red-100 text-red-700 border border-red-300",
              icon: <XCircle className="w-3 h-3" />,
            },
          };

          const s = variants[String(isIntegrated) as "true" | "false"];

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
        key: "is_integrated",
        filterOptions: [
          { label: "Integrated", value: "true" },
          { label: "Not Integrated", value: "false" },
        ],
        filterIncludeEmpty: false,
        label: "Integrated",
        render: (row) => (
          <Switch
            checked={row.is_integrated}
            onChange={() => handleToggleIntegrated(row.id, row.is_integrated)}
          />
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
            <Button size="sm" onClick={() => handleOpenMapping(row)}>
              Mapping
            </Button>
            <Button
              size="sm"
              onClick={() => handleDownloadTable(row.id, row.name)}
            >
              Download
            </Button>
          </div>
        ),
      },
    ],
    [
      handleDownloadTable,
      handleOpenMapping,
      handleSwapDimensions,
      handleToggleIntegrated,
    ],
  );

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Tables</h1>
      <DataTable
        data={data?.data ?? []}
        meta={data?.meta}
        columns={columns}
        isLoading={isLoading}
        {...table}
      />

      {/* Mapping Modal */}
      <MappingModal
        isOpen={isMappingModalOpen}
        table={selectedMappingTable}
        onClose={() => {
          setIsMappingModalOpen(false);
          setSelectedMappingTable(null);
        }}
        onSubmit={handleSubmitMapping}
      />

      {/* Download Year Selection Modal */}
      <DownloadTableModal
        isOpen={isDownloadModalOpen}
        tableName={selectedTableName}
        availableYears={availableYears}
        onClose={() => setIsDownloadModalOpen(false)}
        onDownload={handleConfirmDownload}
      />

      {/* Confirm Dialog Commit */}
      <ConfirmDialog />
    </div>
  );
};

export default MappingPage;
