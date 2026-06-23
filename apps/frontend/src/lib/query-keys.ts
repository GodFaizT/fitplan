export const qk = {
  meals: (date: string) => ['meals', date] as const,
  foods: (search: string) => ['foods', search] as const,
  plans: () => ['plans'] as const,
  plan: (id: string) => ['plan', id] as const,
  exercises: (q: string) => ['exercises', q] as const,
  facets: () => ['exercise-facets'] as const,
};
