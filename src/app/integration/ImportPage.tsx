import type { StatioContextType } from "@/component/layout/StatioLayout";
import { useIntegrationApi } from "@/service/integration";
import { useEffect, useRef, useState } from "react";
import { Link, useOutletContext } from "react-router";
import Button from "@/component/ui/Button";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";
import type { DynamicIntegrationResponse } from "@/type/integration";

const ImportPage = () => {
  const { setBreadcrumbs } = useOutletContext<StatioContextType>();
  const { importDynamicIntegrationFile } = useIntegrationApi();
  const { toast } = useToast();
  const fileInput = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<DynamicIntegrationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Integration Import | Statio";
    setBreadcrumbs([
      { label: "Dashboard", href: "/" },
      { label: "Integration", highlight: false },
      { label: "Import" },
    ]);
  }, [setBreadcrumbs]);

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInput.current) fileInput.current.value = "";
  };

  const handleUpload = async () => {
    if (!selectedFile || isUploading) return;
    setIsUploading(true);
    setError(null);
    setResult(null);
    try {
      const response = await importDynamicIntegrationFile(selectedFile);
      setResult(response);
      clearFile();
      const allVerified = response.total > 0 && response.failed === 0 &&
        response.success === response.total &&
        response.results.length === response.total &&
        response.results.every((entry) => entry.verified && !entry.error);
      toast({
        title: allVerified ? "Import verified" : "Import requires attention",
        description: `${response.success} verified, ${response.failed} failed. Review the results before retrying.`,
        ...(allVerified ? {} : { variant: "destructive" as const }),
      });
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Import failed";
      setError(message);
      toast({ title: "Import failed", description: message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">Dynamic Table Import</h1>
        <p className="text-sm text-gray-600">
          Upload a Statio export ZIP to web-be.apps.bps.go.id. Create or Update is selected automatically for each table and year.
        </p>
        <p className="text-sm text-gray-600">
          Set the new website session cookie in{" "}
          <Link className="text-blue-600 underline" to="/integration/configuration">Integration Configuration</Link>{" "}
          before uploading. Empty cells are skipped, zero values are sent, and positions outside the BPS table are omitted.
        </p>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <label htmlFor="integration-file" className="block text-sm font-medium">Statio export ZIP (maximum 32 MiB)</label>
        <input
          ref={fileInput}
          id="integration-file"
          type="file"
          accept=".zip,application/zip"
          disabled={isUploading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            setResult(null);
            setError(null);
            if (!file) { clearFile(); return; }
            if (!file.name.toLowerCase().endsWith(".zip") || file.size > 32 * 1024 * 1024) {
              setError("Select a ZIP file no larger than 32 MiB.");
              clearFile();
              return;
            }
            setSelectedFile(file);
          }}
          className="block w-full text-sm"
        />
        {selectedFile && <p className="text-sm text-gray-600">{selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)</p>}
        <p className="text-sm text-gray-600">
          Do not close this page during processing. If submission or verification fails, inspect BPS before retrying; some values may already be saved.
        </p>
        {error && <div role="alert" className="p-3 bg-red-50 text-red-800 rounded-md">{error} Check BPS before retrying an attempted upload.</div>}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" disabled={isUploading || (!selectedFile && !result && !error)}
            onClick={() => { clearFile(); setResult(null); setError(null); }}>
            Clear
          </Button>
          <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? "Processing and verifying..." : "Upload to BPS"}
          </Button>
        </div>
      </div>
      {result && (
        <section aria-live="polite" className="space-y-3">
          <h2 className="font-semibold">Import results</h2>
          <p className="text-sm">{result.total} tables: {result.success} verified, {result.failed} failed.</p>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50">
                <tr>{["File / Table ID", "Year", "Operation", "Sent cells", "Skipped empty", "Outside bounds", "Status / Error"].map((label) => <th key={label} scope="col" className="p-3">{label}</th>)}</tr>
              </thead>
              <tbody>
                {result.results.map((entry, index) => (
                  <tr key={`${entry.item.id}-${entry.item.year}-${index}`} className="border-t border-gray-200">
                    <td className="p-3">{entry.item.file}<div className="text-gray-500">{entry.item.id.split("--")[0]}</div></td>
                    <td className="p-3">{entry.item.year}</td>
                    <td className="p-3">{entry.operation === "create" ? "Create" : entry.operation === "update" ? "Update" : "-"}</td>
                    <td className="p-3">{entry.sent_cells}</td>
                    <td className="p-3">{entry.skipped_empty}</td>
                    <td className="p-3">{entry.skipped_outside}</td>
                    <td className={`p-3 ${entry.verified && !entry.error ? "text-green-700" : "text-red-700"}`}>
                      {entry.verified && !entry.error ? "Verified" : entry.error || "Not verified"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};

export default ImportPage;
