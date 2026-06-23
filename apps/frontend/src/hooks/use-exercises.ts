'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { qk } from '@/lib/query-keys';
import type { LibraryExercise } from '@/lib/types';

export function useExerciseSearch(params: {
  search?: string;
  muscle?: string;
  equipment?: string;
}) {
  const qs = new URLSearchParams();
  if (params.search) qs.set('search', params.search);
  if (params.muscle) qs.set('muscle', params.muscle);
  if (params.equipment) qs.set('equipment', params.equipment);
  const key = qs.toString();
  return useQuery({
    queryKey: qk.exercises(key),
    queryFn: () => api.get<LibraryExercise[]>(`/exercises?${key}`),
  });
}

export function useExerciseFacets() {
  return useQuery({
    queryKey: qk.facets(),
    queryFn: () =>
      api.get<{ muscles: string[]; equipment: string[] }>('/exercises/facets'),
    staleTime: 1000 * 60 * 60,
  });
}
