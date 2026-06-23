/**
 * Tipos de domínio partilhados entre frontend e backend.
 *
 * Os valores canónicos são em inglês (estáveis na BD/API); o frontend traduz
 * para rótulos em português na UI. Ver PROJECT.md secção 4.
 */

export type Sex = 'male' | 'female';

export type ActivityLevel =
  | 'sedentary' // 1.2  — pouco ou nenhum exercício
  | 'light' //     1.375 — exercício leve 1–3 dias/semana
  | 'moderate' //  1.55  — exercício moderado 3–5 dias/semana
  | 'very' //      1.725 — exercício intenso 6–7 dias/semana
  | 'extra'; //    1.9   — trabalho físico + treino diário

export type Goal = 'lose' | 'maintain' | 'gain';

export type GoalIntensity = 'light' | 'moderate' | 'aggressive';

export type Units = 'metric' | 'imperial';

/** Inputs do formulário da calculadora (PROJECT.md 4.1). */
export interface NutritionInput {
  sex: Sex;
  age: number; // anos
  weightKg: number; // kg
  heightCm: number; // cm
  activityLevel: ActivityLevel;
  goal: Goal;
  /** Só relevante se goal for 'lose' ou 'gain'. */
  goalIntensity?: GoalIntensity;
}

/** Gramas de cada macronutriente. */
export interface MacroGrams {
  protein: number;
  carbs: number;
  fat: number;
}

/** Resultado completo da calculadora de nutrição (PROJECT.md 4.6). */
export interface NutritionResult {
  bmr: number; // kcal (arredondado)
  tdee: number; // kcal (arredondado)
  targetCalories: number; // kcal (arredondado)
  macros: MacroGrams; // gramas (arredondadas)
  /** kcal provenientes de cada macro (com base nas gramas arredondadas). */
  macroCalories: MacroGrams;
  /** % das calorias-alvo provenientes de cada macro. */
  macroPercents: MacroGrams;
  /** Aviso quando as calorias são demasiado baixas para a proteína definida. */
  warning?: string;
}

/**
 * Alvos guardados/calculados (cache no User). Usado pelo registo de refeições
 * para comparar consumido vs. alvo (PROJECT.md 5.5/5.6).
 */
export interface NutritionTargets {
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
}
