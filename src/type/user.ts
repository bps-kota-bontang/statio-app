import type { Organization } from "./organization";

export type User = {
  id: string;
  email: string;
  roles: string[]; // e.g., ['admin', 'operator']
  organization_id: string;
  organization?: Organization;
};

export type CreateUserRequest = {
  email: string;
  password: string;
  roles: string[];
  organization_id: string;
};

export type UpdateUserRequest = {
  email?: string;
  password?: string;
  roles?: string[];
  organization_id?: string;
};
