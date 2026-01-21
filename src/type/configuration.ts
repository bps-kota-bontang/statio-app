export type UpdateConfigurationRequest = {
  name: string;
  value: string;
};

export type Configuration = {
  id: string;
  key: string;
  name: string;
  value: string;
};
