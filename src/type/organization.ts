export type Organization = {
  id: string;
  name: string;
};

export type CreateOrganizationRequest = {
  name: string;
};

export type UpdateOrganizationRequest = {
  name: string;
};
