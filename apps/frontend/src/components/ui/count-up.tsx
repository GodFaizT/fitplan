'use client';

import { animate, useMotionValue, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface CountUpProps {
  value: number;
  /** Formata o número apresentado (ex: arredondar, separador de milhares). */
  format?: (n: number) => string;
  durationMs?: number;
  className?: string;
}

/**
 * Número que conta suavemente até ao valor — reforça o momento do anel/herói.
 * Respeita prefers-reduced-motion (mostra o valor final de imediato).
 */
export function CountUp({
  value,
  format = (n) => Math.round(n).toString(),
  durationMs = 800,
  className,
}: CountUpProps) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState(() => format(value));

  useEffect(() => {
    if (reduce) {
      setDisplay(format(value));
      return;
    }
    const controls = animate(mv, value, {
      duration: durationMs / 1000,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(format(v)),
    });
    return () => controls.stop();
    // format é estável (definido no parent); value/duração disparam a animação
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, durationMs, reduce]);

  return <span className={className}>{display}</span>;
}
