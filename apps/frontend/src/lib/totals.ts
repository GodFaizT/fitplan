import type { Meal } from './types';

export interface Totals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export function sumMeals(meals: Meal[]): Totals {
  const t: Totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  for (const m of meals) {
    for (const it of m.items) {
      t.calories += it.calories;
      t.protein += it.protein;
      t.carbs += it.carbs;
      t.fat += it.fat;
    }
  }
  return t;
}

export interface Targets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

import type { ApiUser } from './types';
import { nutritionFromUser } from '@/hooks/use-nutrition';

/** Alvos do utilizador: calculados do perfil, ou os cacheados no servidor. */
export function targetsFromUser(user: ApiUser | null): Targets | null {
  const live = nutritionFromUser(user);
  if (live) {
    return {
      calories: live.targetCalories,
      protein: live.macros.protein,
      carbs: live.macros.carbs,
      fat: live.macros.fat,
    };
  }
  if (user?.targetCalories != null) {
    return {
      calories: user.targetCalories,
      protein: user.targetProtein ?? 0,
      carbs: user.targetCarbs ?? 0,
      fat: user.targetFat ?? 0,
    };
  }
  return null;
}
