import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useProducts } from '@/hooks/useProducts';
import type { StockMovement } from '@/types';
import api from '@/services/api';

export interface GlobalStockMovement extends StockMovement {
  productName: string;
  productSku: string;
}

export const useGlobalInventoryMovements = () => {
  // Fetch a large number of products to act as our global directory
  const { data: productsData, isLoading: productsLoading } = useProducts({ limit: 999 });
  
  // Extract products array from the paginated response
  const products = productsData?.data ?? [];
  const productIds = useMemo(() => products.map(p => p.id), [products]);
  
  const { data: movements, isLoading: movementsLoading } = useQuery({
    queryKey: ['global-inventory-movements', productIds],
    queryFn: async () => {
      if (productIds.length === 0) return [];
      
      // Batch in chunks of 10 to avoid overwhelming the browser/network limits
      const chunkSize = 10;
      const allMovements: GlobalStockMovement[] = [];
      
      for (let i = 0; i < productIds.length; i += chunkSize) {
        const chunk = productIds.slice(i, i + chunkSize);
        const results = await Promise.all(
          chunk.map(id => api.get(`/products/${id}/stock-movements`))
        );
        
        results.forEach((res, idx) => {
          const product = products[i + idx];
          const productMovements = res.data?.data || res.data || [];
          
          allMovements.push(...productMovements.map((m: any) => ({
            ...m,
            productName: product.name,
            productSku: product.sku,
          })));
        });
      }
      
      return allMovements.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },
    enabled: productIds.length > 0,
    staleTime: 30000, // 30s cache
  });
  
  return { 
    movements: movements ?? [], 
    products,
    isLoading: productsLoading || movementsLoading,
    totalProducts: productIds.length,
  };
};
