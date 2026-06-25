'use client';

import { Check, ChevronLeft, ChevronRight, Flag, Timer, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, Eyebrow } from '@/components/ui/card';
import { NumberInput } from '@/components/ui/number-input';
import { YouTubeEmbed } from '@/components/workout/youtube-embed';
import { useSessionMutations } from '@/hooks/use-sessions';
import { muscleLabel } from '@/lib/labels';
import { toast } from '@/lib/toast';
import type { NewSetLog, PlanExercise } from '@/lib/types';
import { RestTimer } from './rest-timer';

interface SetEntry {
  done: boolean;
  weight: number | null;
  reps: number | null;
}

/** Primeiro inteiro de uma string de reps ("8-12" → 8), ou null. */
function firstReps(reps: string): number | null {
  const m = reps.match(/\d+/);
  return m ? Number(m[0]) : null;
}

function defaultEntries(ex: PlanExercise): SetEntry[] {
  const sets = Math.max(ex.sets, 1);
  return Array.from({ length: sets }, () => ({
    done: false,
    weight: ex.weight ?? null,
    reps: firstReps(ex.reps),
  }));
}

/** Sessão de treino guiada: um exercício de cada vez, com séries e descanso. */
export function TrainingSession({
  exercises,
  planId,
  planName,
  dayLabel,
}: {
  exercises: PlanExercise[];
  planId?: string;
  planName?: string;
  dayLabel?: string;
}) {
  const [current, setCurrent] = useState(0);
  const [log, setLog] = useState<Record<string, SetEntry[]>>({});
  const [rest, setRest] = useState<{ key: number; seconds: number } | null>(null);
  const [finishing, setFinishing] = useState(false);
  const [saved, setSaved] = useState(false);
  const restKey = useRef(0);
  const [startedAt] = useState(() => Date.now());
  const { create } = useSessionMutations();

  if (exercises.length === 0) return null;

  const ex = exercises[current];
  const entries = log[ex.id] ?? defaultEntries(ex);
  const completedSets = entries.filter((e) => e.done).length;
  const sets = entries.length;

  const overallSets = exercises.reduce((n, e) => n + Math.max(e.sets, 1), 0);
  const overallDone = exercises.reduce(
    (n, e) => n + (log[e.id]?.filter((s) => s.done).length ?? 0),
    0,
  );
  const allDone = overallDone >= overallSets;

  function startRest(seconds: number) {
    restKey.current += 1;
    setRest({ key: restKey.current, seconds });
  }

  function updateEntry(j: number, patch: Partial<SetEntry>) {
    const arr = (log[ex.id] ?? defaultEntries(ex)).map((e, i) =>
      i === j ? { ...e, ...patch } : e,
    );
    setLog({ ...log, [ex.id]: arr });
  }

  function toggleSet(j: number) {
    const wasDone = entries[j].done;
    updateEntry(j, { done: !wasDone });
    if (!wasDone && j < sets - 1 && ex.restSeconds > 0) startRest(ex.restSeconds);
  }

  function buildSets(): NewSetLog[] {
    const out: NewSetLog[] = [];
    for (const e of exercises) {
      const es = log[e.id];
      if (!es) continue;
      es.forEach((s, j) => {
        if (!s.done) return;
        out.push({
          exerciseName: e.name,
          muscleGroup: e.muscleGroup ?? undefined,
          setNumber: j + 1,
          weight: s.weight ?? undefined,
          reps: s.reps ?? undefined,
        });
      });
    }
    return out;
  }

  async function save() {
    const setsPayload = buildSets();
    if (setsPayload.length === 0) {
      toast.error('Marca pelo menos uma série como feita');
      return;
    }
    try {
      await create.mutateAsync({
        planId,
        planName,
        dayLabel,
        durationSec: Math.round((Date.now() - startedAt) / 1000),
        sets: setsPayload,
      });
      setSaved(true);
      toast.success('Treino guardado 💪');
    } catch {
      toast.error('Não foi possível guardar o treino');
    }
  }

  // ---- Ecrã final (guardar) ------------------------------------------------
  if (saved) {
    const total = buildSets().length;
    return (
      <Card className="flex flex-col items-center gap-3 py-12 text-center">
        <Trophy className="h-10 w-10 text-accent" />
        <p className="text-lg font-medium">Treino guardado 💪</p>
        <p className="text-sm text-text-muted">
          {total} séries registadas no teu histórico.
        </p>
        <Link href="/progresso?tab=treino">
          <Button variant="secondary" size="sm">
            Ver progresso
          </Button>
        </Link>
      </Card>
    );
  }

  if (finishing || allDone) {
    const setsPayload = buildSets();
    const volume = setsPayload.reduce(
      (n, s) => n + (s.weight ?? 0) * (s.reps ?? 0),
      0,
    );
    return (
      <Card className="flex flex-col items-center gap-4 py-10 text-center">
        <Trophy className="h-10 w-10 text-accent" />
        <div>
          <p className="text-lg font-medium">
            {allDone ? 'Treino concluído 💪' : 'Terminar treino?'}
          </p>
          <p className="mt-1 text-sm text-text-muted">
            {setsPayload.length} séries · {Math.round(volume).toLocaleString('pt-PT')} kg de volume
          </p>
        </div>
        <div className="flex w-full max-w-xs flex-col gap-2">
          <Button onClick={save} disabled={create.isPending}>
            {create.isPending ? 'A guardar…' : 'Guardar treino'}
          </Button>
          {!allDone ? (
            <Button variant="ghost" size="sm" onClick={() => setFinishing(false)}>
              Continuar treino
            </Button>
          ) : null}
        </div>
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

        {/* Séries — marca como feita e regista carga × reps */}
        <div>
          <div className="mb-2 flex items-center justify-between text-[12px] uppercase tracking-[0.04em] text-text-muted">
            <span>Séries · {completedSets}/{sets}</span>
            <span className="flex gap-6 pr-1 normal-case tracking-normal">
              <span>kg</span>
              <span>reps</span>
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {entries.map((e, j) => (
              <div key={j} className="flex items-center gap-2">
                <button
                  onClick={() => toggleSet(j)}
                  aria-label={`Série ${j + 1}${e.done ? ' (feita)' : ''}`}
                  aria-pressed={e.done}
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-sm transition ${
                    e.done
                      ? 'border-accent bg-accent text-accent-text'
                      : 'border-line bg-surface-2 text-text-muted hover:border-accent/50'
                  }`}
                >
                  {e.done ? <Check className="h-5 w-5" /> : j + 1}
                </button>
                <NumberInput
                  value={e.weight}
                  onValueChange={(n) => updateEntry(j, { weight: n })}
                  className="stat h-11 flex-1 text-center"
                  aria-label={`Carga da série ${j + 1} (kg)`}
                  placeholder="—"
                />
                <NumberInput
                  value={e.reps}
                  onValueChange={(n) => updateEntry(j, { reps: n })}
                  inputMode="numeric"
                  className="stat h-11 flex-1 text-center"
                  aria-label={`Reps da série ${j + 1}`}
                  placeholder="—"
                />
              </div>
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

      <button
        onClick={() => setFinishing(true)}
        disabled={overallDone === 0}
        className="inline-flex items-center justify-center gap-1.5 self-center text-sm text-text-muted transition hover:text-text disabled:opacity-40"
      >
        <Flag className="h-4 w-4" /> Terminar e guardar treino
      </button>

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
