'use client';

import { Pause, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

/** Cronómetro de descanso (barra inferior). Vibra ao terminar. */
export function RestTimer({
  seconds,
  onClose,
}: {
  seconds: number;
  onClose: () => void;
}) {
  const [endAt, setEndAt] = useState(() => Date.now() + seconds * 1000);
  const [remaining, setRemaining] = useState(seconds);
  const [paused, setPaused] = useState(false);
  const [pausedRemaining, setPausedRemaining] = useState(seconds);
  const total = useRef(seconds);
  const buzzed = useRef(false);

  useEffect(() => {
    if (paused) return;
    const tick = () => {
      const r = Math.max(0, Math.round((endAt - Date.now()) / 1000));
      setRemaining(r);
      if (r <= 0 && !buzzed.current) {
        buzzed.current = true;
        try {
          navigator.vibrate?.([180, 80, 180]);
        } catch {
          /* sem suporte a vibração */
        }
      }
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [endAt, paused]);

  function togglePause() {
    if (paused) {
      setEndAt(Date.now() + pausedRemaining * 1000);
      setPaused(false);
    } else {
      setPausedRemaining(remaining);
      setPaused(true);
    }
  }

  function add15() {
    buzzed.current = false;
    total.current += 15;
    if (paused) setPausedRemaining((r) => r + 15);
    else setEndAt((e) => e + 15000);
  }

  const done = remaining <= 0;
  const pct = total.current > 0 ? Math.min(100, (remaining / total.current) * 100) : 0;
  const mm = Math.floor(remaining / 60);
  const ss = remaining % 60;
  const label = mm > 0 ? `${mm}:${String(ss).padStart(2, '0')}` : `${ss}s`;

  return (
    <div className="safe-bottom fixed inset-x-0 bottom-0 z-[60] border-t border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-content items-center gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between">
            <span className="text-[12px] uppercase tracking-[0.04em] text-text-muted">
              {done ? 'Descanso terminado' : paused ? 'Em pausa' : 'Descanso'}
            </span>
            <span
              className={`stat text-2xl font-medium ${done ? 'text-accent' : 'text-text'}`}
            >
              {done ? 'Vai! 💪' : label}
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-pill bg-surface-2">
            <div
              className="h-full rounded-pill bg-accent transition-[width] duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {!done ? (
          <>
            <button
              onClick={add15}
              className="shrink-0 rounded-lg px-2 py-2 text-sm text-text-muted hover:text-text"
            >
              +15s
            </button>
            <button
              onClick={togglePause}
              aria-label={paused ? 'Retomar' : 'Pausar'}
              className="shrink-0 rounded-lg p-2 text-text-muted hover:text-text"
            >
              {paused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
            </button>
          </>
        ) : null}

        <button
          onClick={onClose}
          className="shrink-0 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-accent-text"
        >
          {done ? 'OK' : 'Saltar'}
        </button>
      </div>
    </div>
  );
}
