import { API_BASE_URL } from "@/config/api";
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
import { fetcher } from "@/utils/network";
import useSWR from "swr";

type DimensionFilters = Record<keyof Dimension, FilterValue>;

export const useDimensions = createPaginatedResourceHook<
  Dimension,
  DimensionFilters
>("/dimensions");

export const useDimensionNames = () => {
  const url = `${API_BASE_URL}/api/v1/dimensions/names`;

  const { data, error, isLoading } = useSWR<ApiResponse<DimensionName[]>>(
    url,
    fetcher
  );

  return { data, error, isLoading };
};

export const createDimension = async (
  data: CreateDimensionRequest
): Promise<ApiResponse<Dimension>> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/dimensions`, {
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

export const updateDimension = async (
  id: string,
  data: UpdateDimensionRequest
): Promise<ApiResponse<Dimension>> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/dimensions/${id}`, {
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
