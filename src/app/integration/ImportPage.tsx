import type { StatioContextType } from "@/component/layout/StatioLayout";
import { useConfigurationApi } from "@/service/configuration";
import { useIntegrationApi } from "@/service/integration";
import { useEffect, useState, useCallback } from "react";
import { useOutletContext } from "react-router";
import Button from "@/component/ui/Button";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileIcon, CheckCircle, AlertCircle } from "lucide-react";

const BASE_URL_KEY = "integration_base_url";
const PATH_IMPORT = "/api/v1/integrations/upload";

const ImportPage = () => {
  const { setBreadcrumbs } = useOutletContext<StatioContextType>();
  const { useConfiguration } = useConfigurationApi();
  const { data } = useConfiguration(BASE_URL_KEY);
  const { importIntegrationFile } = useIntegrationApi();
  const { toast } = useToast();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    document.title = "Integration Import | Statio";
    setBreadcrumbs([
      { label: "Dashboard", href: "/" },
      { label: "Integration", highlight: false },
      { label: "Import" },
    ]);
  }, [setBreadcrumbs]);

  const baseUrl = data?.data?.value || "";
  const uploadUrl = baseUrl ? `${baseUrl}${PATH_IMPORT}` : "";

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setSelectedFile(file);
        setUploadSuccess(false);
      }
    },
    [],
  );

  const handleUpload = useCallback(async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      await importIntegrationFile(selectedFile);
      setUploadSuccess(true);
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
      // Clear the file after successful upload
      setSelectedFile(null);
      // Reset file input
      const fileInput = document.getElementById(
        "file-input",
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
      setUploadSuccess(false);
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, importIntegrationFile, toast]);

  return (
    <div className="p-4 space-y-6">
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">Integration Import</h1>
        <p className="text-sm text-gray-600">
          Upload integration files to import data
        </p>
      </div>

      {/* Base URL Display */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-blue-900">
            Base URL
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={baseUrl}
              readOnly
              className="flex-1 px-3 py-2 border border-blue-300 rounded-md bg-white text-sm"
              placeholder="Not configured"
            />
            {baseUrl ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            )}
          </div>
          {uploadUrl && (
            <p className="text-xs text-gray-600 mt-1">
              Upload endpoint: <span className="font-mono">{uploadUrl}</span>
            </p>
          )}
        </div>
      </div>

      {/* Upload Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Select File
          </label>
          <div className="flex items-center gap-4">
            <input
              id="file-input"
              type="file"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                cursor-pointer"
              accept=".zip,.xlsx,.xls,.csv"
            />
          </div>
          {selectedFile && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
              <FileIcon className="w-4 h-4" />
              <span>{selectedFile.name}</span>
              <span className="text-gray-400">
                ({(selectedFile.size / 1024).toFixed(2)} KB)
              </span>
            </div>
          )}
        </div>

        {uploadSuccess && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-800">
              File uploaded successfully!
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button
            onClick={() => {
              setSelectedFile(null);
              setUploadSuccess(false);
              const fileInput = document.getElementById(
                "file-input",
              ) as HTMLInputElement;
              if (fileInput) fileInput.value = "";
            }}
            variant="secondary"
            disabled={!selectedFile || isUploading}
          >
            Clear
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading || !baseUrl}
          >
            {isUploading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </>
            )}
          </Button>
        </div>
      </div>

      {!baseUrl && (
        <div className="flex items-start gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium">Base URL not configured</p>
            <p className="mt-1">
              Please configure the integration base URL in the configuration
              settings before uploading files.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportPage;
