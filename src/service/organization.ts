import { API_BASE_URL } from "@/config/api";
import { useApiFetch } from "@/hooks/useApiFetch";
import {
  createPaginatedResourceHook,
  type FilterValue,
} from "@/hooks/usePaginatedResource";
import type {
  CreateOrganizationRequest,
  Organization,
  UpdateOrganizationRequest,
} from "@/type/organization";
import type { ApiResponse } from "@/type/response";

type OrganizationFilters = Record<keyof Organization, FilterValue>;

export const useOrganizationApi = () => {
  const apiFetch = useApiFetch();

  const useOrganizations = createPaginatedResourceHook<
    Organization,
    OrganizationFilters
  >("/organizations");

  const assignTablesToOrganization = async (
    orgID: string,
    tableIDs: (string | number)[]
  ): Promise<ApiResponse<null>> => {
    return apiFetch(`${API_BASE_URL}/api/v1/organizations/${orgID}/tables`, {
      method: "POST",
      body: JSON.stringify({ table_ids: tableIDs }),
    });
  };

  const createOrganization = async (
    data: CreateOrganizationRequest
  ): Promise<ApiResponse<Organization>> => {
    return apiFetch(`${API_BASE_URL}/api/v1/organizations`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  };

  const updateOrganization = async (
    id: string,
    data: UpdateOrganizationRequest
  ): Promise<ApiResponse<Organization>> => {
    return apiFetch(`${API_BASE_URL}/api/v1/organizations/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  };

  return {
    useOrganizations,
    createOrganization,
    updateOrganization,
    assignTablesToOrganization,
  };
};
