import api from './api';
import { unwrapData, normalizePaginated, cleanQueryParams } from '@/lib/api-utils';
import type {
  Customer,
  CustomerType,
  CustomerStatus,
  CustomerFollowUp,
  CreateCustomerInput,
  CustomerFilters,
  PaginatedResponse,
} from '@/types';

/**
 * The server's mapCustomer() in server/src/utils/mappers.ts returns camelCase fields
 * but with legacy lowercase enum values:
 *   type: 'retailer' | 'wholesaler' | 'distributor' (via toClientCustomerType)
 *   status: 'lead' | 'active' | 'inactive' (via toClientCustomerStatus)
 *
 * The client's Customer type expects UPPERCASE enums: 'RETAIL', 'ACTIVE', etc.
 * This mapper normalizes those back to uppercase and ensures all fields are present.
 */
interface ServerMappedCustomer {
  id: string;
  name: string;           // mapped from contact_name
  businessName: string;   // mapped from business_name
  type: string;           // lowercase: 'retailer' | 'wholesaler' | 'distributor'
  status: string;         // lowercase: 'lead' | 'active' | 'inactive'
  email: string;
  mobile: string;
  gst?: string;           // mapped from gstin
  address?: string;
  city?: string;
  state?: string;
  creditLimit?: number;
  followUpDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const TYPE_MAP: Record<string, CustomerType> = {
  retailer: 'RETAIL',
  retail: 'RETAIL',
  wholesaler: 'WHOLESALE',
  wholesale: 'WHOLESALE',
  distributor: 'DISTRIBUTOR',
  // Pass-through for already-uppercase values
  RETAIL: 'RETAIL',
  WHOLESALE: 'WHOLESALE',
  DISTRIBUTOR: 'DISTRIBUTOR',
};

const STATUS_MAP: Record<string, CustomerStatus> = {
  lead: 'LEAD',
  active: 'ACTIVE',
  inactive: 'INACTIVE',
  // Pass-through for already-uppercase values
  LEAD: 'LEAD',
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
};

function mapCustomer(raw: unknown): Customer {
  const r = raw as ServerMappedCustomer;
  return {
    id: r.id,
    name: r.name ?? '',
    businessName: r.businessName ?? '',
    type: (TYPE_MAP[r.type] ?? 'RETAIL') as CustomerType,
    status: (STATUS_MAP[r.status] ?? 'LEAD') as CustomerStatus,
    email: r.email ?? '',
    mobile: r.mobile ?? '',
    gst: r.gst,
    address: r.address ?? '',
    city: r.city ?? '',
    state: r.state ?? '',
    creditLimit: r.creditLimit,
    followUpDate: r.followUpDate,
    notes: r.notes,
    createdAt: r.createdAt ?? '',
    updatedAt: r.updatedAt ?? '',
  };
}

export const customersService = {
  getAll: async (filters?: CustomerFilters): Promise<PaginatedResponse<Customer>> => {
    const response = await api.get('/customers', { params: cleanQueryParams(filters) });
    const paginated = normalizePaginated<unknown>(unwrapData(response));
    return { ...paginated, data: paginated.data.map(mapCustomer) };
  },

  getById: async (id: string): Promise<Customer> => {
    const response = await api.get(`/customers/${id}`);
    return mapCustomer(unwrapData(response));
  },

  create: async (input: CreateCustomerInput): Promise<Customer> => {
    // Server createCustomerSchema expects: name, businessName, gst, type, status, email, mobile, etc.
    // CreateCustomerInput fields already match — 'name' maps to contact_name on server side
    const response = await api.post('/customers', input);
    return mapCustomer(unwrapData(response));
  },

  update: async (id: string, input: Partial<CreateCustomerInput>): Promise<Customer> => {
    const response = await api.put(`/customers/${id}`, input);
    return mapCustomer(unwrapData(response));
  },

  getFollowUps: async (customerId: string): Promise<CustomerFollowUp[]> => {
    const response = await api.get(`/customers/${customerId}/followups`);
    return unwrapData<CustomerFollowUp[]>(response);
  },

  addFollowUp: async (
    customerId: string,
    input: { date: string; notes: string }
  ): Promise<CustomerFollowUp> => {
    const response = await api.post(`/customers/${customerId}/followups`, input);
    return unwrapData<CustomerFollowUp>(response);
  },
};
