'use client';

import { Ruler, Trash2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, SectionTitle } from '@/components/ui/card';
import { Field } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { EmptyState, Skeleton } from '@/components/ui/misc';
import {
  useMeasurementMutations,
  useMeasurements,
} from '@/hooks/use-measurements';
import { useAuthStore } from '@/lib/auth-store';
import { chartDate, fmt, todayISO } from '@/lib/format';
import { MEASUREMENT_LABELS, MEASUREMENT_TYPES } from '@/lib/labels';

const MetricChart = dynamic(
  () => import('@/components/progress/weight-chart'),
  { ssr: false, loading: () => <Skeleton className="h-56 w-full" /> },
);

export function MeasurementsTab() {
  const user = useAuthStore((s) => s.user);
  const imperial = user?.units === 'imperial';
  const unit = imperial ? 'in' : 'cm';
  const toDisplay = (cm: number) => (imperial ? cm / 2.54 : cm);
  const toCm = (v: number) => (imperial ? v * 2.54 : v);

  const measurements = useMeasurements();
  const { upsert, remove } = useMeasurementMutations();
  const [type, setType] = useState<string>('waist');
  const [value, setValue] = useState<number | null>(null);

  const all = measurements.data ?? [];
  const forType = useMemo(
    () => (measurements.data ?? []).filter((m) => m.type === type),
    [measurements.data, type],
  );
  const points = useMemo(
    () =>
      forType.map((m) => ({
        date: m.date.slice(0, 10),
        value: Math.round(toDisplay(m.value) * 10) / 10,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [forType, imperial],
  );

  const latest = forType.at(-1) ?? null;

  async function save() {
    if (value == null || value <= 0) return;
    await upsert.mutateAsync({
      date: todayISO(),
      type,
      value: Math.round(toCm(value) * 10) / 10,
    });
    setValue(null);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Seletor de medida */}
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {MEASUREMENT_TYPES.map((t) => {
          const has = all.some((m) => m.type === t);
          return (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`shrink-0 rounded-xl px-3 py-2 text-sm transition ${
                type === t
                  ? 'bg-accent text-accent-text'
                  : 'bg-surface-2 text-text-muted hover:text-text'
              }`}
            >
              {MEASUREMENT_LABELS[t]}
              {has ? <span className="ml-1 opacity-60">•</span> : null}
            </button>
          );
        })}
      </div>

      {measurements.isLoading ? (
        <Skeleton className="h-56 w-full" />
      ) : forType.length === 0 ? (
        <EmptyState
          icon={Ruler}
          title={`Sem registos de ${MEASUREMENT_LABELS[type].toLowerCase()}`}
          description="Adiciona a primeira medida abaixo."
        />
      ) : (
        <Card className="flex flex-col gap-4">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-sm text-text-muted">
                {MEASUREMENT_LABELS[type]} atual
              </span>
              <p className="stat text-hero leading-none">
                {fmt(toDisplay(latest!.value), 1)}{' '}
                <span className="text-base font-normal text-text-muted">
                  {unit}
                </span>
              </p>
            </div>
          </div>
          {points.length > 1 ? <MetricChart points={points} unit={unit} /> : null}
        </Card>
      )}

      <Card className="flex flex-col gap-3">
        <SectionTitle className="text-[15px]">
          Registar {MEASUREMENT_LABELS[type].toLowerCase()} hoje
        </SectionTitle>
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Field label={`Medida (${unit})`}>
              <NumberInput
                value={value}
                onValueChange={setValue}
                placeholder={latest ? fmt(toDisplay(latest.value), 1) : '80'}
              />
            </Field>
          </div>
          <Button onClick={save} disabled={upsert.isPending || !value}>
            Guardar
          </Button>
        </div>
      </Card>

      {forType.length > 0 ? (
        <div>
          <SectionTitle className="mb-2 text-[15px]">Histórico</SectionTitle>
          <Card className="divide-y divide-line p-0">
            {[...forType]
              .reverse()
              .slice(0, 12)
              .map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between px-4 py-2.5"
                >
                  <span className="text-sm text-text-muted">
                    {chartDate(m.date.slice(0, 10))}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="stat text-sm">
                      {fmt(toDisplay(m.value), 1)} {unit}
                    </span>
                    <button
                      onClick={() => remove.mutate(m.id)}
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
