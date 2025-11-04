export type Indicator = {
  id: string;
  name: string;
  measure: string;
  unit: string | null;
};

export type IndicatorList = {
  name: string;
  measure: string;
  unit: string | null;
};

export type IndicatorName = {
  name: string;
};

export type IndicatorMeasure = {
  measure: string;
};

export type IndicatorUnit = {
  unit: string;
};

export type CreateIndicatorRequest = {
  name: string;
  measure: string;
  unit?: string | null;
};

export type UpdateIndicatorRequest = {
  name: string;
  measure: string;
  unit?: string | null;
};
