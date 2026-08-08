import type {
  Role,
  ClientRole,
  CustomerType,
  CustomerStatus,
  MovementType,
  ChallanStatus,
} from "../types/common";

export function toClientRole(role: Role): ClientRole {
  return role.toLowerCase() as ClientRole;
}

export function toDbRole(role: string): Role {
  return role.toUpperCase() as Role;
}

export function toClientCustomerType(type: CustomerType): string {
  const map: Record<CustomerType, string> = {
    RETAIL: "retailer",
    WHOLESALE: "wholesaler",
    DISTRIBUTOR: "distributor",
  };
  return map[type];
}

export function toDbCustomerType(type: string): CustomerType {
  const map: Record<string, CustomerType> = {
    retailer: "RETAIL",
    retail: "RETAIL",
    wholesaler: "WHOLESALE",
    wholesale: "WHOLESALE",
    distributor: "DISTRIBUTOR",
  };
  const normalized = type.toLowerCase();
  const result = map[normalized];
  if (!result) throw new Error(`Invalid customer type: ${type}`);
  return result;
}

export function toClientCustomerStatus(status: CustomerStatus): string {
  return status.toLowerCase();
}

export function toDbCustomerStatus(status: string): CustomerStatus {
  return status.toUpperCase() as CustomerStatus;
}

export function toClientMovementType(type: MovementType): string {
  return type.toLowerCase();
}

export function toDbMovementType(type: string): MovementType {
  const upper = type.toUpperCase();
  if (upper === "IN" || upper === "OUT") return upper;
  throw new Error(`Invalid movement type: ${type}`);
}

export function toClientChallanStatus(status: ChallanStatus): string {
  return status.toLowerCase();
}

export function toDbChallanStatus(status: string): ChallanStatus {
  return status.toUpperCase() as ChallanStatus;
}

export function computeStockStatus(currentStock: number, minStock: number): string {
  if (currentStock === 0) return "out";
  if (currentStock <= minStock) return "low";
  return "healthy";
}

export function mapUser(row: Record<string, unknown>) {
  return {
    id: row.id,
    full_name: row.full_name,
    email: row.email,
    role: toClientRole(row.role as Role),
    createdAt: (row.created_at as Date).toISOString(),
  };
}

export function mapCustomer(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.contact_name,
    businessName: row.business_name,
    type: toClientCustomerType(row.type as CustomerType),
    status: toClientCustomerStatus(row.status as CustomerStatus),
    email: row.email ?? "",
    mobile: row.mobile,
    gst: row.gstin ?? undefined,
    address: row.address,
    city: row.city,
    state: row.state,
    creditLimit: row.credit_limit,
    followUpDate: row.follow_up_date
      ? new Date(row.follow_up_date as string).toISOString().split("T")[0]
      : undefined,
    notes: row.notes ?? undefined,
    createdAt: (row.created_at as Date).toISOString(),
    updatedAt: (row.updated_at as Date).toISOString(),
  };
}

export function mapProduct(row: Record<string, unknown>) {
  const currentStock = Number(row.current_stock);
  const minStock = Number(row.minimum_stock);
  return {
    id: row.id,
    name: row.name,
    sku: row.sku,
    category: row.category,
    description: row.description ?? undefined,
    unitPrice: Number(row.unit_price),
    currentStock,
    minStock,
    unit: row.unit,
    status: computeStockStatus(currentStock, minStock),
    createdAt: (row.created_at as Date).toISOString(),
    updatedAt: (row.updated_at as Date).toISOString(),
  };
}

export function mapStockMovement(row: Record<string, unknown>) {
  return {
    id: row.id,
    productId: row.product_id,
    productName: row.product_name,
    type: toClientMovementType(row.type as MovementType),
    quantity: row.quantity,
    notes: row.notes,
    referenceId: row.reference_id ?? undefined,
    createdBy: row.created_by,
    createdByName: row.created_by_name,
    createdAt: (row.created_at as Date).toISOString(),
  };
}

export function mapChallanItem(row: Record<string, unknown>) {
  return {
    id: row.id,
    productId: row.product_id,
    productName: row.product_name_snapshot,
    sku: row.sku_snapshot,
    unitPrice: Number(row.unit_price_snapshot),
    quantity: row.quantity,
    total: Number(row.total_price),
    availableStock: row.available_stock !== undefined ? Number(row.available_stock) : undefined,
  };
}

export function mapChallan(row: Record<string, unknown>, items: Record<string, unknown>[] = []) {
  return {
    id: row.id,
    challanNumber: row.challan_number,
    customerId: row.customer_id,
    customerName: row.customer_name,
    customerBusiness: row.customer_business,
    status: toClientChallanStatus(row.status as ChallanStatus),
    items: items.map(mapChallanItem),
    totalQuantity: row.total_quantity,
    totalAmount: Number(row.total_amount),
    notes: row.notes ?? undefined,
    createdBy: row.created_by,
    createdByName: row.created_by_name,
    createdAt: (row.created_at as Date).toISOString(),
    updatedAt: (row.updated_at as Date).toISOString(),
    confirmedAt: row.confirmed_at ? (row.confirmed_at as Date).toISOString() : undefined,
    cancelledAt: row.cancelled_at ? (row.cancelled_at as Date).toISOString() : undefined,
  };
}

export function mapFollowUp(row: Record<string, unknown>) {
  return {
    id: row.id,
    customerId: row.customer_id,
    date: row.follow_up_date
      ? new Date(row.follow_up_date as string).toISOString().split("T")[0]
      : null,
    notes: row.notes,
    createdBy: row.created_by,
    createdByName: row.created_by_name,
    createdAt: (row.created_at as Date).toISOString(),
  };
}
