import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService, type CreateUserInput } from '@/services/users.service';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => usersService.getAll(),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateUserInput) => usersService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
