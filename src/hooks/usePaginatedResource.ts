import { useApiFetch } from "@/hooks/useApiFetch";
import useSWR, { type SWRConfiguration } from "swr";
import { API_BASE_URL } from "@/config/api";
import type { ApiResponse, PaginationMeta } from "@/type/response";

export type FilterValue = string | string[];

export type PaginatedParams<
  TFilters extends Record<string, FilterValue | undefined>
> = {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: Partial<TFilters>;
};

const defaultConfig: SWRConfiguration = {
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  refreshInterval: 0,
};

export function usePaginatedResource<
  TData,
  TFilters extends Record<string, FilterValue>
>(
  endpoint: string,
  params: PaginatedParams<TFilters> = {},
  config?: SWRConfiguration
) {
  const apiFetch = useApiFetch();
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 10;

  const searchParams = new URLSearchParams();
  searchParams.append("page", String(page));
  searchParams.append("per_page", String(perPage));

  if (params.search) searchParams.append("search", params.search);
  if (params.sortBy) searchParams.append("sort_by", params.sortBy);
  if (params.sortOrder) searchParams.append("sort_order", params.sortOrder);

  if (params.filters) {
    Object.entries(params.filters).forEach(([key, value]) => {
      if (!value) return;
      if (Array.isArray(value))
        value.forEach((v) => searchParams.append(key, v));
      else searchParams.append(key, value);
    });
  }

  const url = `${API_BASE_URL}/api/v1${endpoint}?${searchParams.toString()}`;
  const swrConfig = { ...defaultConfig, ...config };

  const { data, error, isLoading, mutate } = useSWR<
    ApiResponse<TData[], PaginationMeta>
  >(url, apiFetch, swrConfig);

  return { data, error, isLoading, mutate };
}

export function createPaginatedResourceHook<
  TData,
  TFilters extends Record<string, FilterValue>
>(endpoint: string, config?: SWRConfiguration) {
  return function useResource(params: PaginatedParams<TFilters> = {}) {
    return usePaginatedResource<TData, TFilters>(endpoint, params, config);
  };
}
