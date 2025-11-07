import { API_BASE_URL } from "@/config/api";
import {
  createPaginatedResourceHook,
  type FilterValue,
} from "@/hooks/usePaginatedResource";
import type {
  CreateTableRequest,
  Table,
  TableList,
  UpdateTableRequest,
} from "@/type/table";
import type { ApiResponse } from "@/type/response";
import { fetcher } from "@/utils/network";
import useSWR from "swr";
import type { FactRequest } from "@/type/fact";

type TableFilters = Record<keyof Table, FilterValue>;

export const useTable = (id?: string, year?: number | null) => {
  const params = new URLSearchParams();
  if (year) params.append("year", String(year));

  const url = `${API_BASE_URL}/api/v1/tables/${id}${
    params.toString() ? `?${params.toString()}` : ""
  }`;

  const { data, error, isLoading, mutate } = useSWR<ApiResponse<Table>>(
    id ? url : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 0, // refresh every 3 seconds
    }
  );

  return { data, error, isLoading, mutate };
};

export const useTables = createPaginatedResourceHook<TableList, TableFilters>(
  "/tables"
);

export const updateTableFact = async (
  id: string,
  data: FactRequest
): Promise<ApiResponse<null>> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/tables/${id}/facts`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message);
  }

  return result;
};

export const createTable = async (
  data: CreateTableRequest
): Promise<ApiResponse<Table>> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/tables`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message);
  }

  return result;
};

export const updateTable = async (
  id: string,
  data: UpdateTableRequest
): Promise<ApiResponse<Table>> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/tables/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message);
  }

  return result;
};
