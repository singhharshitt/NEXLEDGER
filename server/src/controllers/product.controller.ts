import type { Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import type { AuthenticatedRequest } from "../types/common";
import * as productRepo from "../repositories/product.repository";
import { conflict, notFound } from "../utils/errors";
import { mapProduct, mapStockMovement, toDbMovementType } from "../utils/mappers";
import { paginatedResponse } from "../utils/pagination";
import { z } from "zod";

// ─── Validation Schemas ────────────────────────────────────────

const productListSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  search: z.string().optional(),
  category: z.string().optional(),
  stockStatus: z.enum(["low", "out_of_stock", "normal"]).optional(),
  sort_by: z.enum(["product_name", "sku", "category", "unit_price", "current_stock", "created_at"]).optional().default("created_at"),
  sort_order: z.enum(["asc", "desc"]).optional().default("desc"),
});

const productCreateSchema = z.object({
  product_name: z.string().min(1).max(200),
  sku: z.string().min(1).max(50),
  category: z.string().min(1).max(100),
  unit_price: z.number().nonnegative(),
  current_stock: z.number().int().nonnegative().optional().default(0),
  minimum_stock: z.number().int().nonnegative().optional().default(0),
  warehouse_location: z.string().optional(),
});

const productUpdateSchema = productCreateSchema.partial().omit({ current_stock: true }); // stock never updated via product update

const stockAdjustSchema = z.object({
  type: z.enum(["IN", "OUT"]),
  quantity: z.number().int().positive(),
  reason: z.string().min(1),
});

const adjustStockBodySchema = stockAdjustSchema.extend({
  productId: z.string().uuid(),
});

// ─── Controllers ───────────────────────────────────────────────

/**
 * GET /api/products
 * Role: ADMIN, SALES, WAREHOUSE, ACCOUNTS (varies per matrix)
 */
export const listProducts = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const query = productListSchema.parse(req.query);
  const result = await productRepo.listProducts(query);

  res.status(200).json({
    success: true,
    data: paginatedResponse(
      result.rows.map(mapProduct),
      result.total,
      result.page,
      result.limit
    ),
  });
});

/**
 * GET /api/products/:id
 * Role: ADMIN, SALES, WAREHOUSE, ACCOUNTS
 */
export const getProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const product = await productRepo.findProductById(req.params.id);
  if (!product) throw notFound("Product not found");

  res.status(200).json({
    success: true,
    data: mapProduct(product),
  });
});

/**
 * POST /api/products
 * Role: ADMIN only
 */
export const createProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const payload = productCreateSchema.parse(req.body);

  const existing = await productRepo.findProductBySku(payload.sku);
  if (existing) throw conflict("A product with this SKU already exists");

  const product = await productRepo.createProduct(payload);

  res.status(201).json({
    success: true,
    data: mapProduct(product),
  });
});

/**
 * PUT /api/products/:id
 * Role: ADMIN, WAREHOUSE (limited fields)
 */
export const updateProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const payload = productUpdateSchema.parse(req.body);

  if (payload.sku) {
    const existing = await productRepo.findProductBySku(payload.sku);
    if (existing && existing.id !== req.params.id) {
      throw conflict("Another product already uses this SKU");
    }
  }

  const product = await productRepo.updateProduct(req.params.id, payload);
  if (!product) throw notFound("Product not found");

  res.status(200).json({
    success: true,
    data: mapProduct(product),
  });
});

/**
 * GET /api/products/categories
 * Returns distinct categories
 */
export const getCategories = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const categories = await productRepo.getCategories(); // returns string[]

  res.status(200).json({
    success: true,
    data: categories,
  });
});

/**
 * GET /api/products/:id/stock-movements
 * Role: ADMIN, WAREHOUSE
 */
export const getStockMovements = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const product = await productRepo.findProductById(req.params.id);
  if (!product) throw notFound("Product not found");

  const movements = await productRepo.listStockMovements(req.params.id);

  res.status(200).json({
    success: true,
    data: movements.map(mapStockMovement),
  });
});

/**
 * POST /api/products/:id/stock
 * Adjust stock for a specific product (IN/OUT)
 * Role: ADMIN, WAREHOUSE
 */
export const adjustStockByProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { type, quantity, reason } = stockAdjustSchema.parse(req.body);
  const movementType = toDbMovementType(type);

  const result = await productRepo.adjustStock(
    req.params.id,
    quantity,
    movementType,
    reason,
    req.user!.id
  );

  res.status(201).json({
    success: true,
    data: mapStockMovement({
      ...result.movement,
      product_name: result.productName,
      created_by_name: result.createdByName,
    }),
  });
});

/**
 * GET /api/inventory
 * Alias for listing all products with stock info (same as listProducts).
 * Role: ADMIN, WAREHOUSE
 */
export const listInventory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  // Reuse the product list with validated query
  const query = productListSchema.parse(req.query);
  const result = await productRepo.listProducts(query);

  res.status(200).json({
    success: true,
    data: paginatedResponse(
      result.rows.map(mapProduct),
      result.total,
      result.page,
      result.limit
    ),
  });
});

/**
 * POST /api/stock/adjust
 * Adjust stock by providing productId in body.
 * Role: ADMIN, WAREHOUSE
 */
export const adjustStock = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { productId, type, quantity, reason } = adjustStockBodySchema.parse(req.body);
  const movementType = toDbMovementType(type);

  const result = await productRepo.adjustStock(
    productId,
    quantity,
    movementType,
    reason,
    req.user!.id
  );

  res.status(201).json({
    success: true,
    data: mapStockMovement({
      ...result.movement,
      product_name: result.productName,
      created_by_name: result.createdByName,
    }),
  });
});

/**
 * GET /api/stock/movements
 * Get recent stock movements across all products.
 * Role: ADMIN, WAREHOUSE
 */
export const listAllMovements = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const movements = await productRepo.listAllMovements(20);

  res.status(200).json({
    success: true,
    data: movements.map(mapStockMovement),
  });
});


export const listLowStock = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const result = await productRepo.listProducts({ stockStatus: "low", page: 1, limit: 100 });
  // Low stock is a small, non-paginated list
  res.status(200).json({
    success: true,
    data: result.rows.map(mapProduct),
  });
});