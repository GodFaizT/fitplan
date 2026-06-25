'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { MeasurementsTab } from '@/components/progress/measurements-tab';
import { NutritionTab } from '@/components/progress/nutrition-tab';
import { TrainingTab } from '@/components/progress/training-tab';
import { WeightTab } from '@/components/progress/weight-tab';
import { Eyebrow, SectionTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/misc';
import { Segmented } from '@/components/ui/segmented';

type Tab = 'peso' | 'medidas' | 'treino' | 'nutricao';

const TABS: { value: Tab; label: string }[] = [
  { value: 'peso', label: 'Peso' },
  { value: 'medidas', label: 'Medidas' },
  { value: 'treino', label: 'Treino' },
  { value: 'nutricao', label: 'Nutrição' },
];

export default function ProgressPage() {
  return (
    <Suspense fallback={<Skeleton className="h-72 w-full" />}>
      <ProgressInner />
    </Suspense>
  );
}

function ProgressInner() {
  const searchParams = useSearchParams();
  const initial = (searchParams.get('tab') as Tab) ?? 'peso';
  const [tab, setTab] = useState<Tab>(
    TABS.some((t) => t.value === initial) ? initial : 'peso',
  );

  return (
    <div className="flex flex-col gap-6">
      <header className="animate-fade-up">
        <Eyebrow>Progresso</Eyebrow>
        <SectionTitle className="mt-1">A tua evolução</SectionTitle>
      </header>

      <Segmented options={TABS} value={tab} onChange={setTab} />

      <div className="animate-fade-up [animation-delay:60ms]">
        {tab === 'peso' ? <WeightTab /> : null}
        {tab === 'medidas' ? <MeasurementsTab /> : null}
        {tab === 'treino' ? <TrainingTab /> : null}
        {tab === 'nutricao' ? <NutritionTab /> : null}
      </div>
    </div>
  );
}
