'use client';

import type { NutritionResult } from '@fitplan/shared';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';
import { Dot } from '@/components/ui/misc';
import { fmt } from '@/lib/format';

const MACRO_META = [
  { key: 'protein', label: 'Proteína', color: 'var(--protein)' },
  { key: 'carbs', label: 'Hidratos', color: 'var(--carbs)' },
  { key: 'fat', label: 'Gordura', color: 'var(--fat)' },
] as const;

export function MacroDonut({ result }: { result: NutritionResult }) {
  const data = MACRO_META.map((m) => ({
    name: m.label,
    value: result.macroCalories[m.key],
    color: m.color,
  })).filter((d) => d.value > 0);

  return (
    <div className="relative h-44 w-44">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius={56}
            outerRadius={80}
            paddingAngle={2}
            stroke="none"
            startAngle={90}
            endAngle={-270}
          >
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-medium tabular">
          {fmt(result.targetCalories)}
        </span>
        <span className="text-[12px] text-text-muted">kcal</span>
      </div>
    </div>
  );
}

export function MacroCards({ result }: { result: NutritionResult }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {MACRO_META.map((m) => (
        <Card key={m.key} className="p-3 sm:p-4">
          <div className="flex items-center gap-1.5">
            <Dot color={m.color} />
            <span className="text-[12px] text-text-muted">{m.label}</span>
          </div>
          <p className="mt-2 text-xl font-medium tabular">
            {fmt(result.macros[m.key])}
            <span className="ml-0.5 text-sm text-text-muted">g</span>
          </p>
          <p className="text-[12px] text-text-muted">
            {result.macroPercents[m.key]}%
          </p>
        </Card>
      ))}
    </div>
  );
}
