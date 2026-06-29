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

// ---- Progressão (overload) -----------------------------------------------

export interface LastPerformance {
  weight: number | null;
  reps: number | null;
  date: string;
}

/**
 * Última vez que cada exercício foi feito (a melhor série, por carga) — para
 * sugerir a próxima progressão. Indexado pelo nome do exercício.
 */
export function lastPerformanceByExercise(
  sessions: WorkoutSession[],
): Map<string, LastPerformance> {
  const sorted = [...sessions].sort((a, b) =>
    (b.completedAt ?? b.createdAt).localeCompare(a.completedAt ?? a.createdAt),
  );
  const map = new Map<string, LastPerformance>();
  for (const s of sorted) {
    const date = (s.completedAt ?? s.createdAt).slice(0, 10);
    const byEx = new Map<string, typeof s.sets>();
    for (const set of s.sets) {
      const arr = byEx.get(set.exerciseName) ?? [];
      arr.push(set);
      byEx.set(set.exerciseName, arr);
    }
    for (const [name, sets] of byEx) {
      if (map.has(name)) continue; // já temos uma sessão mais recente
      const top = sets.reduce((best, cur) =>
        (cur.weight ?? 0) > (best.weight ?? 0) ? cur : best,
      );
      map.set(name, { weight: top.weight, reps: top.reps, date });
    }
  }
  return map;
}

/** Topo do intervalo de reps ("8-12" → 12, "10" → 10), ou null. */
function repRangeTop(reps: string): number | null {
  const nums = reps.match(/\d+/g);
  return nums ? Number(nums[nums.length - 1]) : null;
}

export interface Suggestion {
  weight: number;
  /** true = subir carga; false = manter carga e tentar mais reps. */
  increaseLoad: boolean;
}

/**
 * Sugere a próxima carga: se da última vez atingiste o topo do intervalo de
 * reps, sobe a carga (passo conforme a magnitude); senão mantém e pede mais reps.
 */
export function suggestNextWeight(
  last: LastPerformance | undefined,
  repsSpec: string,
): Suggestion | null {
  if (!last || last.weight == null) return null;
  const top = repRangeTop(repsSpec);
  if (top != null && last.reps != null && last.reps >= top) {
    const step = last.weight >= 40 ? 2.5 : 1.25;
    return { weight: Math.round((last.weight + step) * 100) / 100, increaseLoad: true };
  }
  return { weight: last.weight, increaseLoad: false };
}

// ---- Meta de peso (projeção de tendência) --------------------------------

/** Dias entre duas datas YYYY-MM-DD (b − a). */
function daysBetween(a: string, b: string): number {
  return Math.round(
    (new Date(`${b}T00:00:00`).getTime() - new Date(`${a}T00:00:00`).getTime()) /
      86_400_000,
  );
}

export type WeightProjectionStatus =
  | 'reached' // já na meta (±0.2 kg)
  | 'on_track' // a caminhar na direção certa
  | 'wrong_way' // a afastar-se da meta
  | 'stalled'; // sem variação relevante

export interface WeightProjection {
  /** Ritmo semanal (kg/sem), sinalizado: negativo = a descer. */
  weeklyRate: number;
  /** Data prevista para atingir a meta (null se parado / direção errada / >2 anos). */
  etaDate: string | null;
  /** Semanas estimadas até à meta (null nos mesmos casos). */
  weeksToGo: number | null;
  reached: boolean;
  status: WeightProjectionStatus;
}

/**
 * Projeta quando o peso-alvo será atingido, por regressão linear sobre os
 * registos recentes (janela de `windowDays`, com recurso a todos se forem
 * poucos). Devolve null sem dados suficientes (< 2 registos) ou meta inválida.
 */
export function weightProjection(
  entries: { date: string; weightKg: number }[],
  targetKg: number,
  today = todayISO(),
  windowDays = 56,
): WeightProjection | null {
  if (entries.length < 2 || !(targetKg > 0)) return null;

  const cutoff = addDays(today, -windowDays);
  let pts = entries.filter((e) => e.date.slice(0, 10) >= cutoff);
  if (pts.length < 2) pts = entries;

  const base = pts[0].date.slice(0, 10);
  const xs = pts.map((e) => daysBetween(base, e.date.slice(0, 10)));
  const ys = pts.map((e) => e.weightKg);
  const n = pts.length;
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - meanX) * (ys[i] - meanY);
    den += (xs[i] - meanX) ** 2;
  }
  const slopePerDay = den === 0 ? 0 : num / den;
  const weeklyRate = Math.round(slopePerDay * 7 * 100) / 100;

  const intercept = meanY - slopePerDay * meanX;
  const trendToday = intercept + slopePerDay * daysBetween(base, today);
  const remaining = targetKg - trendToday; // >0 falta subir; <0 falta descer

  if (Math.abs(remaining) <= 0.2) {
    return { weeklyRate, etaDate: today, weeksToGo: 0, reached: true, status: 'reached' };
  }
  if (Math.abs(slopePerDay) < 0.005) {
    return { weeklyRate, etaDate: null, weeksToGo: null, reached: false, status: 'stalled' };
  }
  if (Math.sign(remaining) !== Math.sign(slopePerDay)) {
    return { weeklyRate, etaDate: null, weeksToGo: null, reached: false, status: 'wrong_way' };
  }
  const days = remaining / slopePerDay;
  if (days > 730) {
    return { weeklyRate, etaDate: null, weeksToGo: null, reached: false, status: 'on_track' };
  }
  return {
    weeklyRate,
    etaDate: addDays(today, Math.round(days)),
    weeksToGo: Math.max(1, Math.round(days / 7)),
    reached: false,
    status: 'on_track',
  };
}

// ---- Volume por grupo muscular -------------------------------------------

export interface MuscleVolume {
  /** Chave do grupo (vazia = sem grupo definido). */
  group: string;
  volume: number;
  sets: number;
}

/**
 * Agrega o volume (carga × reps) e nº de séries por grupo muscular nas sessões
 * dos últimos `sinceDays` dias. Ordenado por volume decrescente.
 */
export function volumeByMuscleGroup(
  sessions: WorkoutSession[],
  sinceDays = 30,
  today = todayISO(),
): MuscleVolume[] {
  const cutoff = addDays(today, -(sinceDays - 1));
  const map = new Map<string, { volume: number; sets: number }>();
  for (const s of sessions) {
    if (sessionDate(s) < cutoff) continue;
    for (const set of s.sets) {
      const g = set.muscleGroup ?? '';
      const cur = map.get(g) ?? { volume: 0, sets: 0 };
      cur.volume += (set.weight ?? 0) * (set.reps ?? 0);
      cur.sets += 1;
      map.set(g, cur);
    }
  }
  return [...map.entries()]
    .map(([group, v]) => ({ group, volume: Math.round(v.volume), sets: v.sets }))
    .sort((a, b) => b.volume - a.volume || b.sets - a.sets);
}
