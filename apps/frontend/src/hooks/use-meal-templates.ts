'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { qk } from '@/lib/query-keys';
import type { Meal, MealTemplate } from '@/lib/types';

export interface NewTemplateItem {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export function useMealTemplates() {
  return useQuery({
    queryKey: qk.mealTemplates(),
    queryFn: () => api.get<MealTemplate[]>('/meal-templates'),
  });
}

export function useMealTemplateMutations(date?: string) {
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: (body: { name: string; items: NewTemplateItem[] }) =>
      api.post<MealTemplate>('/meal-templates', body),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: qk.mealTemplates() }),
  });

  const apply = useMutation({
    mutationFn: ({
      id,
      type,
      label,
    }: {
      id: string;
      type?: string;
      label?: string;
    }) =>
      api.post<Meal>(`/meal-templates/${id}/apply`, {
        date,
        type,
        label,
      }),
    onSuccess: () => {
      if (date) qc.invalidateQueries({ queryKey: qk.meals(date) });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.del(`/meal-templates/${id}`),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: qk.mealTemplates() }),
  });

  return { create, apply, remove };
}
