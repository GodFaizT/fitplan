'use client';

import { Dumbbell, Trash2, Trophy } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { Card, SectionTitle } from '@/components/ui/card';
import { EmptyState, Skeleton } from '@/components/ui/misc';
import {
  useExerciseProgression,
  useSessionMutations,
  useSessionStats,
  useSessions,
} from '@/hooks/use-sessions';
import { chartDate, fmt } from '@/lib/format';

const MetricChart = dynamic(
  () => import('@/components/progress/weight-chart'),
  { ssr: false, loading: () => <Skeleton className="h-56 w-full" /> },
);

export function TrainingTab() {
  const stats = useSessionStats();
  const sessions = useSessions();
  const { remove } = useSessionMutations();
  const [exercise, setExercise] = useState<string | null>(null);

  const prs = stats.data?.prs ?? [];
  const selected = exercise ?? prs[0]?.exerciseName ?? null;
  const progression = useExerciseProgression(selected);

  const points = useMemo(
    () =>
      (progression.data ?? []).map((p) => ({
        date: p.date,
        value: p.e1rm || p.maxWeight,
      })),
    [progression.data],
  );

  if (stats.isLoading || sessions.isLoading) {
    return <Skeleton className="h-72 w-full" />;
  }

  const list = sessions.data ?? [];
  if (list.length === 0) {
    return (
      <EmptyState
        icon={Dumbbell}
        title="Ainda não há treinos registados"
        description="Inicia uma sessão guiada num plano e carrega em “Terminar e guardar” para criar o teu histórico."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Resumo */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="flex flex-col gap-0.5 py-4">
          <span className="text-sm text-text-muted">Sessões</span>
          <span className="stat text-3xl leading-none">{stats.data?.total ?? 0}</span>
        </Card>
        <Card className="flex flex-col gap-0.5 py-4">
          <span className="text-sm text-text-muted">Esta semana</span>
          <span className="stat text-3xl leading-none">
            {stats.data?.thisWeek ?? 0}
          </span>
        </Card>
      </div>

      {/* Recordes pessoais */}
      {prs.length > 0 ? (
        <div>
          <SectionTitle className="mb-2 flex items-center gap-1.5 text-[15px]">
            <Trophy className="h-4 w-4 text-accent" /> Recordes pessoais
          </SectionTitle>
          <Card className="divide-y divide-line p-0">
            {prs.map((pr) => (
              <button
                key={pr.exerciseName}
                onClick={() => setExercise(pr.exerciseName)}
                className={`flex w-full items-center justify-between px-4 py-2.5 text-left transition hover:bg-surface-2 ${
                  selected === pr.exerciseName ? 'bg-surface-2' : ''
                }`}
              >
                <span className="min-w-0 truncate text-sm">{pr.exerciseName}</span>
                <span className="stat shrink-0 text-sm text-text-muted">
                  {pr.weight ? `${fmt(pr.weight, 1)} kg` : '—'}
                  {pr.reps ? ` × ${pr.reps}` : ''}
                  {pr.e1rm ? (
                    <span className="ml-2 text-accent">~{fmt(pr.e1rm)} 1RM</span>
                  ) : null}
                </span>
              </button>
            ))}
          </Card>
        </div>
      ) : null}

      {/* Progressão do exercício selecionado */}
      {selected && points.length > 1 ? (
        <Card className="flex flex-col gap-3">
          <SectionTitle className="text-[15px]">
            Progressão · {selected}
          </SectionTitle>
          <p className="-mt-2 text-[12px] text-text-muted">1RM estimado (kg)</p>
          <MetricChart points={points} unit="kg" />
        </Card>
      ) : null}

      {/* Histórico */}
      <div>
        <SectionTitle className="mb-2 text-[15px]">Histórico</SectionTitle>
        <div className="flex flex-col gap-2">
          {list.map((s) => (
            <Card key={s.id} className="flex items-center justify-between p-3.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {s.dayLabel || s.planName || 'Treino'}
                </p>
                <p className="text-[12px] text-text-muted">
                  {chartDate((s.completedAt ?? s.createdAt).slice(0, 10))} ·{' '}
                  {s.totalSets} séries
                  {s.volume ? ` · ${fmt(s.volume)} kg` : ''}
                </p>
              </div>
              <button
                onClick={() => remove.mutate(s.id)}
                className="rounded p-1.5 text-text-muted hover:text-danger"
                aria-label="Remover sessão"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
