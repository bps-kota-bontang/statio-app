import { API_BASE_URL } from "@/config/api";
import { useApiFetch } from "@/hooks/useApiFetch";
import type {
  Configuration,
  UpdateConfigurationRequest,
} from "@/type/configuration";

import type { ApiResponse } from "@/type/response";
import useSWR from "swr";

export const useConfigurationApi = () => {
  const apiFetch = useApiFetch();

  const useConfiguration = (key: string) => {
    const url = `${API_BASE_URL}/api/v1/configurations/${key}`;

    const { data, error, isLoading, mutate } = useSWR<
      ApiResponse<Configuration>
    >(key ? url : null, apiFetch, {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 0, // refresh every 3 seconds
    });

    return { data, error, isLoading, mutate };
  };

  const updateConfiguration = async (
    key: string,
    data: UpdateConfigurationRequest,
  ): Promise<ApiResponse<null>> => {
    return apiFetch(`${API_BASE_URL}/api/v1/configurations/${key}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  };

  return {
    useConfiguration,
    updateConfiguration,
  };
};
