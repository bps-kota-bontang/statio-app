export type DynamicIntegrationResult = {
  item: { id: string; subjectId: string; year: number; file: string };
  operation?: "create" | "update";
  year_id?: string;
  sent_cells: number;
  skipped_empty: number;
  skipped_outside: number;
  verified: boolean;
  error?: string;
};

export type DynamicIntegrationResponse = {
  total: number;
  success: number;
  failed: number;
  results: DynamicIntegrationResult[];
};
