export type DashboardStatisticsResponse = {
  total_tables: number;
  total_table_draft: number;
  total_table_submitted: number;
  total_table_finalized: number;
};

export type OrganizationCompletionData = {
  name: string;
  completion: number;
  tables: number;
};

export type TopPerformerData = {
  name: string;
  avg_time: string;
  completion: number;
  rank: number;
};

export type OrganizationNeedAttentionData = {
  name: string;
  completion: number;
  tables: number;
  status: string;
  days_idle: number;
};
