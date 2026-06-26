'use client';

import { Dumbbell, Flame, type LucideIcon, Target } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/misc';
import { useNutritionSummary } from '@/hooks/use-meals';
import { useWorkoutWeek } from '@/hooks/use-plans';
import { useSessions } from '@/hooks/use-sessions';
import { useAuthStore } from '@/lib/auth-store';
import { addDays, todayISO } from '@/lib/format';
import { computeWeeklyInsights } from '@/lib/insights';
import { targetsFromUser } from '@/lib/totals';

/** Resumo da semana: sequência de registos, treinos e adesão às calorias. */
export function WeeklySummary() {
  const user = useAuthStore((s) => s.user);
  const today = todayISO();
  const summary = useNutritionSummary(addDays(today, -89), today);
  const sessions = useSessions();
  const week = useWorkoutWeek();
  const targets = targetsFromUser(user);

  if (summary.isLoading || sessions.isLoading) {
    return <Skeleton className="h-[88px] w-full" />;
  }

  const ins = computeWeeklyInsights({
    summary: summary.data ?? [],
    sessions: sessions.data ?? [],
    schedule: week.data ?? [],
    targetCalories: targets?.calories ?? null,
    today,
  });

  return (
    <div className="grid grid-cols-3 gap-3">
      <Tile
        icon={Flame}
        value={String(ins.streak)}
        label={ins.streak === 1 ? 'dia seguido' : 'dias seguidos'}
      />
      <Tile
        icon={Dumbbell}
        value={
          ins.workoutsPlanned > 0
            ? `${ins.workoutsDone}/${ins.workoutsPlanned}`
            : String(ins.workoutsDone)
        }
        label="treinos"
      />
      <Tile
        icon={Target}
        value={ins.onTarget != null ? `${ins.onTarget}/7` : '—'}
        label="no alvo"
      />
    </div>
  );
}

function Tile({
  icon: Icon,
  value,
  label,
}: {
  icon: LucideIcon;
  value: string;
  label: string;
}) {
  return (
    <Card className="flex flex-col items-center gap-1 px-2 py-3.5 text-center">
      <Icon className="h-4 w-4 text-accent" strokeWidth={2} />
      <span className="stat text-2xl leading-none">{value}</span>
      <span className="text-[11px] leading-tight text-text-muted">{label}</span>
    </Card>
  );
}
