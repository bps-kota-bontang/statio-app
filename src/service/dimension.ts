import { API_BASE_URL } from "@/config/api";
import { useApiFetch } from "@/hooks/useApiFetch";
import {
  createPaginatedResourceHook,
  type FilterValue,
} from "@/hooks/usePaginatedResource";
import type {
  CreateDimensionRequest,
  Dimension,
  DimensionName,
  UpdateDimensionRequest,
} from "@/type/dimension";
import type { ApiResponse } from "@/type/response";
import useSWR from "swr";

type DimensionFilters = Record<keyof Dimension, FilterValue>;

export const useDimensionApi = () => {
  const apiFetch = useApiFetch();

  const useDimensions = createPaginatedResourceHook<
    Dimension,
    DimensionFilters
  >("/dimensions");

  const useDimensionNames = () => {
    const url = `${API_BASE_URL}/api/v1/dimensions/names`;
    const { data, error, isLoading } = useSWR<ApiResponse<DimensionName[]>>(
      url,
      apiFetch
    );
    return { data, error, isLoading };
  };

  const createDimension = async (data: CreateDimensionRequest) => {
    return apiFetch<ApiResponse<Dimension>>(
      `${API_BASE_URL}/api/v1/dimensions`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  };

  const updateDimension = async (id: string, data: UpdateDimensionRequest) => {
    return apiFetch<ApiResponse<Dimension>>(
      `${API_BASE_URL}/api/v1/dimensions/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  };

  return { useDimensions, useDimensionNames, createDimension, updateDimension };
};
