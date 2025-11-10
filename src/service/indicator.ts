import { API_BASE_URL } from "@/config/api";
import { useApiFetch } from "@/hooks/useApiFetch";
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
import useSWR from "swr";

type IndicatorFilters = Record<keyof Indicator, FilterValue>;

export const useIndicatorApi = () => {
  const apiFetch = useApiFetch();

  const useIndicators = createPaginatedResourceHook<
    Indicator,
    IndicatorFilters
  >("/indicators");

  const createIndicator = async (
    data: CreateIndicatorRequest
  ): Promise<ApiResponse<Indicator>> => {
    return apiFetch(`${API_BASE_URL}/api/v1/indicators`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  };

  const updateIndicator = async (
    id: string,
    data: UpdateIndicatorRequest
  ): Promise<ApiResponse<Indicator>> => {
    return apiFetch(`${API_BASE_URL}/api/v1/indicators/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  };

  const useIndicatorNames = () => {
    const url = `${API_BASE_URL}/api/v1/indicators/names`;

    const { data, error, isLoading } = useSWR<ApiResponse<IndicatorName[]>>(
      url,
      apiFetch
    );

    return { data, error, isLoading };
  };

  const useIndicatorMeasures = () => {
    const url = `${API_BASE_URL}/api/v1/indicators/measures`;

    const { data, error, isLoading } = useSWR<ApiResponse<IndicatorMeasure[]>>(
      url,
      apiFetch
    );

    return { data, error, isLoading };
  };

  const useIndicatorUnits = () => {
    const url = `${API_BASE_URL}/api/v1/indicators/units`;

    const { data, error, isLoading } = useSWR<ApiResponse<IndicatorUnit[]>>(
      url,
      apiFetch
    );

    return { data, error, isLoading };
  };

  return {
    useIndicators,
    useIndicatorNames,
    useIndicatorMeasures,
    useIndicatorUnits,
    createIndicator,
    updateIndicator,
  };
};
