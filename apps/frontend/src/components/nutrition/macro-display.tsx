'use client';

import type { NutritionResult } from '@fitplan/shared';
import { Card } from '@/components/ui/card';
import { fmt } from '@/lib/format';
import { MACROS } from '@/lib/macros';

export function MacroCards({ result }: { result: NutritionResult }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {MACROS.map((m) => {
        const Icon = m.icon;
        return (
          <Card key={m.key} className="p-3 sm:p-4">
            <div className="flex items-center gap-1.5">
              <Icon
                className="h-3.5 w-3.5"
                style={{ color: m.color }}
                strokeWidth={2.2}
              />
              <span className="text-[12px] text-text-muted">{m.label}</span>
            </div>
            <p className="mt-2 stat text-xl font-medium">
              {fmt(result.macros[m.key])}
              <span className="ml-0.5 text-sm font-normal text-text-muted">g</span>
            </p>
            <p className="text-[12px] text-text-muted">
              {result.macroPercents[m.key]}%
            </p>
          </Card>
        );
      })}
    </div>
  );
}
