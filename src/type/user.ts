import type { Organization } from "./organization";

export type User = {
  id: string;
  username: string;
  email: string;
  roles: string[]; // e.g., ['admin', 'operator']
  organization_id: string;
  organization?: Organization;
};

export type CreateUserRequest = {
  username: string;
  email: string;
  password: string;
  roles: string[];
  organization_id: string;
};

export type UpdateUserRequest = {
  username?: string;
  email?: string;
  password?: string;
  roles?: string[];
  organization_id?: string;
};
