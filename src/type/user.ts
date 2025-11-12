export type User = {
  id: string;
  email: string;
  roles: string[]; // e.g., ['admin', 'operator']
  organization_id: string;
};
