'use client';

import { kgToLb, lbToKg } from '@fitplan/shared';
import { Scale, Trash2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, Eyebrow, SectionTitle } from '@/components/ui/card';
import { Field, Input } from '@/components/ui/input';
import { EmptyState, Skeleton } from '@/components/ui/misc';
import { useWeightMutations, useWeights } from '@/hooks/use-weights';
import { useAuthStore } from '@/lib/auth-store';
import { chartDate, fmt, todayISO } from '@/lib/format';

const WeightChart = dynamic(
  () => import('@/components/progress/weight-chart'),
  { ssr: false, loading: () => <Skeleton className="h-56 w-full" /> },
);

export default function ProgressPage() {
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

  const [value, setValue] = useState('');

  async function save() {
    const v = Number(value);
    if (!v || v <= 0) return;
    await upsert.mutateAsync({
      date: todayISO(),
      weightKg: Math.round(toKg(v) * 10) / 10,
    });
    setValue('');
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="animate-fade-up">
        <Eyebrow>Progresso</Eyebrow>
        <SectionTitle className="mt-1">Peso</SectionTitle>
      </header>

      {weights.isLoading ? (
        <Skeleton className="h-72 w-full" />
      ) : entries.length === 0 ? (
        <EmptyState
          icon={Scale}
          title="Ainda não registaste o teu peso"
          description="Adiciona o primeiro registo para acompanhar a evolução."
        />
      ) : (
        <Card className="flex animate-fade-up flex-col gap-4 [animation-delay:60ms]">
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
          <WeightChart points={points} unit={unit} />
        </Card>
      )}

      <Card className="flex animate-fade-up flex-col gap-3 [animation-delay:120ms]">
        <SectionTitle className="text-[15px]">Registar hoje</SectionTitle>
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Field label={`Peso (${unit})`}>
              <Input
                type="number"
                step="0.1"
                inputMode="decimal"
                value={value}
                onChange={(e) => setValue(e.target.value)}
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
        <div className="animate-fade-up [animation-delay:180ms]">
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
