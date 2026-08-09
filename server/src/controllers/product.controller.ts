import type { Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import type { AuthenticatedRequest } from "../types/common";
import * as productsService from "../services/products.service";
import * as stockService from "../services/stock.service";
import { mapProduct, mapStockMovement, toDbMovementType } from "../utils/mappers";
import { paginatedResponse } from "../utils/pagination";

// ─── Controllers ───────────────────────────────────────────────

/**
 * GET /api/products
 * Role: ADMIN, SALES, WAREHOUSE, ACCOUNTS (varies per matrix)
 */
export const listProducts = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await productsService.listProducts(req.query);

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
  const product = await productsService.getProductById(req.params.id as string);

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
  const product = await productsService.createProduct(req.body, req.user!.userId);

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
  const product = await productsService.updateProduct(req.params.id as string, req.body);

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
  const categories = await productsService.getCategories();

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
  const movements = await productsService.getStockMovements(req.params.id as string);

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
  const { type, quantity, notes } = req.body as { type: 'IN' | 'OUT'; quantity: number; notes?: string };
  const movementType = toDbMovementType(type);

  const result = await stockService.adjustStock(
    req.params.id as string,
    { type: movementType as 'IN' | 'OUT', quantity, notes },
    req.user!.userId
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
  const result = await stockService.listStock(req.query);

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
  const { productId, type, quantity, notes } = req.body as {
    productId: string;
    type: 'IN' | 'OUT';
    quantity: number;
    notes?: string;
  };
  const movementType = toDbMovementType(type);

  const result = await stockService.adjustStock(
    productId,
    { type: movementType as 'IN' | 'OUT', quantity, notes },
    req.user!.userId
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
  const movements = await stockService.listAllMovements(20);

  res.status(200).json({
    success: true,
    data: movements.map(mapStockMovement),
  });
});

/**
 * GET /api/stock/low
 * Returns all low-stock and out-of-stock products.
 * Role: ADMIN, WAREHOUSE
 */
export const listLowStock = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const rows = await stockService.getLowStockProducts();

  res.status(200).json({
    success: true,
    data: rows.map(mapProduct),
  });
});
