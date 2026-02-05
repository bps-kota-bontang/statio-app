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
import { CheckCircle, XCircle } from "lucide-react";

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

  const {
    useTables,

    mappingTable,
  } = useTableApi();

  const { toast } = useToast();

  const { data, isLoading, mutate } = useTables(table);

  const handleOpenMapping = useCallback((table: TableList) => {
    setSelectedMappingTable(table);
    setIsMappingModalOpen(true);
  }, []);

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
        key: "is_integrated",
        label: "Integrated",
        render: (row) => {
          const isIntegrated = row.is_integrated;

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
        key: "actions",
        label: "Actions",
        sortable: false,
        render: (row) => (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => handleOpenMapping(row)}>
              Mapping
            </Button>
          </div>
        ),
      },
    ],
    [handleOpenMapping],
  );

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Tables</h1>
      <DataTable
        data={data?.data ?? []}
        meta={data?.meta}
        selectable
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

      {/* Confirm Dialog Commit */}
      <ConfirmDialog />
    </div>
  );
};

export default MappingPage;
