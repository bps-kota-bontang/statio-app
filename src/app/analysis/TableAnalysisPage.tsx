"use client";

import Button from "@/component/ui/Button";
import DataTable, { type Column } from "@/component/ui/DataTable";
import { useDataTable } from "@/hooks/useDataTable";
import { useTableApi } from "@/service/table";
import type { TableList } from "@/type/table";
import { useCallback, useEffect, useMemo } from "react";
import { Link, useOutletContext } from "react-router";
import {
  AlertTriangle,
  CheckCircle,
  FileIcon,
  History,
  SendIcon,
} from "lucide-react";
import { useOrganizationApi } from "@/service/organization";
import type { StatioContextType } from "@/component/layout/StatioLayout";

const TableAnalysis = () => {
  const { setBreadcrumbs } = useOutletContext<StatioContextType>();

  useEffect(() => {
    setBreadcrumbs([{ label: "Dashboard", href: "/" }, { label: "Analysis" }]);
  }, [setBreadcrumbs]);

  const { useTables, analyzeTable, analyzeTables } = useTableApi();
  const { useOrganizations } = useOrganizationApi();
  const { data: organizations } = useOrganizations();

  const table = useDataTable<TableList>();
  const { data, isLoading, mutate } = useTables(table);

  const handleAnalyzeTable = useCallback(
    async (tableID: string) => {
      try {
        await analyzeTable(tableID);
        mutate();
      } catch (error) {
        console.error("Error analyzing table:", error);
      }
    },
    [analyzeTable, mutate]
  );

  const handleAnalyzeTables = useCallback(
    async (tableIDs: string[]) => {
      try {
        await analyzeTables(tableIDs);
        mutate();
      } catch (error) {
        console.error("Error analyzing tables:", error);
      }
    },
    [analyzeTables, mutate]
  );

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
        key: "organization_id",
        label: "Organization",
        sortable: true,
        filterOptions:
          organizations?.data.map((org) => {
            return { label: org.name, value: org.id };
          }) || [],
        render: (row: TableList) => row.organization?.name ?? "-",
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
            (summary.total_filleds / summary.total_expecteds) * 100
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
        key: "outlier_facts",
        label: "Outlier Facts",
        sortable: true,
        filterOptions: [
          {
            label: "Outlier Facts",
            value: String(true),
          },
          {
            label: "No Outlier Facts",
            value: String(false),
          },
        ],
        filterIncludeEmpty: false,
        render: (row: TableList) => {
          const summary = row.insight_facts_summary;

          if (!summary) {
            return <span className="text-sm text-gray-500">No data</span>;
          }

          const totalOutliers = summary.total_outliers;
          const totalExpected = row.insight_facts_summary?.total_expecteds || 0;

          const ratio =
            totalExpected > 0 ? (totalOutliers / totalExpected) * 100 : 0;

          const variant =
            totalOutliers === 0
              ? {
                  badgeClass:
                    "bg-green-100 text-green-800 border border-green-200",
                  barClass: "bg-green-500",
                  textClass: "text-[10px] text-green-700",
                  note: "All values are within normal range",
                }
              : {
                  badgeClass: "bg-red-100 text-red-800 border border-red-200",
                  barClass: "bg-red-500",
                  textClass: "text-[10px] text-red-700",
                  note: `${ratio.toFixed(1)}% identified as outliers`,
                };

          return (
            <div className="flex flex-col gap-1 w-32">
              {/* Badge utama */}
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${variant.badgeClass}`}
              >
                <AlertTriangle className="w-3 h-3" />
                {totalOutliers}/{totalExpected} outliers
              </span>

              {/* Progress Bar */}
              <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`absolute top-0 left-0 h-2 rounded-full ${variant.barClass}`}
                  style={{ width: `${ratio}%` }}
                />
              </div>

              {/* Detail kecil */}
              <span className={variant.textClass}>{variant.note}</span>
            </div>
          );
        },
      },
      {
        key: "revision_facts",
        label: "Revision Facts",
        sortable: true,
        filterOptions: [
          {
            label: "Revision Facts",
            value: String(true),
          },
          {
            label: "No Revision Facts",
            value: String(false),
          },
        ],
        filterIncludeEmpty: false,
        render: (row: TableList) => {
          const summary = row.insight_facts_summary;

          if (!summary) {
            return <span className="text-sm text-gray-500">No data</span>;
          }

          const total = summary.total_revisions;
          const totalExpected = row.insight_facts_summary?.total_expecteds || 0;

          const ratio = totalExpected > 0 ? (total / totalExpected) * 100 : 0;

          const variant =
            total === 0
              ? {
                  badgeClass:
                    "bg-green-100 text-green-800 border border-green-200",
                  barClass: "bg-green-500",
                  textClass: "text-[10px] text-green-700",
                  note: "No revisions required",
                }
              : {
                  badgeClass:
                    "bg-orange-100 text-orange-800 border border-orange-200",
                  barClass: "bg-orange-500",
                  textClass: "text-[10px] text-orange-700",
                  note: `${ratio.toFixed(1)}% flagged for revision`,
                };

          return (
            <div className="flex flex-col gap-1 w-32">
              {/* Badge jumlah revisi */}
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${variant.badgeClass}`}
              >
                <History className="w-3 h-3" />
                {total}/{totalExpected} revisions
              </span>

              {/* Progress Bar */}
              <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`absolute top-0 left-0 h-2 rounded-full ${variant.barClass}`}
                  style={{ width: `${ratio}%` }}
                />
              </div>

              {/* Catatan kecil */}
              <span className={variant.textClass}>{variant.note}</span>
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
            <Button
              size="sm"
              onClick={() => {
                handleAnalyzeTable(row.id);
              }}
            >
              Analyze
            </Button>
            <Link to={`/analysis/${row.id}`} target="_blank">
              <Button size="sm">Review</Button>
            </Link>
          </div>
        ),
      },
    ],
    [handleAnalyzeTable, organizations?.data]
  );

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Table Analysis</h1>
      <DataTable
        selectable
        actions={
          <div className="flex gap-2">
            {table.selectedIDs.length > 0 && (
              <Button
                size="sm"
                onClick={() =>
                  handleAnalyzeTables(table.selectedIDs.map((t) => String(t)))
                }
              >
                Bulk Analyze
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
    </div>
  );
};

export default TableAnalysis;
