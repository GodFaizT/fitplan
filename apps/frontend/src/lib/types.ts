/** Tipos das respostas da API (espelham os modelos Prisma do backend). */

export interface ApiUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  approved: boolean;
  sex: string | null;
  age: number | null;
  weightKg: number | null;
  heightCm: number | null;
  activityLevel: string | null;
  goal: string | null;
  goalIntensity: string | null;
  units: string;
  accentColor: string | null;
  theme: string;
  targetCalories: number | null;
  targetProtein: number | null;
  targetCarbs: number | null;
  targetFat: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface FoodItem {
  id: string;
  mealId: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  position: number;
}

export interface Meal {
  id: string;
  dailyLogId: string;
  type: string;
  label: string | null;
  consumed: boolean;
  position: number;
  items: FoodItem[];
}

export interface DailyLog {
  id: string;
  userId: string;
  date: string;
  water: number;
  meals: Meal[];
}

export interface WeightEntry {
  id: string;
  userId: string;
  date: string;
  weightKg: number;
}

export interface BodyMeasurement {
  id: string;
  userId: string;
  date: string;
  type: string;
  value: number; // cm
}

export interface SetLog {
  id: string;
  sessionId: string;
  exerciseName: string;
  muscleGroup: string | null;
  setNumber: number;
  weight: number | null;
  reps: number | null;
  position: number;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  planId: string | null;
  planName: string | null;
  dayLabel: string | null;
  startedAt: string;
  completedAt: string | null;
  durationSec: number;
  notes: string | null;
  createdAt: string;
  sets: SetLog[];
  volume: number; // calculado pelo backend
  totalSets: number;
}

/** Série a gravar (sem ids) ao concluir uma sessão. */
export interface NewSetLog {
  exerciseName: string;
  muscleGroup?: string;
  setNumber: number;
  weight?: number;
  reps?: number;
}

export interface PersonalRecord {
  exerciseName: string;
  weight: number;
  reps: number;
  e1rm: number;
}

export interface SessionStats {
  total: number;
  thisWeek: number;
  prs: PersonalRecord[];
}

export interface ProgressionPoint {
  date: string;
  maxWeight: number;
  e1rm: number;
  volume: number;
}

export interface MealTemplateItem {
  id: string;
  templateId: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  position: number;
}

export interface MealTemplate {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  items: MealTemplateItem[];
}

/** Totais de um dia (endpoint de tendências de nutrição). */
export interface NutritionDay {
  date: string;
  water: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface SavedFood {
  id: string;
  name: string;
  per: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

/** Alimento usado recentemente (valores já para a quantidade registada). */
export interface RecentFood {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

/** Alimento do catálogo global predefinido (leitura). */
export interface CatalogFood extends SavedFood {
  category: string | null;
}

export interface LibraryExercise {
  id: string;
  slug: string;
  name: string;
  namePt: string | null;
  category: string | null;
  level: string | null;
  force: string | null;
  mechanic: string | null;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  instructionsPt: string[];
  imageUrls: string[];
}

export interface PlanExercise {
  id: string;
  dayId: string;
  libraryId: string | null;
  name: string;
  muscleGroup: string | null;
  sets: number;
  reps: string;
  restSeconds: number;
  weight: number | null;
  videoUrl: string | null;
  notes: string | null;
  imageUrls: string[];
  instructions: string[];
  position: number;
}

export interface WorkoutDay {
  id: string;
  planId: string;
  label: string;
  title: string | null;
  position: number;
  exercises: PlanExercise[];
}

export interface PlanMemberInfo {
  userId: string;
  role: string;
  user: { name: string | null; email: string };
}

export interface WorkoutPlan {
  id: string;
  ownerId: string;
  name: string;
  isShared: boolean;
  shareCode: string | null;
  createdAt: string;
  updatedAt: string;
  owner?: { id: string; name: string | null; email: string };
  members?: PlanMemberInfo[];
  days?: WorkoutDay[];
  _count?: { days: number };
}

export interface TemplateDayPreview {
  label: string;
  title: string;
  exercises: { name: string; sets: number; reps: string }[];
}

/** Modelo de plano pronto a usar (resumo). */
export interface WorkoutTemplateSummary {
  id: string;
  name: string;
  description: string;
  daysPerWeek: number;
  level: string;
  focus: string;
  days: TemplateDayPreview[];
}

export interface AuthResponse {
  accessToken: string;
  user: ApiUser;
}
