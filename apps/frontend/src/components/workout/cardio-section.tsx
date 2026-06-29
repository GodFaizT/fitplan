'use client';

import {
  Activity,
  Bike,
  Footprints,
  HeartPulse,
  Mountain,
  Plus,
  Trash2,
  Waves,
} from 'lucide-react';
import { type ComponentType, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, SectionTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Field, Input } from '@/components/ui/input';
import { EmptyState, Skeleton } from '@/components/ui/misc';
import { Modal } from '@/components/ui/modal';
import { NumberInput } from '@/components/ui/number-input';
import { useCardio, useCardioMutations } from '@/hooks/use-cardio';
import { chartDate, fmt, todayISO } from '@/lib/format';
import { toast } from '@/lib/toast';

interface TypeMeta {
  value: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

const TYPES: TypeMeta[] = [
  { value: 'run', label: 'Corrida', icon: Activity },
  { value: 'walk', label: 'Caminhada', icon: Footprints },
  { value: 'bike', label: 'Bicicleta', icon: Bike },
  { value: 'swim', label: 'Natação', icon: Waves },
  { value: 'row', label: 'Remo', icon: HeartPulse },
  { value: 'elliptical', label: 'Elíptica', icon: Activity },
  { value: 'hike', label: 'Trilho', icon: Mountain },
  { value: 'other', label: 'Outro', icon: HeartPulse },
];

const META = new Map(TYPES.map((t) => [t.value, t]));

function typeMeta(value: string): TypeMeta {
  return META.get(value) ?? { value, label: 'Outro', icon: HeartPulse };
}

/** "45 min" ou "1h 05". */
function formatDuration(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h ${String(m).padStart(2, '0')}`;
}

export function CardioSection() {
  const cardio = useCardio();
  const { create, remove } = useCardioMutations();

  const [open, setOpen] = useState(false);
  const [type, setType] = useState('run');
  const [date, setDate] = useState(todayISO());
  const [duration, setDuration] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [calories, setCalories] = useState<number | null>(null);
  const [note, setNote] = useState('');

  function openModal() {
    setType('run');
    setDate(todayISO());
    setDuration(null);
    setDistance(null);
    setCalories(null);
    setNote('');
    setOpen(true);
  }

  const [toDelete, setToDelete] = useState<string | null>(null);

  async function save() {
    if (!duration || duration <= 0) {
      toast.error('Indica a duração');
      return;
    }
    try {
      await create.mutateAsync({
        date,
        type,
        durationMin: Math.round(duration),
        distanceKm: distance ?? undefined,
        calories: calories != null ? Math.round(calories) : undefined,
        note: note.trim() || undefined,
      });
      toast.success('Cardio registado');
      setOpen(false);
    } catch {
      toast.error('Não foi possível guardar');
    }
  }

  const list = cardio.data ?? [];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <SectionTitle className="text-[15px]">Cardio</SectionTitle>
        {list.length > 0 ? (
          <Button variant="secondary" size="sm" onClick={openModal}>
            <Plus className="h-4 w-4" /> Registar
          </Button>
        ) : null}
      </div>

      {cardio.isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : list.length === 0 ? (
        <EmptyState
          icon={HeartPulse}
          title="Sem cardio registado"
          description="Regista corrida, bicicleta, natação ou caminhada para acompanhares a tua atividade."
          action={
            <Button size="sm" onClick={openModal}>
              <Plus className="h-4 w-4" /> Registar cardio
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-2">
          {list.slice(0, 10).map((c) => {
            const meta = typeMeta(c.type);
            const Icon = meta.icon;
            return (
              <Card key={c.id} className="flex items-center gap-3 p-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {meta.label}
                    {c.note ? (
                      <span className="font-normal text-text-muted"> · {c.note}</span>
                    ) : null}
                  </p>
                  <p className="stat text-[12px] text-text-muted">
                    {chartDate(c.date.slice(0, 10))} · {formatDuration(c.durationMin)}
                    {c.distanceKm ? ` · ${fmt(c.distanceKm, 1)} km` : ''}
                    {c.calories ? ` · ${fmt(c.calories)} kcal` : ''}
                  </p>
                </div>
                <button
                  onClick={() => setToDelete(c.id)}
                  className="rounded p-1.5 text-text-muted hover:text-danger"
                  aria-label="Remover registo"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Registar cardio">
        <div className="flex flex-col gap-4">
          <div>
            <span className="mb-1.5 block text-sm text-text-muted">Tipo</span>
            <div className="grid grid-cols-4 gap-2">
              {TYPES.map((t) => {
                const Icon = t.icon;
                const active = type === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setType(t.value)}
                    className={`flex flex-col items-center gap-1 rounded-xl border px-1 py-2 text-[11px] transition ${
                      active
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-line text-text-muted hover:border-accent/40'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="truncate">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Duração (min)">
              <NumberInput
                value={duration}
                onValueChange={setDuration}
                inputMode="numeric"
                placeholder="45"
              />
            </Field>
            <Field label="Distância (km)">
              <NumberInput
                value={distance}
                onValueChange={setDistance}
                placeholder="opcional"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Calorias (kcal)">
              <NumberInput
                value={calories}
                onValueChange={setCalories}
                inputMode="numeric"
                placeholder="opcional"
              />
            </Field>
            <Field label="Data">
              <Input
                type="date"
                value={date}
                max={todayISO()}
                onChange={(e) => setDate(e.target.value)}
              />
            </Field>
          </div>

          <Field label="Nota (opcional)">
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="ex: tempo fácil, parque da cidade"
            />
          </Field>

          <Button onClick={save} disabled={create.isPending || !duration}>
            {create.isPending ? 'A guardar…' : 'Guardar'}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) remove.mutate(toDelete);
          setToDelete(null);
        }}
        title="Remover registo"
        description="Este registo de cardio será apagado."
        confirmLabel="Remover"
      />
    </div>
  );
}
