'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { qk } from '@/lib/query-keys';
import type { DailyLog, FoodItem, Meal } from '@/lib/types';

export function useDailyLog(date: string) {
  return useQuery({
    queryKey: qk.meals(date),
    queryFn: () => api.get<DailyLog>(`/logs?date=${date}`),
  });
}

export function useMealMutations(date: string) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: qk.meals(date) });

  const addMeal = useMutation({
    mutationFn: (body: { type: string; label?: string }) =>
      api.post<Meal>(`/logs/${date}/meals`, body),
    onSuccess: invalidate,
  });

  const updateMeal = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Meal> }) =>
      api.patch<Meal>(`/meals/${id}`, body),
    onSuccess: invalidate,
  });

  const deleteMeal = useMutation({
    mutationFn: (id: string) => api.del(`/meals/${id}`),
    onSuccess: invalidate,
  });

  const addItem = useMutation({
    mutationFn: ({
      mealId,
      body,
    }: {
      mealId: string;
      body: Omit<FoodItem, 'id' | 'mealId' | 'position'>;
    }) => api.post<FoodItem>(`/meals/${mealId}/items`, body),
    onSuccess: invalidate,
  });

  const updateItem = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<FoodItem> }) =>
      api.patch<FoodItem>(`/items/${id}`, body),
    onSuccess: invalidate,
  });

  const deleteItem = useMutation({
    mutationFn: (id: string) => api.del(`/items/${id}`),
    onSuccess: invalidate,
  });

  return { addMeal, updateMeal, deleteMeal, addItem, updateItem, deleteItem };
}
