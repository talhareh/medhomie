import { useQuery } from '@tanstack/react-query';
import api from '../utils/axios';
import { User } from '../types/auth';

export const useInstructors = () => {
  return useQuery({
    queryKey: ['instructors'],
    queryFn: async () => {
      const response = await api.get<User[]>('/users', {
        params: { role: 'instructor' }
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    cacheTime: 30 * 60 * 1000, // Keep data in cache for 30 minutes
  });
};
