'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { qk } from '@/lib/query-keys';
import type { SavedFood } from '@/lib/types';

export function useSavedFoods(search: string) {
  return useQuery({
    queryKey: qk.foods(search),
    queryFn: () =>
      api.get<SavedFood[]>(
        `/foods${search ? `?search=${encodeURIComponent(search)}` : ''}`,
      ),
  });
}

export function useFoodMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['foods'] });

  const create = useMutation({
    mutationFn: (body: Omit<SavedFood, 'id'>) =>
      api.post<SavedFood>('/foods', body),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<SavedFood> }) =>
      api.patch<SavedFood>(`/foods/${id}`, body),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.del(`/foods/${id}`),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
