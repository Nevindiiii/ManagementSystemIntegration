import { useQuery } from '@tanstack/react-query';
import { Product, productApi } from '@/apis/product';

// Query keys
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...productKeys.lists(), { filters }] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: number) => [...productKeys.details(), id] as const,
};

// React Query hooks with pagination
export function useProducts(skip = 0, limit = 10) {
  return useQuery({
    queryKey: [...productKeys.lists(), skip, limit],
    queryFn: () => productApi.fetchProducts(skip, limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook to get product by ID (for details view)
export function useProduct(id: number) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productApi.fetchProductById(id),
    enabled: !!id,
  });
}