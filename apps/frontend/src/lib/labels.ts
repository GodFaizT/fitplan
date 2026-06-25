/** Tradução dos valores canónicos (inglês na API) para rótulos PT na UI. */

export const SEX_LABELS: Record<string, string> = {
  male: 'Masculino',
  female: 'Feminino',
};

export const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: 'Sedentário',
  light: 'Levemente ativo',
  moderate: 'Moderadamente ativo',
  very: 'Muito ativo',
  extra: 'Extremamente ativo',
};

export const ACTIVITY_HINTS: Record<string, string> = {
  sedentary: 'Pouco ou nenhum exercício',
  light: 'Exercício leve 1–3 dias/semana',
  moderate: 'Exercício moderado 3–5 dias/semana',
  very: 'Exercício intenso 6–7 dias/semana',
  extra: 'Trabalho físico + treino diário',
};

export const GOAL_LABELS: Record<string, string> = {
  lose: 'Perder gordura',
  maintain: 'Manter',
  gain: 'Ganhar massa',
};

export const INTENSITY_LABELS: Record<string, string> = {
  light: 'Ligeiro',
  moderate: 'Moderado',
  aggressive: 'Agressivo',
};

export const MEAL_TYPE_LABELS: Record<string, string> = {
  'pequeno-almoco': 'Pequeno-almoço',
  almoco: 'Almoço',
  lanche: 'Lanche',
  jantar: 'Jantar',
  ceia: 'Ceia',
  outro: 'Outro',
};

export const MEAL_TYPES = [
  'pequeno-almoco',
  'almoco',
  'lanche',
  'jantar',
  'ceia',
  'outro',
] as const;

/** Medidas corporais (tipo canónico → rótulo PT). */
export const MEASUREMENT_LABELS: Record<string, string> = {
  waist: 'Cintura',
  chest: 'Peito',
  arm: 'Braço',
  hip: 'Anca',
  thigh: 'Coxa',
  shoulders: 'Ombros',
  calf: 'Gémeo',
  neck: 'Pescoço',
};

export const MEASUREMENT_TYPES = [
  'waist',
  'chest',
  'arm',
  'hip',
  'thigh',
  'shoulders',
  'calf',
  'neck',
] as const;

/** Tradução simples de grupos musculares (Free Exercise DB → PT). PROJECT.md 6.4. */
export const MUSCLE_LABELS: Record<string, string> = {
  chest: 'Peito',
  back: 'Costas',
  shoulders: 'Ombros',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  forearms: 'Antebraços',
  quadriceps: 'Quadríceps',
  hamstrings: 'Isquiotibiais',
  glutes: 'Glúteos',
  calves: 'Gémeos',
  abdominals: 'Abdominais',
  traps: 'Trapézios',
  lats: 'Dorsais',
  'middle back': 'Costas (meio)',
  'lower back': 'Lombar',
  neck: 'Pescoço',
  adductors: 'Adutores',
  abductors: 'Abdutores',
};

export function muscleLabel(m?: string | null): string {
  if (!m) return '—';
  return MUSCLE_LABELS[m] ?? m.charAt(0).toUpperCase() + m.slice(1);
}

/** Equipamento (Free Exercise DB → PT). */
export const EQUIPMENT_LABELS: Record<string, string> = {
  'body only': 'só corpo',
  dumbbell: 'haltere',
  barbell: 'barra',
  cable: 'cabo',
  machine: 'máquina',
  kettlebells: 'kettlebell',
  bands: 'elásticos',
  'medicine ball': 'bola medicinal',
  'exercise ball': 'bola de pilates',
  'foam roll': 'rolo de espuma',
  'e-z curl bar': 'barra W',
  other: 'outro',
  none: 'nenhum',
};

export function equipmentLabel(e?: string | null): string | null {
  if (!e) return null;
  return EQUIPMENT_LABELS[e] ?? e;
}

/** Nível (Free Exercise DB → PT). */
export const LEVEL_LABELS: Record<string, string> = {
  beginner: 'iniciante',
  intermediate: 'intermédio',
  expert: 'avançado',
};

export function levelLabel(l?: string | null): string | null {
  if (!l) return null;
  return LEVEL_LABELS[l] ?? l;
}
