'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { qk } from '@/lib/query-keys';
import type { CatalogFood, SavedFood } from '@/lib/types';

export function useSavedFoods(search: string) {
  return useQuery({
    queryKey: qk.foods(search),
    queryFn: () =>
      api.get<SavedFood[]>(
        `/foods${search ? `?search=${encodeURIComponent(search)}` : ''}`,
      ),
  });
}

/** Catálogo global de alimentos comuns predefinidos. */
export function useFoodLibrary(search: string) {
  return useQuery({
    queryKey: ['food-library', search],
    queryFn: () =>
      api.get<CatalogFood[]>(
        `/foods/library${search ? `?search=${encodeURIComponent(search)}` : ''}`,
      ),
    staleTime: 1000 * 60 * 60,
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
