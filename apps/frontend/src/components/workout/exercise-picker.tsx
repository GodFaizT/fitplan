'use client';

import { Search } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Input, Select } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/misc';
import { Modal } from '@/components/ui/modal';
import { Segmented } from '@/components/ui/segmented';
import { useExerciseFacets, useExerciseSearch } from '@/hooks/use-exercises';
import { muscleLabel } from '@/lib/labels';
import type { LibraryExercise, PlanExercise } from '@/lib/types';

export type NewExercise = Partial<PlanExercise> & {
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
};

/** Parâmetros pessoais comuns ao adicionar (séries/reps/descanso/carga). */
function ParamsForm({
  onConfirm,
  busy,
}: {
  onConfirm: (p: { sets: number; reps: string; restSeconds: number; weight?: number }) => void;
  busy?: boolean;
}) {
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState('8-12');
  const [rest, setRest] = useState(90);
  const [weight, setWeight] = useState<number | ''>('');
  return (
    <div className="mt-3 grid grid-cols-2 gap-3 rounded-xl bg-surface-2 p-3 sm:grid-cols-4">
      <Field label="Séries">
        <Input type="number" value={sets} onChange={(e) => setSets(Number(e.target.value))} />
      </Field>
      <Field label="Reps">
        <Input value={reps} onChange={(e) => setReps(e.target.value)} />
      </Field>
      <Field label="Descanso (s)">
        <Input type="number" value={rest} onChange={(e) => setRest(Number(e.target.value))} />
      </Field>
      <Field label="Carga (kg)">
        <Input
          type="number"
          value={weight}
          onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
        />
      </Field>
      <div className="col-span-2 sm:col-span-4">
        <Button
          className="w-full"
          disabled={busy}
          onClick={() =>
            onConfirm({
              sets,
              reps,
              restSeconds: rest,
              weight: weight === '' ? undefined : weight,
            })
          }
        >
          Adicionar ao dia
        </Button>
      </div>
    </div>
  );
}

export function ExercisePicker({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (ex: NewExercise) => Promise<void>;
}) {
  const [mode, setMode] = useState<'library' | 'manual'>('library');
  const [search, setSearch] = useState('');
  const [muscle, setMuscle] = useState('');
  const facets = useExerciseFacets();
  const results = useExerciseSearch({ search, muscle });
  const [selected, setSelected] = useState<LibraryExercise | null>(null);

  // manual
  const [mName, setMName] = useState('');
  const [mMuscle, setMMuscle] = useState('');
  const [busy, setBusy] = useState(false);

  async function addFromLibrary(
    ex: LibraryExercise,
    p: { sets: number; reps: string; restSeconds: number; weight?: number },
  ) {
    setBusy(true);
    try {
      await onAdd({
        libraryId: ex.id,
        name: ex.name,
        muscleGroup: ex.primaryMuscles[0] ?? null,
        imageUrls: ex.imageUrls,
        instructions: ex.instructions,
        ...p,
      });
      setSelected(null);
      onClose();
    } finally {
      setBusy(false);
    }
  }

  async function addManual(p: {
    sets: number;
    reps: string;
    restSeconds: number;
    weight?: number;
  }) {
    if (!mName.trim()) return;
    setBusy(true);
    try {
      await onAdd({ name: mName.trim(), muscleGroup: mMuscle || null, ...p });
      setMName('');
      setMMuscle('');
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Adicionar exercício">
      <Segmented
        className="mb-4"
        value={mode}
        onChange={setMode}
        options={[
          { value: 'library', label: 'Biblioteca' },
          { value: 'manual', label: 'Manual' },
        ]}
      />

      {mode === 'library' ? (
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquisar exercício…"
                className="pl-9"
              />
            </div>
            <Select value={muscle} onChange={(e) => setMuscle(e.target.value)} className="w-36">
              <option value="">Músculo</option>
              {facets.data?.muscles.map((mm) => (
                <option key={mm} value={mm}>
                  {muscleLabel(mm)}
                </option>
              ))}
            </Select>
          </div>

          <div className="max-h-[50vh] overflow-y-auto">
            {results.isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              <ul className="flex flex-col gap-1">
                {results.data?.map((ex) => (
                  <li key={ex.id} className="rounded-xl">
                    <button
                      onClick={() => setSelected(selected?.id === ex.id ? null : ex)}
                      className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-surface-2"
                    >
                      {ex.imageUrls[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={ex.imageUrls[0]}
                          alt=""
                          className="h-12 w-12 rounded-lg object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-surface-2" />
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm">{ex.name}</p>
                        <p className="text-[12px] text-text-muted">
                          {muscleLabel(ex.primaryMuscles[0])}
                          {ex.equipment ? ` · ${ex.equipment}` : ''}
                        </p>
                      </div>
                    </button>
                    {selected?.id === ex.id ? (
                      <ParamsForm busy={busy} onConfirm={(p) => addFromLibrary(ex, p)} />
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <Field label="Nome">
            <Input value={mName} onChange={(e) => setMName(e.target.value)} placeholder="ex: Supino reto" />
          </Field>
          <Field label="Grupo muscular">
            <Input value={mMuscle} onChange={(e) => setMMuscle(e.target.value)} placeholder="ex: chest" />
          </Field>
          <ParamsForm busy={busy} onConfirm={addManual} />
        </div>
      )}
    </Modal>
  );
}
