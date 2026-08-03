import useSWR from "swr";
import { API_BASE_URL } from "@/config/api";
import { useApiFetch } from "@/hooks/useApiFetch";
import {
  createPaginatedResourceHook,
  type FilterValue,
} from "@/hooks/usePaginatedResource";
import type { ApiResponse } from "@/type/response";
import type {
  CreateProjectRequest,
  Project,
  ProjectList,
  ProjectTableRequest,
  UpdateProjectRequest,
} from "@/type/project";

type ProjectFilters = Record<keyof ProjectList, FilterValue>;

export const useProjectApi = () => {
  const apiFetch = useApiFetch();

  const useProjects = createPaginatedResourceHook<
    ProjectList,
    ProjectFilters
  >("/projects");

  const useProject = (id?: string) => {
    const url = `${API_BASE_URL}/api/v1/projects/${id}`;
    const { data, error, isLoading, mutate } = useSWR<ApiResponse<Project>>(
      id ? url : null,
      apiFetch,
    );
    return { data, error, isLoading, mutate };
  };

  const createProject = (data: CreateProjectRequest) =>
    apiFetch<ApiResponse<Project>>(`${API_BASE_URL}/api/v1/projects`, {
      method: "POST",
      body: JSON.stringify(data),
    });

  const updateProject = (id: string, data: UpdateProjectRequest) =>
    apiFetch<ApiResponse<Project>>(`${API_BASE_URL}/api/v1/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });

  const deleteProject = (id: string) =>
    apiFetch(`${API_BASE_URL}/api/v1/projects/${id}`, { method: "DELETE" });

  const addTable = (projectID: string, data: ProjectTableRequest) =>
    apiFetch(`${API_BASE_URL}/api/v1/projects/${projectID}/tables`, {
      method: "POST",
      body: JSON.stringify(data),
    });

  const updateTable = (
    projectID: string,
    tableID: string,
    data: Omit<ProjectTableRequest, "table_id">,
  ) =>
    apiFetch(`${API_BASE_URL}/api/v1/projects/${projectID}/tables/${tableID}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });

  const removeTable = (projectID: string, tableID: string) =>
    apiFetch(`${API_BASE_URL}/api/v1/projects/${projectID}/tables/${tableID}`, {
      method: "DELETE",
    });

  return {
    useProjects,
    useProject,
    createProject,
    updateProject,
    deleteProject,
    addTable,
    updateTable,
    removeTable,
  };
};
