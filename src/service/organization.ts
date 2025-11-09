import { API_BASE_URL } from "@/config/api";
import type { Organization } from "@/type/organization";
import type { ApiResponse } from "@/type/response";
import { fetcher } from "@/utils/network";
import useSWR from "swr";

export const useOrganizations = () => {
  const url = `${API_BASE_URL}/api/v1/organizations`;

  const { data, error, isLoading } = useSWR<ApiResponse<Organization[]>>(
    url,
    fetcher
  );

  return { data, error, isLoading };
};

export const assignTablesToOrganization = async (
  orgID: string,
  tableIDs: (string | number)[]
): Promise<ApiResponse<null>> => {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/organizations/${orgID}/tables`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ table_ids: tableIDs }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message);
  }

  return result;
};
