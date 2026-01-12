import type { Indicator, IndicatorList } from "@/type/indicator";
import type { Dimension, DimensionList } from "@/type/dimension";
import type { Fact } from "@/type/fact";
import type { Organization } from "@/type/organization";
import type { Aggregate } from "@/type/aggregate";

export type Table = {
  id: string;
  name: string;
  direction: number;
  indicator: Indicator;
  labels: string[];
  notes: string | null;
  is_locked: boolean;
  is_aggregated: boolean;
  status: "draft" | "submitted" | "finalized";
  aggregate?: Aggregate;
  has_parent_dimension: boolean;
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
  dimensions: DimensionList[];
  is_locked: boolean;
  is_aggregated: boolean;
  status: "draft" | "submitted" | "finalized";
  has_parent_dimension: boolean;
  insight_facts_summary?: SummaryInsightFactsResponse | null;
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

export type SummaryInsightFactsResponse = {
  expected_per_year: number;
  total_expecteds: number;
  total_filleds: number;
  total_missings: number;
  total_revisions: number;
  total_outliers: number;
};

export type DataInsightFactsResponse = {
  year: number;
  expected: number;
  filled: number;
  missing: number;
  revision: number;
  outlier: number;
};

export type InsightFactsResponse = {
  table_id: string;
  from_year: number;
  to_year: number;
  summary: SummaryInsightFactsResponse;
  data: DataInsightFactsResponse[];
};
