/** Cálculos de resumo semanal / consistência (puros, sem React). */

import { addDays, todayISO, weekdayIndex } from './format';
import type { NutritionDay, WeekScheduleDay, WorkoutSession } from './types';

/** Segunda-feira da semana a que `iso` pertence. */
export function mondayOf(iso: string): string {
  const wd = weekdayIndex(iso); // 0=Dom … 6=Sáb
  const back = (wd + 6) % 7; // dias desde 2ª
  return addDays(iso, -back);
}

/** Data de uma sessão (YYYY-MM-DD), preferindo a conclusão. */
function sessionDate(s: WorkoutSession): string {
  return (s.completedAt ?? s.createdAt).slice(0, 10);
}

/**
 * Streak de dias seguidos com registo de refeições. Hoje ainda conta como
 * "pendente": se ainda não registaste hoje, a sequência não quebra — começa a
 * contar a partir de ontem.
 */
export function loggedStreak(loggedDates: Set<string>, today = todayISO()): number {
  let cursor = loggedDates.has(today) ? today : addDays(today, -1);
  let streak = 0;
  for (let i = 0; i < 400; i++) {
    if (!loggedDates.has(cursor)) break;
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export interface WeeklyInsights {
  /** Dias seguidos com registo. */
  streak: number;
  /** Treinos feitos nesta semana (2ª→hoje). */
  workoutsDone: number;
  /** Treinos planeados na semana (slots agendados); 0 = sem agenda. */
  workoutsPlanned: number;
  /** Dias no alvo de calorias nos últimos 7; null se não há alvo definido. */
  onTarget: number | null;
}

export function computeWeeklyInsights(opts: {
  summary: NutritionDay[];
  sessions: WorkoutSession[];
  schedule: WeekScheduleDay[];
  targetCalories: number | null;
  today?: string;
}): WeeklyInsights {
  const today = opts.today ?? todayISO();

  const logged = new Set(
    opts.summary.filter((d) => d.calories > 0).map((d) => d.date.slice(0, 10)),
  );
  const streak = loggedStreak(logged, today);

  const monday = mondayOf(today);
  const workoutsDone = opts.sessions.filter((s) => {
    const d = sessionDate(s);
    return d >= monday && d <= today;
  }).length;
  const workoutsPlanned = opts.schedule.reduce(
    (n, d) => n + d.scheduledDays.length,
    0,
  );

  let onTarget: number | null = null;
  if (opts.targetCalories && opts.targetCalories > 0) {
    const calByDate = new Map(
      opts.summary.map((d) => [d.date.slice(0, 10), d.calories]),
    );
    const tol = opts.targetCalories * 0.15; // ±15% conta como "no alvo"
    let n = 0;
    for (let i = 0; i < 7; i++) {
      const cal = calByDate.get(addDays(today, -i)) ?? 0;
      if (cal > 0 && Math.abs(cal - opts.targetCalories) <= tol) n++;
    }
    onTarget = n;
  }

  return { streak, workoutsDone, workoutsPlanned, onTarget };
}

export interface HeatCell {
  date: string;
  count: number;
}

/**
 * Grelha de consistência de treino: `weeks` colunas (semanas alinhadas a 2ª),
 * cada uma com 7 células (2ª→Dom). A última coluna é a semana atual.
 */
export function trainingHeatmap(
  sessions: WorkoutSession[],
  weeks = 12,
  today = todayISO(),
): HeatCell[][] {
  const countByDate = new Map<string, number>();
  for (const s of sessions) {
    const d = sessionDate(s);
    countByDate.set(d, (countByDate.get(d) ?? 0) + 1);
  }
  const startMonday = addDays(mondayOf(today), -7 * (weeks - 1));
  const cols: HeatCell[][] = [];
  for (let w = 0; w < weeks; w++) {
    const colStart = addDays(startMonday, w * 7);
    const col: HeatCell[] = [];
    for (let day = 0; day < 7; day++) {
      const date = addDays(colStart, day);
      col.push({ date, count: countByDate.get(date) ?? 0 });
    }
    cols.push(col);
  }
  return cols;
}
