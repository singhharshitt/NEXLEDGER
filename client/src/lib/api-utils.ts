import type { PaginatedResponse } from '@/types';

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorBody {
  success?: false;
  message?: string;
  errors?: Array<{ field?: string; message: string }>;
}

export function unwrapData<T>(response: { data: unknown }): T {
  const payload = response.data;

  if (
    payload &&
    typeof payload === 'object' &&
    'success' in payload &&
    (payload as ApiSuccessResponse<T>).success === true &&
    'data' in payload
  ) {
    return (payload as ApiSuccessResponse<T>).data;
  }

  return payload as T;
}

export function normalizePaginated<T>(data: unknown): PaginatedResponse<T> {
  if (!data || typeof data !== 'object') {
    return { data: [], total: 0, page: 1, pageSize: 20, totalPages: 0 };
  }

  const obj = data as Record<string, unknown>;

  if (Array.isArray(obj.data) && 'total' in obj) {
    return {
      data: obj.data as T[],
      total: Number(obj.total) || 0,
      page: Number(obj.page) || 1,
      pageSize: Number(obj.pageSize) || 20,
      totalPages: Number(obj.totalPages) || 0,
    };
  }

  if (Array.isArray(obj.items) && obj.pagination && typeof obj.pagination === 'object') {
    const pagination = obj.pagination as Record<string, number>;
    return {
      data: obj.items as T[],
      total: pagination.total ?? 0,
      page: pagination.page ?? 1,
      pageSize: pagination.limit ?? pagination.pageSize ?? 20,
      totalPages: pagination.totalPages ?? 0,
    };
  }

  if (Array.isArray(data)) {
    const items = data as T[];
    return {
      data: items,
      total: items.length,
      page: 1,
      pageSize: items.length,
      totalPages: 1,
    };
  }

  return { data: [], total: 0, page: 1, pageSize: 20, totalPages: 0 };
}

export function cleanQueryParams(
  params?: Record<string, unknown> | object
): Record<string, string | number | boolean> {
  if (!params) return {};

  const cleaned: Record<string, string | number | boolean> = {};

  for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
    if (value === undefined || value === null || value === '' || value === 'all') {
      continue;
    }
    cleaned[key] = value as string | number | boolean;
  }

  return cleaned;
}

export function mapStockStatusFilter(status?: string): string | undefined {
  if (!status || status === 'all') return undefined;
  // Server productListQuerySchema accepts z.enum(['healthy', 'low', 'out']) directly —
  // pass through as-is; no translation needed.
  return status;
}

export function getApiErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosErr = error as { response?: { data?: ApiErrorBody; status?: number } };
    const { data, status } = axiosErr.response ?? {};

    if (data?.message) return data.message;
    if (status === 401) return 'Your session has expired. Please sign in again.';
    if (status === 403) return "You don't have permission to perform this action.";
    if (status === 404) return 'The requested resource was not found.';
    if (status === 409) return 'This operation conflicts with the current record state.';
    if (status === 422) return 'Validation failed. Please check your input.';
    if (status === 500) return 'Something went wrong on the server. Please try again.';
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
}
