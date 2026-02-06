import type { Aggregate } from "./aggregate";

export type ParentDimensionValue = {
  id: string;
  name: string;
};

export type DimensionValue = {
  id: string;
  name: string;
  order: number;
  aggregate?: Aggregate;
  parent?: ParentDimensionValue | null;
};

export type DimensionList = {
  id: string;
  name: string;
  order: number;
  has_parent_dimension: boolean;
};

export type Dimension = {
  id: string;
  name: string;
  order: number;
  aggregate: boolean;
  values: DimensionValue[];
};

export type DimensionName = {
  name: string;
};

export type CreateDimensionRequest = {
  name: string;
  values: string[];
};

export type UpdateDimensionValueRequest = {
  id?: string;
  name?: string;
};

export type UpdateDimensionRequest = {
  name: string;
  values: UpdateDimensionValueRequest[];
};
