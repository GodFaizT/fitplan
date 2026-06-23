'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  calculateNutrition,
  type NutritionInput,
  type NutritionResult,
} from '@fitplan/shared';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import type { ApiUser } from '@/lib/types';

/**
 * Calcula os alvos a partir do perfil em memória (instantâneo, sem ida ao
 * servidor — PROJECT.md critério "recalcula tudo instantaneamente"). Devolve
 * null se o perfil ainda não tiver dados suficientes.
 */
export function nutritionFromUser(user: ApiUser | null): NutritionResult | null {
  if (
    !user ||
    !user.sex ||
    user.age == null ||
    user.weightKg == null ||
    user.heightCm == null ||
    !user.activityLevel ||
    !user.goal
  ) {
    return null;
  }
  const input: NutritionInput = {
    sex: user.sex as NutritionInput['sex'],
    age: user.age,
    weightKg: user.weightKg,
    heightCm: user.heightCm,
    activityLevel: user.activityLevel as NutritionInput['activityLevel'],
    goal: user.goal as NutritionInput['goal'],
    goalIntensity:
      (user.goalIntensity as NutritionInput['goalIntensity']) ?? undefined,
  };
  return calculateNutrition(input);
}

/** Atualiza o perfil no servidor e sincroniza o utilizador no store. */
export function useUpdateProfile() {
  const setUser = useAuthStore((s) => s.setUser);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<ApiUser>) =>
      api.patch<ApiUser>('/users/me', patch),
    onSuccess: (user) => {
      setUser(user);
      void qc.invalidateQueries();
    },
  });
}
