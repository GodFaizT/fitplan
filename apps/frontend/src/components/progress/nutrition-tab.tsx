'use client';

import { Flame } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { Card, SectionTitle } from '@/components/ui/card';
import { EmptyState, Skeleton } from '@/components/ui/misc';
import { useNutritionSummary } from '@/hooks/use-meals';
import { addDays, fmt, todayISO } from '@/lib/format';

const MetricChart = dynamic(
  () => import('@/components/progress/weight-chart'),
  { ssr: false, loading: () => <Skeleton className="h-56 w-full" /> },
);

export function NutritionTab() {
  const to = todayISO();
  const from = addDays(to, -13);
  const summary = useNutritionSummary(from, to);

  const days = useMemo(
    () => (summary.data ?? []).filter((d) => d.calories > 0),
    [summary.data],
  );

  const points = days.map((d) => ({ date: d.date, value: d.calories }));

  const avg = useMemo(() => {
    if (days.length === 0) return null;
    const sum = days.reduce(
      (a, d) => ({
        calories: a.calories + d.calories,
        protein: a.protein + d.protein,
        carbs: a.carbs + d.carbs,
        fat: a.fat + d.fat,
        water: a.water + d.water,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, water: 0 },
    );
    const n = days.length;
    return {
      calories: Math.round(sum.calories / n),
      protein: Math.round(sum.protein / n),
      carbs: Math.round(sum.carbs / n),
      fat: Math.round(sum.fat / n),
      water: Math.round((sum.water / n) * 10) / 10,
    };
  }, [days]);

  if (summary.isLoading) return <Skeleton className="h-72 w-full" />;

  if (days.length === 0) {
    return (
      <EmptyState
        icon={Flame}
        title="Sem dados de nutrição"
        description="Regista alimentos nas Refeições para veres as tuas tendências aqui."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col gap-3">
        <SectionTitle className="text-[15px]">Calorias · últimos 14 dias</SectionTitle>
        {points.length > 1 ? (
          <MetricChart points={points} unit="kcal" />
        ) : (
          <p className="text-sm text-text-muted">
            Regista mais um dia para veres o gráfico.
          </p>
        )}
      </Card>

      {avg ? (
        <div>
          <SectionTitle className="mb-2 text-[15px]">
            Médias diárias ({days.length} {days.length === 1 ? 'dia' : 'dias'})
          </SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Calorias" value={`${fmt(avg.calories)} kcal`} />
            <Stat label="Proteína" value={`${fmt(avg.protein)} g`} />
            <Stat label="Hidratos" value={`${fmt(avg.carbs)} g`} />
            <Stat label="Gordura" value={`${fmt(avg.fat)} g`} />
            <Stat label="Água" value={`${fmt(avg.water, 1)} copos`} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="flex flex-col gap-0.5 py-3.5">
      <span className="text-[12px] text-text-muted">{label}</span>
      <span className="stat text-xl leading-none">{value}</span>
    </Card>
  );
}
