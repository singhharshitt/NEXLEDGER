import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { challansService } from '@/services/challans.service';
import type { ChallanFilters, CreateChallanInput } from '@/types';

export function useChallans(filters?: ChallanFilters) {
  return useQuery({
    queryKey: ['challans', filters],
    queryFn: () => challansService.getAll(filters),
  });
}

export function useChallan(id: string) {
  return useQuery({
    queryKey: ['challans', id],
    queryFn: () => challansService.getById(id),
    enabled: !!id,
  });
}

export function useCreateChallan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateChallanInput) => challansService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challans'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useConfirmChallan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => challansService.confirm(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['challans'] });
      queryClient.invalidateQueries({ queryKey: ['challans', id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useCancelChallan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => challansService.cancel(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['challans'] });
      queryClient.invalidateQueries({ queryKey: ['challans', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
