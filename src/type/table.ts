import type { Indicator, IndicatorList } from "@/type/indicator";
import type { Dimension } from "@/type/dimension";
import type { Fact } from "@/type/fact";

export type Table = {
  id: string;
  name: string;
  direction: number;
  indicator: Indicator;
  dimensions: Dimension[];
  facts: Fact[] | null;
};

export type TableList = {
  id: string;
  name: string;
  indicator: IndicatorList;
  dimensions: string[];
};

export type CreateTableRequest = {
  name: string;
  indicator_id: string;
  dimension_ids: string[];
};

export type UpdateTableRequest = {
  name: string;
  indicator_id: string;
  dimension_ids: string[];
};
