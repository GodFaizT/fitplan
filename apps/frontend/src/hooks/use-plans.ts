'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { qk } from '@/lib/query-keys';
import type { PlanExercise, WorkoutDay, WorkoutPlan } from '@/lib/types';

export function usePlans() {
  return useQuery({
    queryKey: qk.plans(),
    queryFn: () => api.get<WorkoutPlan[]>('/plans'),
  });
}

export function usePlan(id: string) {
  return useQuery({
    queryKey: qk.plan(id),
    queryFn: () => api.get<WorkoutPlan>(`/plans/${id}`),
    enabled: !!id,
  });
}

export function usePlanMutations(planId?: string) {
  const qc = useQueryClient();
  const invalidatePlan = () => {
    if (planId) void qc.invalidateQueries({ queryKey: qk.plan(planId) });
    void qc.invalidateQueries({ queryKey: qk.plans() });
  };

  return {
    createPlan: useMutation({
      mutationFn: (body: { name: string }) =>
        api.post<WorkoutPlan>('/plans', body),
      onSuccess: () => qc.invalidateQueries({ queryKey: qk.plans() }),
    }),
    updatePlan: useMutation({
      mutationFn: ({ id, body }: { id: string; body: Partial<WorkoutPlan> }) =>
        api.patch<WorkoutPlan>(`/plans/${id}`, body),
      onSuccess: invalidatePlan,
    }),
    deletePlan: useMutation({
      mutationFn: (id: string) => api.del(`/plans/${id}`),
      onSuccess: () => qc.invalidateQueries({ queryKey: qk.plans() }),
    }),
    addDay: useMutation({
      mutationFn: ({ id, body }: { id: string; body: { label: string; title?: string } }) =>
        api.post<WorkoutDay>(`/plans/${id}/days`, body),
      onSuccess: invalidatePlan,
    }),
    updateDay: useMutation({
      mutationFn: ({ id, body }: { id: string; body: Partial<WorkoutDay> }) =>
        api.patch<WorkoutDay>(`/days/${id}`, body),
      onSuccess: invalidatePlan,
    }),
    deleteDay: useMutation({
      mutationFn: (id: string) => api.del(`/days/${id}`),
      onSuccess: invalidatePlan,
    }),
    addExercise: useMutation({
      mutationFn: ({ dayId, body }: { dayId: string; body: Partial<PlanExercise> }) =>
        api.post<PlanExercise>(`/days/${dayId}/exercises`, body),
      onSuccess: invalidatePlan,
    }),
    updateExercise: useMutation({
      mutationFn: ({ id, body }: { id: string; body: Partial<PlanExercise> }) =>
        api.patch<PlanExercise>(`/exercises/${id}`, body),
      onSuccess: invalidatePlan,
    }),
    deleteExercise: useMutation({
      mutationFn: (id: string) => api.del(`/exercises/${id}`),
      onSuccess: invalidatePlan,
    }),
    reorderExercises: useMutation({
      mutationFn: ({ dayId, ids }: { dayId: string; ids: string[] }) =>
        api.post(`/days/${dayId}/reorder-exercises`, { ids }),
      onSuccess: invalidatePlan,
    }),
    reorderDays: useMutation({
      mutationFn: ({ id, ids }: { id: string; ids: string[] }) =>
        api.post(`/plans/${id}/reorder-days`, { ids }),
      onSuccess: invalidatePlan,
    }),
    share: useMutation({
      mutationFn: (id: string) =>
        api.post<{ shareCode: string }>(`/plans/${id}/share`),
      onSuccess: invalidatePlan,
    }),
    join: useMutation({
      mutationFn: (code: string) =>
        api.post<WorkoutPlan>('/plans/join', { code }),
      onSuccess: () => qc.invalidateQueries({ queryKey: qk.plans() }),
    }),
  };
}
