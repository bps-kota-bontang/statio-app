import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/component/ui/Card";
import Input from "@/component/ui/Input";
import { Label } from "@/component/ui/Label";
import Button from "@/component/ui/Button";
import { useConfigurationApi } from "@/service/configuration";
import { useOutletContext } from "react-router";
import type { StatioContextType } from "@/component/layout/StatioLayout";

const CookieConfiguration = ({ configurationKey, title, description }: {
  configurationKey: string;
  title: string;
  description: string;
}) => {
  const { useConfiguration, updateConfiguration } = useConfigurationApi();
  const { data, error, isLoading, mutate } = useConfiguration(configurationKey);

  const [inputValue, setInputValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (data?.data?.value) setInputValue(data.data.value);
  }, [data]);

  const handleUpdate = async (value: string, successMsg: string) => {
    setIsSaving(true);
    setMessage(null);

    try {
      await updateConfiguration(configurationKey, {
        value,
        name: title,
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
          <CardTitle>{title}</CardTitle>
          <p className="text-sm text-gray-500">
            {description}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor={configurationKey}>Cookie</Label>
            <Input
              id={configurationKey}
              type="password"
              value={inputValue}
              onChange={setInputValue}
              placeholder="Paste authenticated cookie header"
              disabled={isSaving || isLoading}
              autoComplete="off"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Paste cookie header value from browser request.
            </p>
          </div>

          {error && <p role="alert" className="text-sm text-red-700">Could not load the saved cookie. You can enter and save a new value.</p>}
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
              disabled={isSaving || isLoading || !inputValue.trim()}
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

const ConfigurationPage = () => {
  const { setBreadcrumbs } = useOutletContext<StatioContextType>();
  useEffect(() => {
    document.title = "Integration Configuration | Statio";
    setBreadcrumbs([
      { label: "Dashboard", href: "/" },
      { label: "Integration", highlight: false },
      { label: "Configuration" },
    ]);
  }, [setBreadcrumbs]);
  return (
    <div className="space-y-4">
      <CookieConfiguration configurationKey="integration_dynamic_website_cookie"
        title="Dynamic BPS Website Cookie"
        description="Session cookie for web-be.apps.bps.go.id, used by Dynamic Table Import. Include the current CSRF cookie when available." />
      <CookieConfiguration configurationKey="integration_website_cookie"
        title="Legacy BPS Website Cookie"
        description="Cookie for the legacy BPS integration. Stored separately and not used by Dynamic Table Import." />
    </div>
  );
};

export default ConfigurationPage;
