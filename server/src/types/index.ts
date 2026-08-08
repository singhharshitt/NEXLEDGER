// src/types/index.ts — shared domain types (design spec)

export type Role = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';
export type CustomerStatus = 'LEAD' | 'ACTIVE' | 'INACTIVE';
export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
export type StockMovementType = 'IN' | 'OUT';
export type ChallanStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';
export type StockStatus = 'healthy' | 'low' | 'out';

export interface SafeUser {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface JwtPayload {
  userId: string;
  role: Role;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
  category: string;
  unit: string;
  unit_price: string;
  current_stock: number;
  minimum_stock: number;
  stockStatus: StockStatus;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  business_name: string;
  contact_name: string;
  email?: string;
  mobile: string;
  address?: string;
  city?: string;
  state?: string;
  gstin?: string;
  type: CustomerType;
  status: CustomerStatus;
  credit_limit: string;
  notes?: string;
  follow_up_date?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerFollowUp {
  id: string;
  customer_id: string;
  notes: string;
  follow_up_date?: string;
  completed: boolean;
  created_by?: string;
  created_at: string;
}

export interface StockMovement {
  id: string;
  product_id: string;
  type: StockMovementType;
  quantity: number;
  notes?: string;
  reference_id?: string;
  created_by?: string;
  created_at: string;
}

export interface Challan {
  id: string;
  challan_number: string;
  customer_id: string;
  status: ChallanStatus;
  notes?: string;
  total_quantity: number;
  total_amount: string;
  confirmed_at?: string;
  cancelled_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  items?: ChallanItem[];
}

export interface ChallanItem {
  id: string;
  challan_id: string;
  product_id: string;
  product_name_snapshot: string;
  sku_snapshot: string;
  unit_price_snapshot: string;
  quantity: number;
  total_price: string;
}

export interface DashboardStats {
  totalCustomers: number;
  totalProducts: number;
  lowStockItems: number;
  outOfStockCount: number;
  draftChallans: number;
  confirmedChallans: number;
}
