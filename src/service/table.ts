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
  UpdateTableNameRequest,
  UpdateTableNotesRequest,
  UpdateTableRequest,
} from "@/type/table";
import type { ApiResponse } from "@/type/response";
import useSWR from "swr";
import type { FactRequest } from "@/type/fact";
import { useApiFetch } from "@/hooks/useApiFetch";

type TableFilters = Record<keyof Table, FilterValue>;

export const useTableApi = () => {
  const apiFetch = useApiFetch();

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
      }
    );

    return { data, error, isLoading, mutate };
  };

  const useTableInsightFacts = (
    id?: string,
    fromYear?: number,
    toYear?: number
  ) => {
    const params = new URLSearchParams();
    if (fromYear) params.append("from_year", String(fromYear));
    if (toYear) params.append("to_year", String(toYear));

    const url = `${API_BASE_URL}/api/v1/tables/${id}/facts/insight?${params.toString()}`;

    const { data, error, isLoading, mutate } = useSWR<
      ApiResponse<InsightFactsResponse>
    >(id ? url : null, apiFetch);

    return { data, error, isLoading, mutate };
  };

  const useTables = createPaginatedResourceHook<TableList, TableFilters>(
    "/tables"
  );

  const updateTableFact = async (
    id: string,
    data: FactRequest
  ): Promise<ApiResponse<null>> => {
    return apiFetch(`${API_BASE_URL}/api/v1/tables/${id}/facts`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  };

  const createTable = async (
    data: CreateTableRequest
  ): Promise<ApiResponse<Table>> => {
    return apiFetch(`${API_BASE_URL}/api/v1/tables`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  };

  const updateTable = async (
    id: string,
    data: UpdateTableRequest
  ): Promise<ApiResponse<Table>> => {
    return apiFetch(`${API_BASE_URL}/api/v1/tables/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  };

  const addLabelsTables = async (
    data: BulkLabelsTablesRequest & { table_ids: string[] }
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
    data: UpdateTableLabelRequest
  ): Promise<ApiResponse<TableList>> => {
    return apiFetch(`${API_BASE_URL}/api/v1/tables/${id}/labels`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  };

  const updateTableName = async (
    id: string,
    data: UpdateTableNameRequest
  ): Promise<ApiResponse<Table>> => {
    return apiFetch(`${API_BASE_URL}/api/v1/tables/${id}/name`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  };

  const updateTableNotes = async (
    id: string,
    data: UpdateTableNotesRequest
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
    analyzeTable,
    analyzeTables,
  };
};
