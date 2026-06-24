'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useId } from 'react';

interface RingProps {
  value: number;
  max: number;
  size?: number;
  stroke?: number;
  children?: React.ReactNode;
}

/** Anel de progresso circular (resumo de calorias). PROJECT.md 8.4. */
export function Ring({
  value,
  max,
  size = 176,
  stroke = 13,
  children,
}: RingProps) {
  const reduce = useReducedMotion();
  const gradId = useId().replace(/:/g, ''); // id válido para url(#...)
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const over = max > 0 && value > max;

  const arcColor = over ? 'var(--danger)' : 'var(--accent)';
  const sheen = over
    ? 'var(--danger)'
    : 'color-mix(in srgb, var(--accent) 55%, #ffffff)';
  const glow = `drop-shadow(0 0 7px color-mix(in srgb, ${arcColor} 50%, transparent))`;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: arcColor }} />
            <stop offset="100%" style={{ stopColor: sheen }} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--surface-2)"
          strokeWidth={stroke}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradId})`}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{
            strokeDashoffset: reduce
              ? circumference - circumference * pct
              : circumference,
          }}
          animate={{ strokeDashoffset: circumference - circumference * pct }}
          transition={{ duration: reduce ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{ filter: glow }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  );
}
