'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { qk } from '@/lib/query-keys';
import type {
  NewSetLog,
  ProgressionPoint,
  SessionStats,
  WorkoutSession,
} from '@/lib/types';

export interface NewSession {
  planId?: string;
  planName?: string;
  dayLabel?: string;
  durationSec?: number;
  notes?: string;
  sets: NewSetLog[];
}

export function useSessions() {
  return useQuery({
    queryKey: qk.sessions(),
    queryFn: () => api.get<WorkoutSession[]>('/sessions'),
  });
}

export function useSessionStats() {
  return useQuery({
    queryKey: qk.sessionStats(),
    queryFn: () => api.get<SessionStats>('/sessions/stats'),
  });
}

export function useExerciseProgression(name: string | null) {
  return useQuery({
    queryKey: qk.progression(name ?? ''),
    queryFn: () =>
      api.get<ProgressionPoint[]>(
        `/sessions/exercise/${encodeURIComponent(name!)}`,
      ),
    enabled: !!name,
  });
}

export function useSessionMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: qk.sessions() });
    qc.invalidateQueries({ queryKey: qk.sessionStats() });
    qc.invalidateQueries({ queryKey: ['progression'] });
  };

  const create = useMutation({
    mutationFn: (body: NewSession) =>
      api.post<WorkoutSession>('/sessions', body),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.del(`/sessions/${id}`),
    onSuccess: invalidate,
  });

  return { create, remove };
}
