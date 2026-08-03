import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/component/ui/Card";
import Input from "@/component/ui/Input";
import { Label } from "@/component/ui/Label";
import Button from "@/component/ui/Button";
import { useConfigurationApi } from "@/service/configuration";
import { useOutletContext } from "react-router";
import type { StatioContextType } from "@/component/layout/StatioLayout";

const COOKIE_KEY = "integration_website_cookie";

const ConfigurationPage = () => {
  const { setBreadcrumbs } = useOutletContext<StatioContextType>();
  const { useConfiguration, updateConfiguration } = useConfigurationApi();
  const { data, mutate } = useConfiguration(COOKIE_KEY);

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
      await updateConfiguration(COOKIE_KEY, {
        value,
        name: "Integration Website Cookie",
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
          <CardTitle>Integration Cookie Configuration</CardTitle>
          <p className="text-sm text-gray-500">
            Configure cookie for integration upload to BPS website
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="integrationCookie">Cookie</Label>
            <Input
              id="integrationCookie"
              type="text"
              value={inputValue}
              onChange={setInputValue}
              placeholder="PHPSESSID=...; other_cookie=..."
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Paste cookie header value from browser request.
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
                setInputValue("");
                setMessage(null);
              }}
              variant="secondary"
              disabled={isSaving}
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfigurationPage;
