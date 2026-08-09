/* ============================================================
   NEXLEDGER TYPE DEFINITIONS
   ============================================================ */

// ── Roles ──
export type Role = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';

// ── User ──
// The UI-facing user model (normalized from server's SafeUser).
export interface User {
  id: string;
  name: string;       // mapped from server's full_name
  email: string;
  role: Role;
  avatar?: string;
  createdAt: string;  // mapped from server's created_at
}

// ── Auth ──
export interface LoginCredentials {
  email: string;
  password: string;
}

// Server returns { token, user } where user matches SafeUser shape.
// We normalize it in authService before exposing to the store.
export interface AuthResponse {
  token: string;
  user: User;
}

// Raw server user shape (before normalization)
export interface ServerUser {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ── Customers ──
export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
export type CustomerStatus = 'LEAD' | 'ACTIVE' | 'INACTIVE';

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
  pincode?: string;        // server mapper doesn't include this; treat as optional
  creditLimit?: number;    // server returns creditLimit
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
  pincode?: string;
  followUpDate?: string;
  notes?: string;
}

// ── Products ──
// StockStatus stays lowercase — computed by server, not stored as a DB enum
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
  warehouse?: string;   // server mapProduct doesn't return this; optional
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
export type StockMovementType = 'IN' | 'OUT';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: StockMovementType;
  quantity: number;
  notes: string;        // server returns 'notes'
  referenceId?: string; // server returns 'referenceId'
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

export interface CreateStockMovementInput {
  productId: string;
  type: 'IN' | 'OUT';
  quantity: number;
  reason: string; // used as 'notes' when sent to real server
}

// ── Challans ──
export type ChallanStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

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
  status: 'DRAFT' | 'CONFIRMED';
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
  page?: number;
  limit?: number;
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
  customerId?: string;
  limit?: number;
  sort?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
