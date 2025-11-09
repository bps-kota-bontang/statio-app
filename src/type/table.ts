import type { Indicator, IndicatorList } from "@/type/indicator";
import type { Dimension } from "@/type/dimension";
import type { Fact } from "@/type/fact";
import type { Organization } from "@/type/organization";

export type Table = {
  id: string;
  name: string;
  direction: number;
  indicator: Indicator;
  organization: Organization | null;
  dimensions: Dimension[];
  facts: Fact[] | null;
};

export type TableList = {
  id: string;
  name: string;
  indicator: IndicatorList | null;
  organization: Organization | null;
  dimensions: string[];
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