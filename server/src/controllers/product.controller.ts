import type { Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import type { AuthenticatedRequest } from "../types/common";
import * as productRepo from "../repositories/product.repository";
import { conflict, notFound } from "../utils/errors";
import { mapProduct, mapStockMovement, toDbMovementType } from "../utils/mappers";
import { paginatedResponse } from "../utils/pagination";

export const listProducts = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await productRepo.listProducts(req.query as Record<string, unknown>);
  res.json(
    paginatedResponse(
      result.rows.map(mapProduct),
      result.total,
      result.page,
      result.limit
    )
  );
});

export const getProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const product = await productRepo.findProductById(req.params.id);
  if (!product) throw notFound("Product");
  res.json(mapProduct(product));
});

export const createProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const existing = await productRepo.findProductBySku(req.body.sku);
  if (existing) throw conflict("SKU already exists");
  const product = await productRepo.createProduct(req.body);
  res.status(201).json(mapProduct(product));
});

export const updateProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (req.body.sku) {
    const existing = await productRepo.findProductBySku(req.body.sku);
    if (existing && existing.id !== req.params.id) throw conflict("SKU already exists");
  }
  const product = await productRepo.updateProduct(req.params.id, req.body);
  if (!product) throw notFound("Product");
  res.json(mapProduct(product));
});

export const getCategories = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const categories = await productRepo.getCategories();
  res.json(categories);
});

export const getStockMovements = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const product = await productRepo.findProductById(req.params.id);
  if (!product) throw notFound("Product");
  const movements = await productRepo.listStockMovements(req.params.id);
  res.json(movements.map(mapStockMovement));
});

export const adjustStockByProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { type, quantity, reason } = req.body;
  const movementType = toDbMovementType(type);
  const result = await productRepo.adjustStock(
    req.params.id,
    quantity,
    movementType,
    reason,
    req.user!.id
  );
  res.status(201).json(
    mapStockMovement({
      ...result.movement,
      product_name: result.productName,
      created_by_name: result.createdByName,
    })
  );
});

export const listInventory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await productRepo.listProducts(req.query as Record<string, unknown>);
  res.json(
    paginatedResponse(
      result.rows.map(mapProduct),
      result.total,
      result.page,
      result.limit
    )
  );
});

export const adjustStock = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { productId, type, quantity, reason } = req.body;
  const movementType = toDbMovementType(type);
  const result = await productRepo.adjustStock(
    productId,
    quantity,
    movementType,
    reason,
    req.user!.id
  );
  res.status(201).json(
    mapStockMovement({
      ...result.movement,
      product_name: result.productName,
      created_by_name: result.createdByName,
    })
  );
});

export const listAllMovements = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const movements = await productRepo.listAllMovements(20);
  res.json(movements.map(mapStockMovement));
});

export const listLowStock = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const result = await productRepo.listProducts({ stockStatus: "low", page: 1, limit: 100 });
  res.json({ success: true, data: result.rows.map(mapProduct) });
});
