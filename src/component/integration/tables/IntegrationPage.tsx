"use client";

import Button from "@/component/ui/Button";
import DataTable, { type Column } from "@/component/ui/DataTable";
import { useDataTable } from "@/hooks/useDataTable";
import type { TableList } from "@/type/table";
import { useMemo, useEffect, useState, useCallback } from "react";
import { useOutletContext } from "react-router";
import { useTableApi } from "@/service/table";
import { useToast } from "@/hooks/use-toast";
import DimensionSelectionModal from "./DimensionSelectionModal";
import type { StatioContextType } from "@/component/layout/StatioLayout";

const IntegrationPage = () => {
  const { setBreadcrumbs } = useOutletContext<StatioContextType>();

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
  const [availableDimensions, setAvailableDimensions] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [selectedDimensionIds, setSelectedDimensionIds] = useState<string[]>(
    []
  );
  const [currentTableId, setCurrentTableId] = useState<string | null>(null);

  const { useTables, generateParentTable } = useTableApi();
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
        key: "actions",
        label: "Actions",
        sortable: false,
        render: (row) => (
          <div className="flex gap-2">
            {row.has_parent_dimension && (
              <Button
                size="sm"
                onClick={() => handleGenerateParent(row)}
                disabled={generatingId === row.id}
              >
                {generatingId === row.id ? "Generating..." : "Generate"}
              </Button>
            )}
          </div>
        ),
      },
    ],
    [generatingId, handleGenerateParent]
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

      <DimensionSelectionModal
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
    </div>
  );
};

export default IntegrationPage;
