import { API_BASE_URL } from "@/config/api";
import { useApiFetch } from "@/hooks/useApiFetch";
import {
  createPaginatedResourceHook,
  type FilterValue,
} from "@/hooks/usePaginatedResource";
import type {
  CreateUserRequest,
  User,
  UpdateUserRequest,
  UserInviteLinkResponse,
  UpdatePasswordRequest,
  UpdateEmailRequest,
} from "@/type/user";
import type { ApiResponse } from "@/type/response";
import useSWR from "swr";

type UserFilters = Record<keyof User, FilterValue>;

export const useUserApi = () => {
  const apiFetch = useApiFetch();

  const useUsers = createPaginatedResourceHook<User, UserFilters>("/users");

  const useUser = (id: string) => {
    const url = `${API_BASE_URL}/api/v1/users/${id}`;

    const { data, error, isLoading, mutate } = useSWR<ApiResponse<User>>(
      id ? url : null,
      apiFetch,
      {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        refreshInterval: 0, // refresh every 3 seconds
      }
    );

    return { data, error, isLoading, mutate };
  };

  const createUser = async (
    data: CreateUserRequest
  ): Promise<ApiResponse<User>> => {
    return apiFetch(`${API_BASE_URL}/api/v1/users`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  };

  const updateUser = async (
    id: string,
    data: UpdateUserRequest
  ): Promise<ApiResponse<User>> => {
    return apiFetch(`${API_BASE_URL}/api/v1/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  };

  const deleteUser = async (id: string): Promise<ApiResponse<null>> => {
    return apiFetch(`${API_BASE_URL}/api/v1/users/${id}`, {
      method: "DELETE",
    });
  };

  const getUserInviteLink = (
    id: string
  ): Promise<ApiResponse<UserInviteLinkResponse>> => {
    return apiFetch(`${API_BASE_URL}/api/v1/users/${id}/invite-link`, {
      method: "GET",
    });
  };

  const updateProfile = async (
    data: UpdateEmailRequest
  ): Promise<ApiResponse<User>> => {
    return apiFetch(`${API_BASE_URL}/api/v1/users/me/email`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  };

  const changePassword = async (
    data: UpdatePasswordRequest
  ): Promise<ApiResponse<null>> => {
    return apiFetch(`${API_BASE_URL}/api/v1/users/me/password`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  };

  return {
    useUsers,
    useUser,
    createUser,
    updateUser,
    deleteUser,
    getUserInviteLink,
    updateProfile,
    changePassword,
  };
};
