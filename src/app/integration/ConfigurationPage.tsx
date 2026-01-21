import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/component/ui/Card";
import Input from "@/component/ui/Input";
import { Label } from "@/component/ui/Label";
import Button from "@/component/ui/Button";
import { useConfigurationApi } from "@/service/configuration";
import { useOutletContext } from "react-router";
import type { StatioContextType } from "@/component/layout/StatioLayout";

const BASE_URL_KEY = "integration_base_url";
const DEFAULT_URL = "http://localhost:4000";

const ConfigurationPage = () => {
  const { setBreadcrumbs } = useOutletContext<StatioContextType>();
  const { useConfiguration, updateConfiguration } = useConfigurationApi();
  const { data, mutate } = useConfiguration(BASE_URL_KEY);

  const [inputValue, setInputValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    document.title = "Integration Configuration | Statio";
    setBreadcrumbs([
      { label: "Dashboard", href: "/" },
      { label: "Integration", highlight: false },
      { label: "Configuration" },
    ]);
  }, [setBreadcrumbs]);

  useEffect(() => {
    if (data?.data?.value) setInputValue(data.data.value);
  }, [data]);

  const handleUpdate = async (value: string, successMsg: string) => {
    setIsSaving(true);
    setMessage(null);

    try {
      new URL(value); // Validate URL
      await updateConfiguration(BASE_URL_KEY, {
        value,
        name: "Integration Base URL",
      });
      setMessage({ type: "success", text: successMsg });
      mutate();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to update",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Integration API Configuration</CardTitle>
          <p className="text-sm text-gray-500">
            Configure the base URL for the integration service API
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="baseUrl">Base URL</Label>
            <Input
              id="baseUrl"
              type="url"
              value={inputValue}
              onChange={setInputValue}
              placeholder={DEFAULT_URL}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Example: {DEFAULT_URL} or https://api.example.com
            </p>
          </div>

          {message && (
            <div
              className={`p-3 rounded-md text-sm ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={() =>
                handleUpdate(inputValue, "Configuration saved successfully")
              }
              disabled={isSaving || !inputValue}
              variant="primary"
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <Button
              onClick={() => {
                setInputValue(DEFAULT_URL);
                handleUpdate(DEFAULT_URL, "Reset to default");
              }}
              variant="secondary"
              disabled={isSaving}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfigurationPage;
