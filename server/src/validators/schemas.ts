import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const uuidParamSchema = z.object({
  id: z.string().uuid("Invalid ID"),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const createUserSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS", "admin", "sales", "warehouse", "accounts"]),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
  role: z.enum(["ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS", "admin", "sales", "warehouse", "accounts"]).optional(),
  isActive: z.boolean().optional(),
});

export const createCustomerSchema = z.object({
  name: z.string().min(1).max(255),
  businessName: z.string().min(1).max(255),
  type: z.enum(["retailer", "wholesaler", "distributor", "RETAIL", "WHOLESALE", "DISTRIBUTOR"]),
  status: z.enum(["lead", "active", "inactive", "LEAD", "ACTIVE", "INACTIVE"]),
  email: z.string().email().optional().or(z.literal("")),
  mobile: z.string().min(10).max(20),
  gst: z.string().optional(),
  address: z.string().default(""),
  city: z.string().default(""),
  state: z.string().default(""),
  pincode: z.string().default(""),
  followUpDate: z.string().optional(),
  notes: z.string().optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const createFollowUpSchema = z.object({
  date: z.string().min(1),
  notes: z.string().min(1),
});

export const createProductSchema = z.object({
  name: z.string().min(1).max(255),
  sku: z.string().min(1).max(100),
  category: z.string().min(1).max(100),
  description: z.string().optional(),
  unitPrice: z.number().min(0),
  minStock: z.number().int().min(0).default(0),
  unit: z.string().default("pcs"),
  warehouse: z.string().default("Main"),
});

export const updateProductSchema = createProductSchema.partial();

export const stockAdjustSchema = z.object({
  productId: z.string().uuid(),
  type: z.enum(["in", "out", "IN", "OUT"]),
  quantity: z.number().int().positive(),
  reason: z.string().min(1),
});

export const productStockAdjustSchema = z.object({
  type: z.enum(["in", "out", "IN", "OUT"]),
  quantity: z.number().int().positive(),
  reason: z.string().min(1),
});

export const createChallanSchema = z.object({
  customerId: z.string().uuid(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
  notes: z.string().optional(),
  status: z.enum(["draft", "confirmed", "DRAFT", "CONFIRMED"]).optional().default("draft"),
});

export const updateChallanSchema = z.object({
  customerId: z.string().uuid().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1)
    .optional(),
  notes: z.string().optional(),
});

export const customerListQuerySchema = paginationQuerySchema.extend({
  status: z.string().optional(),
  type: z.string().optional(),
  followUpOverdue: z.coerce.boolean().optional(),
});

export const productListQuerySchema = paginationQuerySchema.extend({
  category: z.string().optional(),
  stockStatus: z.string().optional(),
  lowStock: z.coerce.boolean().optional(),
  outOfStock: z.coerce.boolean().optional(),
});

export const challanListQuerySchema = paginationQuerySchema.extend({
  status: z.string().optional(),
  customerId: z.string().uuid().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});
