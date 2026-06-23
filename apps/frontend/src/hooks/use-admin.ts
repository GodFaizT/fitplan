'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  approved: boolean;
  createdAt: string;
}

export function useAdminUsers(pendingOnly = true) {
  return useQuery({
    queryKey: ['admin-users', pendingOnly],
    queryFn: () =>
      api.get<AdminUser[]>(`/admin/users${pendingOnly ? '?pending=true' : ''}`),
  });
}

export function useAdminMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-users'] });
  return {
    approve: useMutation({
      mutationFn: (id: string) => api.post(`/admin/users/${id}/approve`),
      onSuccess: invalidate,
    }),
    reject: useMutation({
      mutationFn: (id: string) => api.post(`/admin/users/${id}/reject`),
      onSuccess: invalidate,
    }),
  };
}
