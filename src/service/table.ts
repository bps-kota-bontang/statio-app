import { API_BASE_URL } from "@/config/api";
import {
  createPaginatedResourceHook,
  type FilterValue,
} from "@/hooks/usePaginatedResource";
import type {
  BulkLabelsTablesRequest,
  CreateTableRequest,
  InsightFactsResponse,
  Table,
  TableLabelResponse,
  TableList,
  UpdateTableLabelRequest,
  UpdateTableMappingRequest,
  UpdateTableNameRequest,
  UpdateTableNotesRequest,
  UpdateTableRequest,
} from "@/type/table";
import type { ApiResponse } from "@/type/response";
import useSWR from "swr";
import type { Fact, FactRequest } from "@/type/fact";
import { useApiFetch } from "@/hooks/useApiFetch";
import { useAuth } from "@/hooks/useAuth";

type TableFilters = Record<keyof Table, FilterValue>;

export const useTableApi = () => {
  const apiFetch = useApiFetch();
  const { token } = useAuth();

  const useTable = (id?: string, year?: number | null) => {
    const params = new URLSearchParams();
    if (year) params.append("year", String(year));

    const url = `${API_BASE_URL}/api/v1/tables/${id}${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    const { data, error, isLoading, mutate } = useSWR<ApiResponse<Table>>(
      id ? url : null,
      apiFetch,
      {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        refreshInterval: 0, // refresh every 3 seconds
      },
    );

    return { data, error, isLoading, mutate };
  };

  const useTableInsightFacts = (
    id?: string,
    fromYear?: number,
    toYear?: number,
  ) => {
    const params = new URLSearchParams();
    if (fromYear) params.append("from_year", String(fromYear));
    if (toYear) params.append("to_year", String(toYear));

    const url = `${API_BASE_URL}/api/v1/tables/${id}/insight?${params.toString()}`;

    const { data, error, isLoading, mutate } = useSWR<
      ApiResponse<InsightFactsResponse>
    >(id ? url : null, apiFetch);

    return { data, error, isLoading, mutate };
  };

  const useTables = createPaginatedResourceHook<TableList, TableFilters>(
    "/tables",
  );

  const updateTableFact = async (
    id: string,
    data: FactRequest,
  ): Promise<ApiResponse<null>> => {
    return apiFetch(`${API_BASE_URL}/api/v1/tables/${id}/facts`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  };

  const createTable = async (
    data: CreateTableRequest,
  ): Promise<ApiResponse<Table>> => {
    return apiFetch(`${API_BASE_URL}/api/v1/tables`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  };

  const updateTable = async (
    id: string,
    data: UpdateTableRequest,
  ): Promise<ApiResponse<Table>> => {
    return apiFetch(`${API_BASE_URL}/api/v1/tables/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  };

  const addLabelsTables = async (
    data: BulkLabelsTablesRequest & { table_ids: string[] },
  ): Promise<ApiResponse<null>> => {
    return apiFetch(`${API_BASE_URL}/api/v1/tables/labels`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  };

  const useTableLables = () => {
    const url = `${API_BASE_URL}/api/v1/tables/labels`;

    const { data, error, isLoading } = useSWR<
      ApiResponse<TableLabelResponse[]>
    >(url, apiFetch);

    return { data, error, isLoading };
  };

  const updateTableLabels = async (
    id: string,
    data: UpdateTableLabelRequest,
  ): Promise<ApiResponse<TableList>> => {
    return apiFetch(`${API_BASE_URL}/api/v1/tables/${id}/labels`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  };

  const updateTableName = async (
    id: string,
    data: UpdateTableNameRequest,
  ): Promise<ApiResponse<Table>> => {
    return apiFetch(`${API_BASE_URL}/api/v1/tables/${id}/name`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  };

  const updateTableNotes = async (
    id: string,
    data: UpdateTableNotesRequest,
  ): Promise<ApiResponse<Table>> => {
    return apiFetch(`${API_BASE_URL}/api/v1/tables/${id}/notes`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  };

  const submitTable = async (id: string): Promise<ApiResponse<Table>> => {
    return apiFetch(`${API_BASE_URL}/api/v1/tables/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status: "submitted" }),
    });
  };

  const finalizeTable = async (id: string): Promise<ApiResponse<Table>> => {
    return apiFetch(`${API_BASE_URL}/api/v1/tables/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status: "finalized" }),
    });
  };

  const revertTable = async (id: string): Promise<ApiResponse<Table>> => {
    return apiFetch(`${API_BASE_URL}/api/v1/tables/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status: "draft" }),
    });
  };

  const unfinalizeTable = async (id: string): Promise<ApiResponse<Table>> => {
    return apiFetch(`${API_BASE_URL}/api/v1/tables/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status: "unfinalized" }),
    });
  };

  const analyzeTable = async (id: string): Promise<ApiResponse<null>> => {
    return apiFetch(`${API_BASE_URL}/api/v1/tables/${id}/analyze`, {
      method: "POST",
    });
  };

  const analyzeTables = async (ids: string[]): Promise<ApiResponse<null>> => {
    return apiFetch(`${API_BASE_URL}/api/v1/tables/analyze`, {
      method: "POST",
      body: JSON.stringify({ table_ids: ids }),
    });
  };

  const commitTable = async (id: string): Promise<ApiResponse<null>> => {
    return apiFetch(`${API_BASE_URL}/api/v1/tables/${id}/commit`, {
      method: "POST",
    });
  };

  const commitTables = async (ids: string[]): Promise<ApiResponse<null>> => {
    return apiFetch(`${API_BASE_URL}/api/v1/tables/commit`, {
      method: "POST",
      body: JSON.stringify({ table_ids: ids }),
    });
  };

  const downloadTable = async (
    id: string,
    years: string[],
    format: "xlsx" | "xls" = "xlsx",
  ): Promise<void> => {
    const params = new URLSearchParams();
    years.forEach((year) => params.append("years", year));
    params.append("format", format);

    const acceptHeader =
      format === "xls"
        ? "application/vnd.ms-excel"
        : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    const response = await fetch(
      `${API_BASE_URL}/api/v1/tables/${id}/download?${params.toString()}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: acceptHeader,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    // Extract filename from Content-Disposition header
    const contentDisposition = response.headers.get("Content-Disposition");
    let filename = `table_${id}_${
      new Date().toISOString().split("T")[0]
    }.${format}`;

    if (contentDisposition && contentDisposition.includes("filename=")) {
      const parts = contentDisposition.split("filename=");
      if (parts.length > 1) {
        filename = parts[1]
          .split(";")[0]
          .trim()
          .replace(/^["']|["']$/g, "");
      }
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const generateParentTable = async (
    id: string,
    dimensionIds: string[],
  ): Promise<ApiResponse<Table>> => {
    return apiFetch(`${API_BASE_URL}/api/v1/tables/${id}/generate`, {
      method: "POST",
      body: JSON.stringify({ dimension_ids: dimensionIds }),
    });
  };

  const getTableFacts = (id: string, dimensionValueIDs?: string[]) => {
    const params = new URLSearchParams();
    if (dimensionValueIDs && dimensionValueIDs.length > 0) {
      dimensionValueIDs.forEach((id) =>
        params.append("dimension_value_ids", id),
      );
    }

    const url = `${API_BASE_URL}/api/v1/tables/${id}/facts${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    return apiFetch<ApiResponse<Fact[]>>(url);
  };

  const mappingTable = async (
    id: string,
    data: UpdateTableMappingRequest,
  ): Promise<ApiResponse<Table>> => {
    return apiFetch(`${API_BASE_URL}/api/v1/tables/${id}/mapping`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  };

  const updateTableIntegrated = async (
    id: string,
    isIntegrated: boolean,
  ): Promise<ApiResponse<Table>> => {
    return apiFetch(`${API_BASE_URL}/api/v1/tables/${id}/integrated`, {
      method: "PUT",
      body: JSON.stringify({ is_integrated: isIntegrated }),
    });
  };

  const swapTableDimension = async (
    id: string,
  ): Promise<ApiResponse<Table>> => {
    return apiFetch(`${API_BASE_URL}/api/v1/tables/${id}/swap`, {
      method: "POST",
    });
  };

  return {
    useTable,
    useTableInsightFacts,
    useTables,
    createTable,
    updateTable,
    updateTableFact,
    useTableLables,
    updateTableLabels,
    addLabelsTables,
    updateTableName,
    updateTableNotes,
    submitTable,
    finalizeTable,
    revertTable,
    unfinalizeTable,
    analyzeTable,
    analyzeTables,
    getTableFacts,
    commitTable,
    commitTables,
    downloadTable,
    generateParentTable,
    mappingTable,
    updateTableIntegrated,
    swapTableDimension,
  };
};
