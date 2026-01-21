import { API_BASE_URL } from "@/config/api";
import { useAuth } from "@/hooks/useAuth";

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

  return {
    exportIntegrationTable,
  };
};
