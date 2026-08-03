import type { StatioContextType } from "@/component/layout/StatioLayout";
import { useIntegrationApi } from "@/service/integration";
import { useEffect, useState, useCallback } from "react";
import { useOutletContext } from "react-router";
import Button from "@/component/ui/Button";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileIcon, CheckCircle } from "lucide-react";

const ImportPage = () => {
  const { setBreadcrumbs } = useOutletContext<StatioContextType>();
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
          Select integration file and upload to import data
        </p>
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
            disabled={!selectedFile || isUploading}
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
    </div>
  );
};

export default ImportPage;
