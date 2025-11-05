export type DimensionValue = {
  id: string;
  name: string;
};

export type Dimension = {
  id: string;
  name: string;
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
