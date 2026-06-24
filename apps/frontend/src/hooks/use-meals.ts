'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { qk } from '@/lib/query-keys';
import type { DailyLog, FoodItem, Meal, RecentFood } from '@/lib/types';

export function useDailyLog(date: string) {
  return useQuery({
    queryKey: qk.meals(date),
    queryFn: () => api.get<DailyLog>(`/logs?date=${date}`),
  });
}

/** Alimentos usados recentemente (atalho para re-adicionar). */
export function useRecentFoods() {
  return useQuery({
    queryKey: ['recent-foods'],
    queryFn: () => api.get<RecentFood[]>('/recent-foods'),
    staleTime: 1000 * 60,
  });
}

export function useMealMutations(date: string) {
  const qc = useQueryClient();
  const key = qk.meals(date);
  const invalidate = () => qc.invalidateQueries({ queryKey: key });

  /** Cancela refetches e devolve o estado atual (para rollback). */
  async function snapshot(): Promise<DailyLog | undefined> {
    await qc.cancelQueries({ queryKey: key });
    return qc.getQueryData<DailyLog>(key);
  }
  function rollback(prev?: DailyLog) {
    if (prev) qc.setQueryData(key, prev);
  }
  /** Aplica uma transformação otimista ao registo do dia em cache. */
  function patch(fn: (log: DailyLog) => DailyLog) {
    const prev = qc.getQueryData<DailyLog>(key);
    if (prev) qc.setQueryData(key, fn(prev));
  }

  const addMeal = useMutation({
    mutationFn: (body: { type: string; label?: string }) =>
      api.post<Meal>(`/logs/${date}/meals`, body),
    onSuccess: invalidate,
  });

  const updateMeal = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Meal> }) =>
      api.patch<Meal>(`/meals/${id}`, body),
    onMutate: async ({ id, body }) => {
      const prev = await snapshot();
      patch((log) => ({
        ...log,
        meals: log.meals.map((m) => (m.id === id ? { ...m, ...body } : m)),
      }));
      return { prev };
    },
    onError: (_e, _v, ctx) => rollback(ctx?.prev),
    onSettled: invalidate,
  });

  const deleteMeal = useMutation({
    mutationFn: (id: string) => api.del(`/meals/${id}`),
    onMutate: async (id) => {
      const prev = await snapshot();
      patch((log) => ({ ...log, meals: log.meals.filter((m) => m.id !== id) }));
      return { prev };
    },
    onError: (_e, _v, ctx) => rollback(ctx?.prev),
    onSettled: invalidate,
  });

  const addItem = useMutation({
    mutationFn: ({
      mealId,
      body,
    }: {
      mealId: string;
      body: Omit<FoodItem, 'id' | 'mealId' | 'position'>;
    }) => api.post<FoodItem>(`/meals/${mealId}/items`, body),
    onMutate: async ({ mealId, body }) => {
      const prev = await snapshot();
      const temp: FoodItem = { id: `tmp-${Date.now()}`, mealId, position: 999, ...body };
      patch((log) => ({
        ...log,
        meals: log.meals.map((m) =>
          m.id === mealId ? { ...m, items: [...m.items, temp] } : m,
        ),
      }));
      return { prev };
    },
    onError: (_e, _v, ctx) => rollback(ctx?.prev),
    onSettled: invalidate,
  });

  const updateItem = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<FoodItem> }) =>
      api.patch<FoodItem>(`/items/${id}`, body),
    onSuccess: invalidate,
  });

  const deleteItem = useMutation({
    mutationFn: (id: string) => api.del(`/items/${id}`),
    onMutate: async (id) => {
      const prev = await snapshot();
      patch((log) => ({
        ...log,
        meals: log.meals.map((m) => ({
          ...m,
          items: m.items.filter((it) => it.id !== id),
        })),
      }));
      return { prev };
    },
    onError: (_e, _v, ctx) => rollback(ctx?.prev),
    onSettled: invalidate,
  });

  const copyDay = useMutation({
    mutationFn: (from: string) =>
      api.post<DailyLog>(`/logs/${date}/copy`, { from }),
    onSuccess: invalidate,
  });

  const setWater = useMutation({
    mutationFn: (water: number) =>
      api.patch<{ water: number }>(`/logs/${date}/water`, { water }),
    onMutate: async (water) => {
      const prev = await snapshot();
      patch((log) => ({ ...log, water }));
      return { prev };
    },
    onError: (_e, _v, ctx) => rollback(ctx?.prev),
    onSettled: invalidate,
  });

  return {
    addMeal,
    updateMeal,
    deleteMeal,
    addItem,
    updateItem,
    deleteItem,
    copyDay,
    setWater,
  };
}
