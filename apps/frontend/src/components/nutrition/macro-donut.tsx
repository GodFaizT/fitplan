'use client';

import type { NutritionResult } from '@fitplan/shared';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { fmt } from '@/lib/format';
import { MACROS } from '@/lib/macros';

/** Donut da divisão calórica (carregado via lazy import — recharts é pesado). */
export default function MacroDonut({ result }: { result: NutritionResult }) {
  const data = MACROS.map((m) => ({
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
        <span className="stat text-2xl font-medium">
          {fmt(result.targetCalories)}
        </span>
        <span className="text-[12px] text-text-muted">kcal</span>
      </div>
    </div>
  );
}
