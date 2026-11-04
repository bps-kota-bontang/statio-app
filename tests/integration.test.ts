import { afterEach, describe, expect, mock, test } from "bun:test";

mock.module("../src/hooks/useAuth", () => ({
  useAuth: () => ({ token: "test-session" }),
}));

const { useIntegrationApi } = await import("../src/service/integration");
const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });

const result = {
  total: 2,
  success: 1,
  failed: 1,
  results: [
    { item: { id: "130--1", subjectId: "101", year: 2026, file: "table.xls" },
      operation: "update", sent_cells: 3, skipped_empty: 1, skipped_outside: 2, verified: true },
    { item: { id: "131--1", subjectId: "101", year: 2026, file: "other.xls" },
      sent_cells: 0, skipped_empty: 0, skipped_outside: 0, verified: false, error: "Year not found" },
  ],
};

describe("dynamic integration API", () => {
  test("uploads multipart to the new route and preserves partial results", async () => {
    let url = "";
    let options: RequestInit | undefined;
    globalThis.fetch = mock(async (input, init) => {
      url = String(input);
      options = init;
      return Response.json({ data: result, message: "Processing complete" });
    });
    const file = new File(["zip"], "export.zip", { type: "application/zip" });
    const response = await useIntegrationApi().importDynamicIntegrationFile(file);
    expect(url.endsWith("/api/v1/integrations/import-dynamic")).toBe(true);
    expect(options?.method).toBe("POST");
    expect(options?.credentials).toBe("include");
    const headers = new Headers(options?.headers);
    expect(headers.get("Content-Type")).toBeNull();
    expect(headers.has("Authorization")).toBe(true);
    expect(options?.body).toBeInstanceOf(FormData);
    expect((options?.body as FormData).get("file")).toBeInstanceOf(File);
    expect(response).toEqual(result);
    expect(response.results[1].error).toBe("Year not found");
  });

  test("surfaces backend errors", async () => {
    globalThis.fetch = mock(async () =>
      Response.json({ message: "Dynamic cookie not configured" }, { status: 400 }));
    await expect(useIntegrationApi().importDynamicIntegrationFile(new File([], "export.zip")))
      .rejects.toThrow("Dynamic cookie not configured");
  });

  test("surfaces non-JSON HTTP failures", async () => {
    globalThis.fetch = mock(async () => new Response("Gateway error", { status: 502 }));
    await expect(useIntegrationApi().importDynamicIntegrationFile(new File([], "export.zip")))
      .rejects.toThrow("HTTP 502");
  });

  test("rejects a success-shaped response without import results", async () => {
    globalThis.fetch = mock(async () => Response.json({ message: "ok", data: null }));
    await expect(useIntegrationApi().importDynamicIntegrationFile(new File([], "export.zip")))
      .rejects.toThrow("Invalid import response");
  });
});
