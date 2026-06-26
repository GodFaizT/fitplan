/** Chave da cache do TanStack Query persistida em localStorage. */
export const QUERY_CACHE_KEY = 'fitplan-query-cache';

export const qk = {
  meals: (date: string) => ['meals', date] as const,
  foods: (search: string) => ['foods', search] as const,
  plans: () => ['plans'] as const,
  plan: (id: string) => ['plan', id] as const,
  exercises: (q: string) => ['exercises', q] as const,
  facets: () => ['exercise-facets'] as const,
  weights: () => ['weights'] as const,
  measurements: () => ['measurements'] as const,
  sessions: () => ['sessions'] as const,
  sessionStats: () => ['session-stats'] as const,
  progression: (name: string) => ['progression', name] as const,
  mealTemplates: () => ['meal-templates'] as const,
  nutritionSummary: (from: string, to: string) =>
    ['nutrition-summary', from, to] as const,
  progressPhotos: () => ['progress-photos'] as const,
};
