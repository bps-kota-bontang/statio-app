import { API_BASE_URL } from "@/config/api";
import { useApiFetch } from "@/hooks/useApiFetch";
import type { ApiResponse } from "@/type/response";
import type {
  DashboardStatisticsResponse,
  OrganizationCompletionData,
  TopPerformerData,
  OrganizationNeedAttentionData,
} from "@/type/dashboard";
import useSWR from "swr";

export const useDashboardApi = () => {
  const apiFetch = useApiFetch();

  const useDashboardSummary = () => {
    const url = `${API_BASE_URL}/api/v1/dashboard/statistics`;

    const { data, error, isLoading, mutate } = useSWR<
      ApiResponse<DashboardStatisticsResponse>
    >(url, apiFetch);

    return { data, error, isLoading, mutate };
  };

  const useOrganizationCompletion = () => {
    const url = `${API_BASE_URL}/api/v1/dashboard/organization-completion`;

    const { data, error, isLoading, mutate } = useSWR<
      ApiResponse<OrganizationCompletionData[]>
    >(url, apiFetch);

    return { data, error, isLoading, mutate };
  };

  const useTopPerformers = () => {
    const url = `${API_BASE_URL}/api/v1/dashboard/top-performers`;

    const { data, error, isLoading, mutate } = useSWR<
      ApiResponse<TopPerformerData[]>
    >(url, apiFetch);

    return { data, error, isLoading, mutate };
  };

  const useOrganizationsNeedAttention = () => {
    const url = `${API_BASE_URL}/api/v1/dashboard/organizations-need-attention`;

    const { data, error, isLoading, mutate } = useSWR<
      ApiResponse<OrganizationNeedAttentionData[]>
    >(url, apiFetch);

    return { data, error, isLoading, mutate };
  };

  return {
    useDashboardSummary,
    useOrganizationCompletion,
    useTopPerformers,
    useOrganizationsNeedAttention,
  };
};
