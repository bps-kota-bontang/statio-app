import type { Indicator, IndicatorList } from "@/type/indicator";
import type { Dimension } from "@/type/dimension";
import type { Fact } from "@/type/fact";
import type { Organization } from "@/type/organization";

export type Table = {
  id: string;
  name: string;
  direction: number;
  indicator: Indicator;
  labels: string[];
  notes: string | null;
  organization: Organization | null;
  dimensions: Dimension[];
  facts: Fact[] | null;
};

export type TableList = {
  id: string;
  name: string;
  labels?: string[];
  indicator: IndicatorList | null;
  organization: Organization | null;
  dimensions: string[];
  missing_facts_summary?: SummaryMissingFactsResponse | null;
};

export type CreateTableRequest = {
  name: string;
  indicator_id: string;
  organization_id?: string | null;
  dimension_ids: string[];
};

export type UpdateTableRequest = {
  name: string;
  indicator_id: string;
  organization_id: string;
  dimension_ids: string[];
};

export type AssignOrganizationRequest = {
  organization_id: string;
};

export type BulkLabelsTablesRequest = {
  labels: string[];
};

export type TableLabelResponse = {
  name: string;
};

export type UpdateTableLabelRequest = {
  labels: string[];
};

export type UpdateTableNameRequest = {
  name: string;
};

export type UpdateTableNotesRequest = {
  notes: string;
};

export type SummaryMissingFactsResponse = {
  expected_per_year: number;
  total_expected: number;
  total_filled: number;
  total_missing: number;
};

export type DataMissingFactsResponse = {
  year: number;
  expected: number;
  filled: number;
  missing: number;
};

export type MissingFactsResponse = {
  table_id: string;
  from_year: number;
  to_year: number;
  summary: SummaryMissingFactsResponse;
  data: DataMissingFactsResponse[];
};
