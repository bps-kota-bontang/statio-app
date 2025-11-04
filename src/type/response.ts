export type PaginationMeta = {
  total: number;
  pages: number;
  page: number;
  per_page: number;
};

export type ApiResponse<T, M = undefined> = {
  data: T;
  message: string;
  meta?: M;
};
