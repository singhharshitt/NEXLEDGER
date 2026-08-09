import api from './api';
import {
  unwrapData,
  normalizePaginated,
  cleanQueryParams,
  mapStockStatusFilter,
} from '@/lib/api-utils';
import type {
  Product,
  StockStatus,
  CreateProductInput,
  ProductFilters,
  PaginatedResponse,
  StockMovement,
} from '@/types';

/**
 * The server's mapProduct() in server/src/utils/mappers.ts already converts the DB row
 * to camelCase before sending to the client. It returns:
 *   { id, name, sku, category, description, unitPrice (number), currentStock (number),
 *     minStock (number), unit, status ('healthy'|'low'|'out'), createdAt, updatedAt }
 *
 * Note: the server's mapProduct does NOT include a `warehouse` field.
 */
interface MappedServerProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  description?: string;
  unitPrice: number;
  currentStock: number;
  minStock: number;
  unit: string;
  warehouse?: string;
  status: StockStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Normalize a server-mapped product response to the client's Product shape.
 * The server already does the snake_case->camelCase conversion, so this mainly
 * ensures types are correct (numbers, optional fields).
 * Exported so other services (stock, dashboard) can reuse it.
 */
export function mapProduct(raw: unknown): Product {
  const r = raw as MappedServerProduct;
  return {
    id: r.id,
    name: r.name,
    sku: r.sku,
    category: r.category,
    description: r.description,
    unitPrice: Number(r.unitPrice ?? 0),
    currentStock: Number(r.currentStock ?? 0),
    minStock: Number(r.minStock ?? 0),
    unit: r.unit,
    warehouse: r.warehouse,
    status: (r.status as StockStatus) || 'healthy',
    createdAt: r.createdAt ?? '',
    updatedAt: r.updatedAt ?? '',
  };
}

function buildProductParams(filters?: ProductFilters) {
  return cleanQueryParams({
    search: filters?.search,
    category: filters?.category,
    stockStatus: mapStockStatusFilter(filters?.stockStatus),
  });
}

export const productsService = {
  getAll: async (filters?: ProductFilters): Promise<PaginatedResponse<Product>> => {
    const response = await api.get('/products', { params: buildProductParams(filters) });
    const paginated = normalizePaginated<unknown>(unwrapData(response));
    return { ...paginated, data: paginated.data.map(mapProduct) };
  },

  getById: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return mapProduct(unwrapData(response));
  },

  create: async (input: CreateProductInput): Promise<Product> => {
    // Server createProductSchema expects camelCase: unitPrice, minStock (matches CreateProductInput)
    const response = await api.post('/products', input);
    return mapProduct(unwrapData(response));
  },

  update: async (id: string, input: Partial<CreateProductInput>): Promise<Product> => {
    const response = await api.put(`/products/${id}`, input);
    return mapProduct(unwrapData(response));
  },

  getStockMovements: async (productId: string): Promise<StockMovement[]> => {
    const response = await api.get(`/products/${productId}/stock-movements`);
    const raw = unwrapData<StockMovement[]>(response);
    // Server mapStockMovement() returns lowercase type ('in'/'out'); uppercase it for the client
    return raw.map((m) => ({ ...m, type: String(m.type).toUpperCase() as 'IN' | 'OUT' }));
  },

  getCategories: async (): Promise<string[]> => {
    const response = await api.get('/products/categories');
    return unwrapData<string[]>(response);
  },
};
