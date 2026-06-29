'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { qk } from '@/lib/query-keys';
import type { CardioSession } from '@/lib/types';

export interface NewCardio {
  date: string;
  type: string;
  durationMin: number;
  distanceKm?: number;
  calories?: number;
  note?: string;
}

export function useCardio() {
  return useQuery({
    queryKey: qk.cardio(),
    queryFn: () => api.get<CardioSession[]>('/cardio'),
  });
}

export function useCardioMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: qk.cardio() });

  const create = useMutation({
    mutationFn: (body: NewCardio) => api.post<CardioSession>('/cardio', body),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.del(`/cardio/${id}`),
    onSuccess: invalidate,
  });

  return { create, remove };
}
