import { API_BASE_URL } from "@/config/api";
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

export const useOrganizations = createPaginatedResourceHook<
  Organization,
  OrganizationFilters
>("/organizations");

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

export const createOrganization = async (
  data: CreateOrganizationRequest
): Promise<ApiResponse<Organization>> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/organizations`, {
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

export const updateOrganization = async (
  id: string,
  data: UpdateOrganizationRequest
): Promise<ApiResponse<Organization>> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/organizations/${id}`, {
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
