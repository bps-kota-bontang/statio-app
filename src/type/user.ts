import type { Organization } from "./organization";

export type User = {
  id: string;
  username: string;
  email?: string;
  roles: string[]; // e.g., ['admin', 'operator', 'viewer']
  organization_id: string;
  organization?: Organization;
  has_invite_link?: boolean;
  has_password?: boolean;
};

export type CreateUserRequest = {
  username: string;
  email?: string;
  password?: string;
  roles: string[];
  organization_id?: string;
  invite_token?: string;
};

export type UpdateUserRequest = {
  username: string;
  email?: string;
  password?: string;
  roles: string[];
  organization_id?: string;
  invite_token?: string;
};

export type UserInviteLinkResponse = {
  invite_link: string;
};

export type UpdateEmailRequest = {
  email: string;
};

export type UpdatePasswordRequest = {
  old_password?: string;
  new_password: string;
  confirm_password: string;
};
