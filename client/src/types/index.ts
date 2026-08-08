/* ============================================================
   NEXLEDGER TYPE DEFINITIONS
   ============================================================ */

// ── Roles ──
export type Role = 'admin' | 'sales' | 'warehouse' | 'accounts';

// ── User ──
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  createdAt: string;
}

// ── Auth ──
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ── Customers ──
export type CustomerType = 'retailer' | 'wholesaler' | 'distributor';
export type CustomerStatus = 'lead' | 'active' | 'inactive';

export interface Customer {
  id: string;
  name: string;
  businessName: string;
  type: CustomerType;
  status: CustomerStatus;
  email: string;
  mobile: string;
  gst?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  followUpDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerFollowUp {
  id: string;
  customerId: string;
  date: string;
  notes: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

export interface CreateCustomerInput {
  name: string;
  businessName: string;
  type: CustomerType;
  status: CustomerStatus;
  email: string;
  mobile: string;
  gst?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  followUpDate?: string;
  notes?: string;
}

// ── Products ──
export type StockStatus = 'healthy' | 'low' | 'out';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  description?: string;
  unitPrice: number;
  currentStock: number;
  minStock: number;
  unit: string;
  warehouse: string;
  status: StockStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  name: string;
  sku: string;
  category: string;
  description?: string;
  unitPrice: number;
  minStock: number;
  unit: string;
  warehouse: string;
}

// ── Stock Movements ──
export type StockMovementType = 'in' | 'out' | 'adjustment';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: StockMovementType;
  quantity: number;
  reason: string;
  reference?: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

export interface CreateStockMovementInput {
  productId: string;
  type: StockMovementType;
  quantity: number;
  reason: string;
}

// ── Challans ──
export type ChallanStatus = 'draft' | 'confirmed' | 'cancelled';

export interface ChallanItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  total: number;
  availableStock?: number;
}

export interface Challan {
  id: string;
  challanNumber: string;
  customerId: string;
  customerName: string;
  customerBusiness: string;
  status: ChallanStatus;
  items: ChallanItem[];
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

export interface CreateChallanInput {
  customerId: string;
  items: {
    productId: string;
    quantity: number;
  }[];
  notes?: string;
  status: 'draft' | 'confirmed';
}

// ── Dashboard ──
export interface DashboardStats {
  totalCustomers: number;
  totalProducts: number;
  lowStockItems: number;
  draftChallans: number;
}

export interface DashboardActivity {
  id: string;
  type: 'customer_created' | 'challan_created' | 'challan_confirmed' | 'stock_adjusted' | 'product_created' | 'followup_added';
  description: string;
  user: string;
  timestamp: string;
}

export interface StockChartData {
  date: string;
  inward: number;
  outward: number;
}

// ── API ──
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ── Filters ──
export interface CustomerFilters {
  search?: string;
  status?: CustomerStatus | 'all';
  type?: CustomerType | 'all';
  followUpOverdue?: boolean;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  stockStatus?: StockStatus | 'all';
}

export interface ChallanFilters {
  search?: string;
  status?: ChallanStatus | 'all';
  dateFrom?: string;
  dateTo?: string;
}
