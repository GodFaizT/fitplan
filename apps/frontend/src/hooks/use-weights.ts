'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { qk } from '@/lib/query-keys';
import type { WeightEntry } from '@/lib/types';

export function useWeights() {
  return useQuery({
    queryKey: qk.weights(),
    queryFn: () => api.get<WeightEntry[]>('/weights'),
  });
}

export function useWeightMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: qk.weights() });

  const upsert = useMutation({
    mutationFn: (body: { date: string; weightKg: number }) =>
      api.post<WeightEntry>('/weights', body),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.del(`/weights/${id}`),
    onSuccess: invalidate,
  });

  return { upsert, remove };
}
