'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

interface ProgressBarProps {
  value: number;
  max: number;
  /** Cor do preenchimento (ex: 'var(--protein)'). */
  color?: string;
  className?: string;
}

/** Barra de progresso pill, anima do 0 ao valor. Fica vermelha se exceder. */
export function ProgressBar({
  value,
  max,
  color = 'var(--accent)',
  className,
}: ProgressBarProps) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const over = max > 0 && value > max;
  return (
    <div
      className={cn(
        'h-2.5 w-full overflow-hidden rounded-pill bg-surface-2',
        className,
      )}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="h-full rounded-pill"
        style={{
          background: over
            ? 'var(--danger)'
            : `linear-gradient(90deg, ${color}, color-mix(in srgb, ${color} 70%, #ffffff))`,
          boxShadow: `0 0 10px -2px color-mix(in srgb, ${
            over ? 'var(--danger)' : color
          } 55%, transparent)`,
        }}
      />
    </div>
  );
}
