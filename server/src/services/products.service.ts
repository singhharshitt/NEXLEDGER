import * as productRepo from '../repositories/product.repository';
import { notFound, conflict } from '../utils/errors';
import { computeStockStatus } from '../utils/mappers';

function withStockStatus(product: Record<string, unknown>) {
  return {
    ...product,
    stockStatus: computeStockStatus(
      Number(product.current_stock),
      Number(product.minimum_stock)
    ),
  };
}

export async function listProducts(query: Record<string, unknown>) {
  const result = await productRepo.listProducts(query);
  return {
    ...result,
    rows: result.rows.map(withStockStatus),
  };
}

export async function getProductById(id: string) {
  const product = await productRepo.findProductById(id);
  if (!product) throw notFound('Product');
  return withStockStatus(product);
}

export async function createProduct(data: Record<string, unknown>, createdBy: string) {
  const existing = await productRepo.findProductBySku(String(data.sku));
  if (existing) throw conflict('A product with this SKU already exists');
  const product = await productRepo.createProduct({ ...data, createdBy });
  return withStockStatus(product);
}

export async function updateProduct(id: string, data: Record<string, unknown>) {
  if (data.sku) {
    const existing = await productRepo.findProductBySku(String(data.sku));
    if (existing && existing.id !== id) throw conflict('Another product already uses this SKU');
  }
  const product = await productRepo.updateProduct(id, data);
  if (!product) throw notFound('Product');
  return withStockStatus(product);
}

export async function getCategories(): Promise<string[]> {
  return productRepo.getCategories();
}

export async function getStockMovements(productId: string) {
  const product = await productRepo.findProductById(productId);
  if (!product) throw notFound('Product');
  return productRepo.listStockMovements(productId);
}
