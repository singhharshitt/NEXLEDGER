export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export function parsePagination(query: {
  page?: string | number;
  limit?: string | number;
  pageSize?: string | number;
}): PaginationParams {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit ?? query.pageSize) || 20));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

export function paginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number
) {
  return {
    data: items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 0,
  };
}
