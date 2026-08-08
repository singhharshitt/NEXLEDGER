import * as productRepo from '../repositories/product.repository';
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

export async function adjustStock(
  productId: string,
  data: { type: 'IN' | 'OUT'; quantity: number; notes?: string },
  userId: string
) {
  return productRepo.adjustStock(
    productId,
    data.quantity,
    data.type,
    data.notes ?? '',
    userId
  );
}

export async function getStockMovements(productId: string) {
  return productRepo.listStockMovements(productId);
}

export async function listStock(query: Record<string, unknown>) {
  const result = await productRepo.listProducts(query);
  return {
    ...result,
    rows: result.rows.map(withStockStatus),
  };
}

export async function getLowStockProducts() {
  const result = await productRepo.listProducts({ stockStatus: 'low', page: 1, limit: 500 });
  const outResult = await productRepo.listProducts({ stockStatus: 'out', page: 1, limit: 500 });
  return [...result.rows, ...outResult.rows].map(withStockStatus);
}

export async function listAllMovements(limit = 20) {
  return productRepo.listAllMovements(limit);
}
