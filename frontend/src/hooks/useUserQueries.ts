import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User } from '@/components/data-table/columns';
import { userApi } from '@/apis/user';
import { toast } from 'sonner';

// Query keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
};

// React Query hooks
export function useUsers(page = 1, limit = 10) {
  return useQuery({
    queryKey: [...userKeys.lists(), page, limit],
    queryFn: () => userApi.fetchUsers(page, limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userApi.createUser,
    onSuccess: (newUser) => {
      // Show success message
      toast.success('User created successfully!');
      
      // Invalidate all user queries to refetch with pagination
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: (error: any) => {
      console.error('Error creating user:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create user';
      toast.error(`Error creating user: ${errorMessage}`);
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userApi.updateUser,
    onSuccess: (updatedUser) => {
      // Show success message
      toast.success('User updated successfully!');
      
      // Invalidate all user queries to refetch with pagination
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: (error: any) => {
      console.error('Error updating user:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update user';
      toast.error(`Error updating user: ${errorMessage}`);
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userApi.deleteUser,
    onSuccess: (_, deletedId) => {
      // Show success message
      toast.success('User deleted successfully!');
      
      // Invalidate all user queries to refetch with pagination
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: (error: any) => {
      console.error('Error deleting user:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete user';
      toast.error(`Error deleting user: ${errorMessage}`);
    },
  });
}

// Hook to get user by ID (for details view)
export function useUser(id: number) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userApi.fetchUserById(id),
    enabled: !!id,
  });
}