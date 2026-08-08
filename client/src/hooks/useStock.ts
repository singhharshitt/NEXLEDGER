import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { stockService } from '@/services/stock.service';
import type { CreateStockMovementInput } from '@/types';

export function useInventory(params?: { search?: string; stockStatus?: string }) {
  return useQuery({
    queryKey: ['stock', 'inventory', params],
    queryFn: () => stockService.getInventory(params),
  });
}

export function useStockMovements() {
  return useQuery({
    queryKey: ['stock', 'movements'],
    queryFn: stockService.getMovements,
  });
}

export function useStockAdjust() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateStockMovementInput) => stockService.adjust(input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
