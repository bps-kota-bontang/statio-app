export type ProjectList = {
  id: string;
  name: string;
  table_count: number;
};

export type ProjectTable = {
  id?: string;
  table_id: string;
  table_name: string;
  page: string;
  table_number: string;
};

export type Project = {
  id: string;
  name: string;
  tables: ProjectTable[];
};

export type CreateProjectRequest = {
  name: string;
};

export type UpdateProjectRequest = {
  name: string;
};

export type ProjectTableRequest = {
  table_id: string;
  page: string;
  table_number: string;
};
