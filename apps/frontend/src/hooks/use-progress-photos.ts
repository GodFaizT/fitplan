'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { qk } from '@/lib/query-keys';
import type { ProgressPhoto } from '@/lib/types';

export interface NewProgressPhoto {
  date: string;
  note?: string;
  dataUrl: string;
  width?: number;
  height?: number;
}

export function useProgressPhotos() {
  return useQuery({
    queryKey: qk.progressPhotos(),
    queryFn: () => api.get<ProgressPhoto[]>('/progress-photos'),
  });
}

export function useProgressPhotoMutations() {
  const qc = useQueryClient();
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: qk.progressPhotos() });

  const create = useMutation({
    mutationFn: (body: NewProgressPhoto) =>
      api.post<ProgressPhoto>('/progress-photos', body),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.del(`/progress-photos/${id}`),
    onSuccess: invalidate,
  });

  return { create, remove };
}
