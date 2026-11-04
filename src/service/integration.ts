import { API_BASE_URL } from "@/config/api";
import { useAuth } from "@/hooks/useAuth";
import type { ApiResponse } from "@/type/response";
import type { DynamicIntegrationResponse } from "@/type/integration";

export const useIntegrationApi = () => {
  const { token } = useAuth();

  const exportIntegrationTable = async (
    tableIDs: string[],
    year: number,
  ): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/integrations/export`, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/zip",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        table_ids: tableIDs,
        year: year,
      }),
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    const contentDisposition = response.headers.get("Content-Disposition");
    let filename = `data_integration_export_${new Date().toISOString()}.zip`;

    if (contentDisposition && contentDisposition.includes("filename=")) {
      const parts = contentDisposition.split("filename=");
      if (parts.length > 1) {
        filename = parts[1]
          .split(";")[0]
          .trim()
          .replace(/^["']|["']$/g, "");
      }
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const importIntegrationFile = async (file: File): Promise<void> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/api/v1/integrations/import`, {
      method: "POST",
      credentials: "include",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
  };

  const importDynamicIntegrationFile = async (
    file: File,
  ): Promise<DynamicIntegrationResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(
      `${API_BASE_URL}/api/v1/integrations/import-dynamic`,
      {
        method: "POST",
        credentials: "include",
        headers: token ? { Authorization: ["Bearer", token].join(" ") } : {},
        body: formData,
      },
    );
    if (!response.ok) {
      const body: unknown = await response.json().catch(() => null);
      const message =
        body && typeof body === "object" && "message" in body &&
        typeof body.message === "string"
          ? body.message
          : `Import failed (HTTP ${response.status})`;
      throw new Error(message);
    }
    const body: ApiResponse<DynamicIntegrationResponse> = await response.json();
    if (!body?.data || !Array.isArray(body.data.results) ||
        typeof body.data.total !== "number" ||
        typeof body.data.success !== "number" ||
        typeof body.data.failed !== "number") {
      throw new Error("Invalid import response. Check BPS before retrying.");
    }
    return body.data;
  };

  return {
    exportIntegrationTable,
    importIntegrationFile,
    importDynamicIntegrationFile,
  };
};
