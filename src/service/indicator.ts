import { API_BASE_URL } from "@/config/api";
import {
  createPaginatedResourceHook,
  type FilterValue,
} from "@/hooks/usePaginatedResource";
import type {
  CreateIndicatorRequest,
  Indicator,
  IndicatorMeasure,
  IndicatorName,
  IndicatorUnit,
  UpdateIndicatorRequest,
} from "@/type/indicator";
import type { ApiResponse } from "@/type/response";
import { fetcher } from "@/utils/network";
import useSWR from "swr";

type IndicatorFilters = Record<keyof Indicator, FilterValue>;

export const useIndicators = createPaginatedResourceHook<
  Indicator,
  IndicatorFilters
>("/indicators");

export const createIndicator = async (
  data: CreateIndicatorRequest
): Promise<ApiResponse<Indicator>> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/indicators`, {
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

export const updateIndicator = async (
  id: string,
  data: UpdateIndicatorRequest
): Promise<ApiResponse<Indicator>> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/indicators/${id}`, {
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

export const useIndicatorNames = () => {
  const url = `${API_BASE_URL}/api/v1/indicators/names`;

  const { data, error, isLoading } = useSWR<ApiResponse<IndicatorName[]>>(
    url,
    fetcher
  );

  return { data, error, isLoading };
};

export const useIndicatorMeasures = () => {
  const url = `${API_BASE_URL}/api/v1/indicators/measures`;

  const { data, error, isLoading } = useSWR<ApiResponse<IndicatorMeasure[]>>(
    url,
    fetcher
  );

  return { data, error, isLoading };
};

export const useIndicatorUnits = () => {
  const url = `${API_BASE_URL}/api/v1/indicators/units`;

  const { data, error, isLoading } = useSWR<ApiResponse<IndicatorUnit[]>>(
    url,
    fetcher
  );

  return { data, error, isLoading };
};
