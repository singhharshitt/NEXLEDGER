import api from './api';
import { unwrapData, normalizePaginated, cleanQueryParams } from '@/lib/api-utils';
import type {
  Challan,
  ChallanItem,
  ChallanStatus,
  CreateChallanInput,
  ChallanFilters,
  PaginatedResponse,
} from '@/types';

/**
 * The server's mapChallan() in server/src/utils/mappers.ts already converts the DB row
 * to camelCase before sending to the client. It returns:
 *   { id, challanNumber, customerId, customerName, customerBusiness, status (lowercase),
 *     items: [...], totalQuantity, totalAmount, notes, createdBy, createdByName,
 *     createdAt, updatedAt, confirmedAt?, cancelledAt? }
 *
 * The items come from mapChallanItem() which returns:
 *   { id, productId, productName (from product_name_snapshot), sku (from sku_snapshot),
 *     unitPrice (from unit_price_snapshot), quantity, total (from total_price), availableStock? }
 *
 * Status from the server is lowercase ('draft', 'confirmed', 'cancelled') — we uppercase it.
 * Item type fields (movement type) from server are also lowercase — we uppercase them.
 */

// Shape of what the server actually sends (after its own mapChallan())
interface MappedServerChallan {
  id: string;
  challanNumber: string;
  customerId: string;
  customerName: string;
  customerBusiness: string;
  status: string;              // lowercase from server: 'draft' | 'confirmed' | 'cancelled'
  items: MappedServerChallanItem[];
  totalQuantity: number;
  totalAmount: number;
  notes?: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  cancelledAt?: string;
}

interface MappedServerChallanItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  total: number;
  availableStock?: number;
}

function mapChallanItem(raw: MappedServerChallanItem): ChallanItem {
  return {
    id: raw.id,
    productId: raw.productId,
    productName: raw.productName,
    sku: raw.sku,
    unitPrice: raw.unitPrice,
    quantity: raw.quantity,
    total: raw.total,
    availableStock: raw.availableStock,
  };
}

/**
 * Normalize a server-mapped challan response to the client's Challan shape.
 * Mainly: uppercase the status enum.
 * Exported so other services (dashboard) can reuse it.
 */
export function mapChallan(raw: unknown): Challan {
  const r = raw as MappedServerChallan;
  return {
    id: r.id,
    challanNumber: r.challanNumber ?? '',
    customerId: r.customerId ?? '',
    customerName: r.customerName ?? '',
    customerBusiness: r.customerBusiness ?? '',
    status: (String(r.status ?? 'DRAFT').toUpperCase()) as ChallanStatus,
    items: Array.isArray(r.items) ? r.items.map(mapChallanItem) : [],
    totalQuantity: Number(r.totalQuantity ?? 0),
    totalAmount: Number(r.totalAmount ?? 0),
    notes: r.notes,
    createdBy: r.createdBy ?? '',
    createdByName: r.createdByName ?? '',
    createdAt: r.createdAt ?? '',
    updatedAt: r.updatedAt ?? '',
    confirmedAt: r.confirmedAt,
    cancelledAt: r.cancelledAt,
  };
}

export const challansService = {
  getAll: async (filters?: ChallanFilters): Promise<PaginatedResponse<Challan>> => {
    const params = cleanQueryParams(filters);
    const response = await api.get('/challans', { params });
    const paginated = normalizePaginated<unknown>(unwrapData(response));
    return { ...paginated, data: paginated.data.map(mapChallan) };
  },

  getById: async (id: string): Promise<Challan> => {
    const response = await api.get(`/challans/${id}`);
    return mapChallan(unwrapData(response));
  },

  create: async (input: CreateChallanInput): Promise<Challan> => {
    // Server always creates as DRAFT; status field only controls whether we confirm after.
    const { status, ...payload } = input;
    const response = await api.post('/challans', payload);
    const challan = mapChallan(unwrapData(response));

    if (status === 'CONFIRMED') {
      return challansService.confirm(challan.id);
    }

    return challan;
  },

  confirm: async (id: string): Promise<Challan> => {
    const response = await api.post(`/challans/${id}/confirm`);
    return mapChallan(unwrapData(response));
  },

  cancel: async (id: string): Promise<Challan> => {
    const response = await api.post(`/challans/${id}/cancel`);
    return mapChallan(unwrapData(response));
  },
};
