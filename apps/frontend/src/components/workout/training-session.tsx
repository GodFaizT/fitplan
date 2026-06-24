'use client';

import { Check, ChevronLeft, ChevronRight, Timer, Trophy } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, Eyebrow } from '@/components/ui/card';
import { YouTubeEmbed } from '@/components/workout/youtube-embed';
import { muscleLabel } from '@/lib/labels';
import type { PlanExercise } from '@/lib/types';
import { RestTimer } from './rest-timer';

/** Sessão de treino guiada: um exercício de cada vez, com séries e descanso. */
export function TrainingSession({ exercises }: { exercises: PlanExercise[] }) {
  const [current, setCurrent] = useState(0);
  const [done, setDone] = useState<Record<string, boolean[]>>({});
  const [rest, setRest] = useState<{ key: number; seconds: number } | null>(null);
  const restKey = useRef(0);

  if (exercises.length === 0) return null;

  const ex = exercises[current];
  const sets = Math.max(ex.sets, 1);
  const exDone = done[ex.id] ?? Array<boolean>(sets).fill(false);
  const completedSets = exDone.filter(Boolean).length;

  const overallSets = exercises.reduce((n, e) => n + Math.max(e.sets, 1), 0);
  const overallDone = exercises.reduce(
    (n, e) => n + (done[e.id]?.filter(Boolean).length ?? 0),
    0,
  );
  const allDone = overallDone >= overallSets;

  function startRest(seconds: number) {
    restKey.current += 1;
    setRest({ key: restKey.current, seconds });
  }

  function toggleSet(j: number) {
    const arr = (done[ex.id] ?? Array<boolean>(sets).fill(false)).slice();
    const wasDone = arr[j];
    arr[j] = !arr[j];
    setDone({ ...done, [ex.id]: arr });
    // ao concluir uma série (não a última do exercício) → arranca o descanso
    if (!wasDone && j < sets - 1 && ex.restSeconds > 0) startRest(ex.restSeconds);
  }

  if (allDone) {
    return (
      <Card className="flex flex-col items-center gap-3 py-12 text-center">
        <Trophy className="h-10 w-10 text-accent" />
        <p className="text-lg font-medium">Treino concluído 💪</p>
        <p className="text-sm text-text-muted">Boa! Todas as séries feitas.</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Progresso geral */}
      <div>
        <div className="mb-1.5 flex items-center justify-between text-[12px] text-text-muted">
          <span>
            Exercício {current + 1}/{exercises.length}
          </span>
          <span className="stat">
            {overallDone}/{overallSets} séries
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-pill bg-surface-2">
          <div
            className="h-full rounded-pill bg-accent transition-[width] duration-300"
            style={{ width: `${(overallDone / overallSets) * 100}%` }}
          />
        </div>
      </div>

      <Card className="flex flex-col gap-4">
        <div>
          <Eyebrow>{muscleLabel(ex.muscleGroup)}</Eyebrow>
          <p className="mt-0.5 text-lg font-medium">{ex.name}</p>
          <p className="stat mt-1 text-sm text-text-muted">
            {ex.sets} × {ex.reps}
            {ex.weight ? ` · ${ex.weight} kg` : ''}
          </p>
        </div>

        {ex.videoUrl ? (
          <YouTubeEmbed url={ex.videoUrl} name={ex.name} />
        ) : ex.imageUrls.length > 0 ? (
          <div className="flex gap-2">
            {ex.imageUrls.slice(0, 2).map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={src}
                src={src}
                alt=""
                className="h-32 w-1/2 rounded-lg object-cover"
                loading="lazy"
              />
            ))}
          </div>
        ) : null}

        {/* Séries — tocar para marcar; arranca o descanso */}
        <div>
          <p className="mb-2 text-[12px] uppercase tracking-[0.04em] text-text-muted">
            Séries · {completedSets}/{sets}
          </p>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: sets }).map((_, j) => (
              <button
                key={j}
                onClick={() => toggleSet(j)}
                aria-label={`Série ${j + 1}${exDone[j] ? ' (feita)' : ''}`}
                aria-pressed={exDone[j]}
                className={`flex h-11 w-11 items-center justify-center rounded-xl border text-sm transition ${
                  exDone[j]
                    ? 'border-accent bg-accent text-accent-text'
                    : 'border-line bg-surface-2 text-text-muted hover:border-accent/50'
                }`}
              >
                {exDone[j] ? <Check className="h-5 w-5" /> : j + 1}
              </button>
            ))}
          </div>
        </div>

        {ex.restSeconds > 0 ? (
          <button
            onClick={() => startRest(ex.restSeconds)}
            className="inline-flex items-center gap-1.5 self-start text-sm text-accent hover:underline"
          >
            <Timer className="h-4 w-4" /> Iniciar descanso ({ex.restSeconds}s)
          </button>
        ) : null}
      </Card>

      {/* Navegação entre exercícios */}
      <div className="flex gap-2">
        <Button
          variant="secondary"
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
        >
          <ChevronLeft className="h-4 w-4" /> Anterior
        </Button>
        <Button
          className="flex-1"
          variant={completedSets >= sets ? 'primary' : 'secondary'}
          onClick={() => setCurrent((c) => Math.min(exercises.length - 1, c + 1))}
          disabled={current === exercises.length - 1}
        >
          Seguinte <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {rest ? (
        <RestTimer
          key={rest.key}
          seconds={rest.seconds}
          onClose={() => setRest(null)}
        />
      ) : null}
    </div>
  );
}
