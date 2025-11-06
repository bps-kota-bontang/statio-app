import type { Dimension, DimensionValue } from "@/type/dimension";

export type FactDimension = Omit<Dimension, "values"> & {
  value: DimensionValue;
};

export type Fact = {
  value: number | null;
  year: number;
  dimensions: FactDimension[];
};

export type FactRequest = {
  data: {
    dimensions: string[];
    value: number | null;
    year: number;
  }[];
};
