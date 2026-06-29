'use client';

import { kgToLb, lbToKg } from '@fitplan/shared';
import { Pencil, Scale, Target, Trash2, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, SectionTitle } from '@/components/ui/card';
import { Field } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { EmptyState, Skeleton } from '@/components/ui/misc';
import { useUpdateProfile } from '@/hooks/use-nutrition';
import { useWeightMutations, useWeights } from '@/hooks/use-weights';
import { useAuthStore } from '@/lib/auth-store';
import { chartDate, fmt, todayISO } from '@/lib/format';
import { weightProjection } from '@/lib/insights';
import { toast } from '@/lib/toast';
import type { WeightEntry } from '@/lib/types';

const MetricChart = dynamic(
  () => import('@/components/progress/weight-chart'),
  { ssr: false, loading: () => <Skeleton className="h-56 w-full" /> },
);

export function WeightTab() {
  const user = useAuthStore((s) => s.user);
  const imperial = user?.units === 'imperial';
  const unit = imperial ? 'lb' : 'kg';
  const toDisplay = (kg: number) => (imperial ? kgToLb(kg) : kg);
  const toKg = (v: number) => (imperial ? lbToKg(v) : v);

  const weights = useWeights();
  const { upsert, remove } = useWeightMutations();
  const entries = weights.data ?? [];

  const points = useMemo(
    () =>
      entries.map((e) => ({
        date: e.date.slice(0, 10),
        value: Math.round(toDisplay(e.weightKg) * 10) / 10,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entries, imperial],
  );

  const latest = entries.at(-1) ?? null;
  const first = entries[0] ?? null;
  const deltaKg = latest && first ? latest.weightKg - first.weightKg : 0;
  const deltaSign = deltaKg < 0 ? '−' : deltaKg > 0 ? '+' : '';

  const targetKg = user?.targetWeightKg ?? null;
  const targetDisplay =
    targetKg != null ? Math.round(toDisplay(targetKg) * 10) / 10 : undefined;

  const [value, setValue] = useState<number | null>(null);

  async function save() {
    if (value == null || value <= 0) return;
    await upsert.mutateAsync({
      date: todayISO(),
      weightKg: Math.round(toKg(value) * 10) / 10,
    });
    setValue(null);
  }

  return (
    <div className="flex flex-col gap-6">
      {weights.isLoading ? (
        <Skeleton className="h-72 w-full" />
      ) : entries.length === 0 ? (
        <EmptyState
          icon={Scale}
          title="Ainda não registaste o teu peso"
          description="Adiciona o primeiro registo para acompanhar a evolução."
        />
      ) : (
        <Card className="flex flex-col gap-4">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-sm text-text-muted">Atual</span>
              <p className="stat text-hero leading-none">
                {fmt(toDisplay(latest!.weightKg), 1)}{' '}
                <span className="text-base font-normal text-text-muted">
                  {unit}
                </span>
              </p>
            </div>
            {entries.length > 1 ? (
              <div className="text-right">
                <span className="text-sm text-text-muted">Desde o início</span>
                <p className="stat text-lg">
                  {deltaSign}
                  {fmt(Math.abs(toDisplay(deltaKg)), 1)} {unit}
                </p>
              </div>
            ) : null}
          </div>
          <MetricChart points={points} unit={unit} target={targetDisplay} />
        </Card>
      )}

      <GoalCard
        entries={entries}
        unit={unit}
        toDisplay={toDisplay}
        toKg={toKg}
        targetKg={targetKg}
      />

      <Card className="flex flex-col gap-3">
        <SectionTitle className="text-[15px]">Registar hoje</SectionTitle>
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Field label={`Peso (${unit})`}>
              <NumberInput
                value={value}
                onValueChange={setValue}
                placeholder={latest ? fmt(toDisplay(latest.weightKg), 1) : '75'}
              />
            </Field>
          </div>
          <Button onClick={save} disabled={upsert.isPending || !value}>
            Guardar
          </Button>
        </div>
      </Card>

      {entries.length > 0 ? (
        <div>
          <SectionTitle className="mb-2 text-[15px]">Histórico</SectionTitle>
          <Card className="divide-y divide-line p-0">
            {[...entries]
              .reverse()
              .slice(0, 12)
              .map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between px-4 py-2.5"
                >
                  <span className="text-sm text-text-muted">
                    {chartDate(e.date.slice(0, 10))}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="stat text-sm">
                      {fmt(toDisplay(e.weightKg), 1)} {unit}
                    </span>
                    <button
                      onClick={() => remove.mutate(e.id)}
                      className="rounded p-1 text-text-muted hover:text-danger"
                      aria-label="Remover registo"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
          </Card>
        </div>
      ) : null}
    </div>
  );
}

/** Cartão de meta de peso: definir alvo e ver a projeção de tendência. */
function GoalCard({
  entries,
  unit,
  toDisplay,
  toKg,
  targetKg,
}: {
  entries: WeightEntry[];
  unit: string;
  toDisplay: (kg: number) => number;
  toKg: (v: number) => number;
  targetKg: number | null;
}) {
  const update = useUpdateProfile();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState<number | null>(
    targetKg != null ? Math.round(toDisplay(targetKg) * 10) / 10 : null,
  );

  const projection = useMemo(
    () => (targetKg != null ? weightProjection(entries, targetKg, todayISO()) : null),
    [entries, targetKg],
  );

  const latest = entries.at(-1) ?? null;
  const remainingKg = targetKg != null && latest ? latest.weightKg - targetKg : null;

  async function saveGoal() {
    if (value == null || value <= 0) return;
    await update.mutateAsync({ targetWeightKg: Math.round(toKg(value) * 10) / 10 });
    setEditing(false);
    toast.success('Meta guardada');
  }

  async function clearGoal() {
    await update.mutateAsync({ targetWeightKg: null });
    setValue(null);
    setEditing(false);
  }

  // Sem meta definida (e não a editar) → convite para definir.
  if (targetKg == null && !editing) {
    return (
      <Card className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <Target className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">Define uma meta de peso</p>
          <p className="text-[12px] text-text-muted">
            Vê o ritmo e a data prevista para a atingir.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
          Definir
        </Button>
      </Card>
    );
  }

  // A editar (definir ou alterar).
  if (editing) {
    return (
      <Card className="flex flex-col gap-3">
        <SectionTitle className="flex items-center gap-1.5 text-[15px]">
          <Target className="h-4 w-4 text-accent" /> Meta de peso
        </SectionTitle>
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Field label={`Peso-alvo (${unit})`}>
              <NumberInput
                value={value}
                onValueChange={setValue}
                placeholder="70"
              />
            </Field>
          </div>
          <Button onClick={saveGoal} disabled={update.isPending || !value}>
            Guardar
          </Button>
        </div>
        {targetKg != null ? (
          <button
            onClick={clearGoal}
            className="self-start text-[12px] text-text-muted hover:text-danger"
          >
            Remover meta
          </button>
        ) : (
          <button
            onClick={() => setEditing(false)}
            className="self-start text-[12px] text-text-muted hover:text-text"
          >
            Cancelar
          </button>
        )}
      </Card>
    );
  }

  // Meta definida → mostrar valor, distância e projeção.
  const remDisp = remainingKg != null ? toDisplay(Math.abs(remainingKg)) : null;
  const remSign = remainingKg == null ? '' : remainingKg > 0 ? 'acima' : 'abaixo';

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <SectionTitle className="flex items-center gap-1.5 text-[15px]">
            <Target className="h-4 w-4 text-accent" /> Meta de peso
          </SectionTitle>
          <p className="stat mt-1 text-2xl leading-none">
            {fmt(toDisplay(targetKg!), 1)}{' '}
            <span className="text-sm font-normal text-text-muted">{unit}</span>
          </p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => {
              setValue(Math.round(toDisplay(targetKg!) * 10) / 10);
              setEditing(true);
            }}
            className="rounded p-1.5 text-text-muted hover:text-text"
            aria-label="Editar meta"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={clearGoal}
            className="rounded p-1.5 text-text-muted hover:text-danger"
            aria-label="Remover meta"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {remDisp != null && remDisp >= 0.05 ? (
        <p className="text-sm text-text-muted">
          Faltam{' '}
          <span className="stat text-text">
            {fmt(remDisp, 1)} {unit}
          </span>{' '}
          ({remSign} da meta)
        </p>
      ) : null}

      <ProjectionLine
        projection={projection}
        unit={unit}
        toDisplay={toDisplay}
      />
    </Card>
  );
}

/** Frase de projeção da meta (ritmo + data prevista). */
function ProjectionLine({
  projection,
  unit,
  toDisplay,
}: {
  projection: ReturnType<typeof weightProjection>;
  unit: string;
  toDisplay: (kg: number) => number;
}) {
  if (!projection) {
    return (
      <p className="text-[12px] text-text-muted">
        Regista mais alguns pesos para estimar quando atinges a meta.
      </p>
    );
  }
  if (projection.reached) {
    return (
      <p className="rounded-xl bg-accent/10 px-3 py-2 text-sm font-medium text-accent">
        🎉 Meta atingida!
      </p>
    );
  }

  const rate = toDisplay(Math.abs(projection.weeklyRate));
  const sign = projection.weeklyRate < 0 ? '−' : projection.weeklyRate > 0 ? '+' : '';
  const rateLabel = `${sign}${fmt(rate, 2)} ${unit}/sem`;

  if (projection.status === 'wrong_way') {
    return (
      <p className="text-sm text-text-muted">
        <span className="text-danger">A afastar-te da meta</span> · {rateLabel}
      </p>
    );
  }
  if (projection.status === 'stalled') {
    return (
      <p className="text-sm text-text-muted">
        Sem variação recente — ajusta a dieta ou o treino para voltar a progredir.
      </p>
    );
  }
  // on_track
  if (projection.etaDate && projection.weeksToGo != null) {
    return (
      <p className="text-sm text-text-muted">
        <span className="stat text-text">{rateLabel}</span> · meta prevista em ~
        {projection.weeksToGo} {projection.weeksToGo === 1 ? 'semana' : 'semanas'} (
        {chartDate(projection.etaDate)})
      </p>
    );
  }
  return (
    <p className="text-sm text-text-muted">
      <span className="stat text-text">{rateLabel}</span> · mantém o ritmo para
      te aproximares da meta.
    </p>
  );
}
