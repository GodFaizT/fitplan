'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { qk } from '@/lib/query-keys';
import type { BodyMeasurement } from '@/lib/types';

export function useMeasurements() {
  return useQuery({
    queryKey: qk.measurements(),
    queryFn: () => api.get<BodyMeasurement[]>('/measurements'),
  });
}

export function useMeasurementMutations() {
  const qc = useQueryClient();
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: qk.measurements() });

  const upsert = useMutation({
    mutationFn: (body: { date: string; type: string; value: number }) =>
      api.post<BodyMeasurement>('/measurements', body),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.del(`/measurements/${id}`),
    onSuccess: invalidate,
  });

  return { upsert, remove };
}
