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
  meals: Meal[];
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

/** Alimento do catálogo global predefinido (leitura). */
export interface CatalogFood extends SavedFood {
  category: string | null;
}

export interface LibraryExercise {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  level: string | null;
  force: string | null;
  mechanic: string | null;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
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

export interface AuthResponse {
  accessToken: string;
  user: ApiUser;
}
