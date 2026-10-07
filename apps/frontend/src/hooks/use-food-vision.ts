'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { DetectedFood } from '@/lib/types';

/** A análise por foto só está disponível se o backend tiver a chave configurada. */
export function useFoodVisionEnabled() {
  return useQuery({
    queryKey: ['food-vision-status'],
    queryFn: () => api.get<{ enabled: boolean }>('/food-vision/status'),
    staleTime: 5 * 60_000,
  });
}

export function useAnalyzeFood() {
  return useMutation({
    mutationFn: (dataUrl: string) =>
      api.post<{ items: DetectedFood[]; model: string }>(
        '/food-vision/analyze',
        { dataUrl },
      ),
  });
}
