import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

export const authUserKeys = {
  all: ['authUsers'] as const,
  lists: () => [...authUserKeys.all, 'list'] as const,
  list: (page:number, limit:number) => [...authUserKeys.lists(), { page, limit }] as const
};

export async function fetchAuthUsers(page=1, limit=10) {
  const res = await axios.get(`${API_BASE}/auth/users?page=${page}&limit=${limit}`);
  return res.data;
}

export function useAuthUsers(page=1, limit=10) {
  return useQuery({
    queryKey: authUserKeys.list(page, limit),
    queryFn: () => fetchAuthUsers(page, limit),
    staleTime: 1000 * 60 * 2
  });
}

export default useAuthUsers;
