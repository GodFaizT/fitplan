/**
 * Lógica de nutrição — funções puras (PROJECT.md secção 4).
 *
 * Reutilizadas pelo frontend (cálculo instantâneo na UI) e pelo backend
 * (cache dos alvos no User). Sem efeitos secundários, sem dependências.
 */

import type {
  ActivityLevel,
  Goal,
  GoalIntensity,
  MacroGrams,
  NutritionInput,
  NutritionResult,
} from './types';

/** Calorias por grama de cada macronutriente (PROJECT.md 4.5). */
export const KCAL_PER_GRAM = {
  protein: 4,
  carbs: 4,
  fat: 9,
} as const;

/** % das calorias-alvo atribuídas à gordura (PROJECT.md 4.5, passo 2). */
export const FAT_CALORIE_RATIO = 0.25;

/** Fatores de atividade para o TDEE (PROJECT.md 4.3). */
export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very: 1.725,
  extra: 1.9,
};

/**
 * Ajuste de calorias por objetivo, como fração do TDEE (PROJECT.md 4.4).
 * `calorias_alvo = TDEE × (1 + ajuste)`.
 *
 * Intensidade só conta para 'lose'/'gain'. Sem intensidade definida,
 * assume-se 'moderate'.
 */
export function goalAdjustment(goal: Goal, intensity?: GoalIntensity): number {
  if (goal === 'maintain') return 0;

  if (goal === 'lose') {
    switch (intensity) {
      case 'light':
        return -0.1;
      case 'aggressive':
        return -0.25;
      case 'moderate':
      default:
        return -0.2;
    }
  }

  // goal === 'gain'
  switch (intensity) {
    case 'light':
      return 0.05;
    case 'aggressive':
      return 0.15;
    case 'moderate':
    default:
      return 0.1;
  }
}

/** Proteína por kg de peso corporal, por objetivo (PROJECT.md 4.5, passo 1). */
export function proteinFactor(goal: Goal): number {
  switch (goal) {
    case 'lose':
      return 2.2;
    case 'gain':
      return 2.0;
    case 'maintain':
    default:
      return 1.8;
  }
}

/**
 * BMR — Taxa Metabólica Basal, fórmula Mifflin-St Jeor (PROJECT.md 4.2).
 *
 *   Homem:  (10 × peso) + (6.25 × altura) − (5 × idade) + 5
 *   Mulher: (10 × peso) + (6.25 × altura) − (5 × idade) − 161
 */
export function calcBmr(input: Pick<NutritionInput, 'sex' | 'weightKg' | 'heightCm' | 'age'>): number {
  const base = 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age;
  return input.sex === 'male' ? base + 5 : base - 161;
}

/** TDEE — Gasto Energético Total Diário = BMR × fator de atividade (PROJECT.md 4.3). */
export function calcTdee(bmr: number, activityLevel: ActivityLevel): number {
  return bmr * ACTIVITY_FACTORS[activityLevel];
}

/**
 * Distribuição de macros baseada em proteína por peso corporal (PROJECT.md 4.5).
 *
 * 1. Proteína (g) = peso × fator_proteina
 * 2. Gordura (g)  = (calorias × 0.25) / 9
 * 3. Restantes    = calorias − (proteina × 4) − (gordura × 9)
 * 4. Hidratos (g) = restantes / 4
 *
 * Clamp a 0 e aviso se as calorias forem demasiado baixas para a proteína.
 */
export function calcMacros(
  targetCalories: number,
  weightKg: number,
  goal: Goal,
): { macros: MacroGrams; warning?: string } {
  const proteinG = weightKg * proteinFactor(goal);
  const fatG = (targetCalories * FAT_CALORIE_RATIO) / KCAL_PER_GRAM.fat;

  const remainingCalories =
    targetCalories - proteinG * KCAL_PER_GRAM.protein - fatG * KCAL_PER_GRAM.fat;
  let carbsG = remainingCalories / KCAL_PER_GRAM.carbs;

  let warning: string | undefined;
  if (carbsG < 0) {
    carbsG = 0;
    warning =
      'As calorias-alvo são demasiado baixas para a proteína e gordura definidas. ' +
      'Aumenta as calorias ou reduz a intensidade do objetivo.';
  }

  return {
    macros: {
      protein: Math.round(proteinG),
      carbs: Math.round(carbsG),
      fat: Math.round(fatG),
    },
    warning,
  };
}

/**
 * Cálculo completo da calculadora de nutrição (PROJECT.md secção 4).
 * Devolve BMR, TDEE, calorias-alvo, macros em gramas, kcal por macro e %.
 */
export function calculateNutrition(input: NutritionInput): NutritionResult {
  const bmr = calcBmr(input);
  const tdee = calcTdee(bmr, input.activityLevel);

  const adjustment = goalAdjustment(input.goal, input.goalIntensity);
  const targetCaloriesRaw = tdee * (1 + adjustment);
  const targetCalories = Math.round(targetCaloriesRaw);

  const { macros, warning } = calcMacros(targetCalories, input.weightKg, input.goal);

  const macroCalories: MacroGrams = {
    protein: macros.protein * KCAL_PER_GRAM.protein,
    carbs: macros.carbs * KCAL_PER_GRAM.carbs,
    fat: macros.fat * KCAL_PER_GRAM.fat,
  };

  const pct = (kcal: number): number =>
    targetCalories > 0 ? Math.round((kcal / targetCalories) * 100) : 0;

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetCalories,
    macros,
    macroCalories,
    macroPercents: {
      protein: pct(macroCalories.protein),
      carbs: pct(macroCalories.carbs),
      fat: pct(macroCalories.fat),
    },
    warning,
  };
}

/**
 * Escala valores nutricionais "por X unidade" para a quantidade consumida
 * (PROJECT.md 5.3). Ex: 165 kcal / 100 g, consome 150 g → 247.5 kcal.
 */
export function scaleNutrition(
  perBase: { calories: number; protein: number; carbs: number; fat: number },
  basePer: number,
  quantity: number,
): { calories: number; protein: number; carbs: number; fat: number } {
  const factor = basePer > 0 ? quantity / basePer : 0;
  return {
    calories: perBase.calories * factor,
    protein: perBase.protein * factor,
    carbs: perBase.carbs * factor,
    fat: perBase.fat * factor,
  };
}
