'use client';

import {
  ArrowLeft,
  ChevronDown,
  Copy,
  Pencil,
  Play,
  Plus,
  Share2,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { ExercisePicker } from '@/components/workout/exercise-picker';
import { TrainingSession } from '@/components/workout/training-session';
import { YouTubeEmbed } from '@/components/workout/youtube-embed';
import { Button } from '@/components/ui/button';
import { Card, Eyebrow } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Field, Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { EmptyState, Skeleton } from '@/components/ui/misc';
import { Modal } from '@/components/ui/modal';
import { usePlan, usePlanMutations } from '@/hooks/use-plans';
import { useAuthStore } from '@/lib/auth-store';
import { muscleLabel } from '@/lib/labels';
import { toast } from '@/lib/toast';
import type { PlanExercise, WorkoutDay } from '@/lib/types';

export default function PlanDetailPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <PlanDetailInner />
    </Suspense>
  );
}

function PlanDetailInner() {
  const params = useParams<{ id: string }>();
  const planId = params.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);

  const plan = usePlan(planId);
  const mut = usePlanMutations(planId);

  const [selectedDayId, setSelectedDayId] = useState<string | null>(
    searchParams.get('dia'),
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [addDayOpen, setAddDayOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [editEx, setEditEx] = useState<PlanExercise | null>(null);
  const [trainingMode, setTrainingMode] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (plan.isLoading) return <Skeleton className="h-64 w-full" />;
  if (!plan.data) return <p className="text-text-muted">Plano não encontrado.</p>;

  const p = plan.data;
  const mine = p.ownerId === user?.id;
  const days = p.days ?? [];
  const selectedDay =
    days.find((d) => d.id === selectedDayId) ?? days[0] ?? null;

  function moveExercise(day: WorkoutDay, index: number, dir: -1 | 1) {
    const ids = day.exercises.map((e) => e.id);
    const j = index + dir;
    if (j < 0 || j >= ids.length) return;
    [ids[index], ids[j]] = [ids[j], ids[index]];
    mut.reorderExercises.mutate({ dayId: day.id, ids });
  }

  async function onShare() {
    setShareOpen(true);
    if (!p.shareCode) {
      await mut.share.mutateAsync(planId);
    }
  }

  async function onDeletePlan() {
    await mut.deletePlan.mutateAsync(planId);
    router.push('/treino');
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link href="/treino" className="rounded-lg p-1.5 text-text-muted hover:bg-surface-2">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <Eyebrow>{mine ? 'O meu plano' : `de ${p.owner?.name ?? p.owner?.email}`}</Eyebrow>
            <h1 className="text-xl font-medium">{p.name}</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={trainingMode ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setTrainingMode((v) => !v)}
          >
            <Play className="h-4 w-4" /> Treino
          </Button>
          {mine ? (
            <>
              <Button variant="secondary" size="icon" onClick={onShare} aria-label="Partilhar">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={() => setConfirmDelete(true)}
                aria-label="Eliminar plano"
                className="text-text-muted hover:text-danger"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          ) : null}
        </div>
      </header>

      {/* Day tabs */}
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {days.map((d) => (
          <button
            key={d.id}
            onClick={() => setSelectedDayId(d.id)}
            className={`shrink-0 rounded-xl px-3 py-2 text-sm transition ${
              selectedDay?.id === d.id
                ? 'bg-accent text-accent-text'
                : 'bg-surface-2 text-text-muted hover:text-text'
            }`}
          >
            {d.label}
          </button>
        ))}
        {mine ? (
          <button
            onClick={() => setAddDayOpen(true)}
            className="shrink-0 rounded-xl border border-dashed border-line px-3 py-2 text-sm text-text-muted hover:text-text"
          >
            <Plus className="inline h-4 w-4" /> Dia
          </button>
        ) : null}
      </div>

      {/* Day content */}
      {!selectedDay ? (
        <EmptyState
          title="Plano sem dias"
          description={mine ? 'Adiciona o primeiro dia de treino.' : 'O dono ainda não adicionou dias.'}
          action={
            mine ? (
              <Button size="sm" onClick={() => setAddDayOpen(true)}>
                <Plus className="h-4 w-4" /> Adicionar dia
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{selectedDay.title ?? selectedDay.label}</p>
              <p className="text-[12px] text-text-muted">
                {selectedDay.exercises.length} exercícios
              </p>
            </div>
            {mine ? (
              <button
                onClick={() => mut.deleteDay.mutate(selectedDay.id)}
                className="rounded-lg p-1.5 text-text-muted hover:text-danger"
                aria-label="Remover dia"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          {selectedDay.exercises.length === 0 ? (
            <EmptyState
              title="Dia sem exercícios"
              description={mine ? 'Adiciona exercícios da biblioteca ou manualmente.' : undefined}
            />
          ) : trainingMode ? (
            <TrainingSession
              key={selectedDay.id}
              exercises={selectedDay.exercises}
              planId={p.id}
              planName={p.name}
              dayLabel={selectedDay.title ?? selectedDay.label}
            />
          ) : (
            selectedDay.exercises.map((ex, i) => (
              <ExerciseRow
                key={ex.id}
                ex={ex}
                index={i}
                count={selectedDay.exercises.length}
                editable={mine}
                onMove={(dir) => moveExercise(selectedDay, i, dir)}
                onEdit={() => setEditEx(ex)}
                onDelete={() => mut.deleteExercise.mutate(ex.id)}
              />
            ))
          )}

          {mine && !trainingMode ? (
            <Button variant="secondary" onClick={() => setPickerOpen(true)}>
              <Plus className="h-4 w-4" /> Adicionar exercício
            </Button>
          ) : null}
        </div>
      )}

      {/* Modais */}
      {selectedDay ? (
        <ExercisePicker
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onAdd={async (body) => {
            await mut.addExercise.mutateAsync({ dayId: selectedDay.id, body });
          }}
        />
      ) : null}

      <AddDayModal
        open={addDayOpen}
        onClose={() => setAddDayOpen(false)}
        onAdd={async (label, title) => {
          const day = await mut.addDay.mutateAsync({ id: planId, body: { label, title } });
          setSelectedDayId(day.id);
        }}
      />

      <EditExerciseModal
        exercise={editEx}
        onClose={() => setEditEx(null)}
        onSave={async (body) => {
          if (editEx) await mut.updateExercise.mutateAsync({ id: editEx.id, body });
          setEditEx(null);
        }}
      />

      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} code={p.shareCode} />

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={onDeletePlan}
        title="Eliminar plano"
        description={`Eliminar "${p.name}"? Esta ação não pode ser anulada.`}
        confirmLabel="Eliminar"
        danger
        busy={mut.deletePlan.isPending}
      />
    </div>
  );
}

function ExerciseRow({
  ex,
  index,
  count,
  editable,
  onMove,
  onEdit,
  onDelete,
}: {
  ex: PlanExercise;
  index: number;
  count: number;
  editable: boolean;
  onMove: (dir: -1 | 1) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Card className="p-3">
      <div className="flex items-center gap-3">
        {ex.imageUrls[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={ex.imageUrls[0]} alt="" className="h-14 w-14 rounded-lg object-cover" loading="lazy" />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-surface-2 text-text-muted">
            {index + 1}
          </div>
        )}
        <button onClick={() => setOpen((v) => !v)} className="min-w-0 flex-1 text-left">
          <p className="truncate font-medium">{ex.name}</p>
          <p className="text-[12px] text-text-muted">
            {ex.sets} × {ex.reps} · {ex.restSeconds}s
            {ex.weight ? ` · ${ex.weight}kg` : ''} · {muscleLabel(ex.muscleGroup)}
          </p>
        </button>
        {editable ? (
          <div className="flex flex-col text-text-muted">
            <button onClick={() => onMove(-1)} disabled={index === 0} className="px-1 hover:text-text disabled:opacity-30">▲</button>
            <button onClick={() => onMove(1)} disabled={index === count - 1} className="px-1 hover:text-text disabled:opacity-30">▼</button>
          </div>
        ) : null}
        <ChevronDown
          className={`h-4 w-4 text-text-muted transition ${open ? 'rotate-180' : ''}`}
          onClick={() => setOpen((v) => !v)}
        />
      </div>

      {open ? (
        <div className="mt-3 flex flex-col gap-3 border-t border-line pt-3">
          {ex.imageUrls.length > 0 ? (
            <div className="flex gap-2">
              {ex.imageUrls.slice(0, 2).map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={src} src={src} alt="" className="h-28 w-1/2 rounded-lg object-cover" loading="lazy" />
              ))}
            </div>
          ) : null}
          {ex.videoUrl ? <YouTubeEmbed url={ex.videoUrl} name={ex.name} /> : null}
          {ex.instructions.length > 0 ? (
            <ol className="list-decimal space-y-1 pl-5 text-[13px] text-text-muted">
              {ex.instructions.slice(0, 6).map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          ) : null}
          {ex.notes ? <p className="text-[13px] text-text-muted">Nota: {ex.notes}</p> : null}
          {editable ? (
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={onEdit}>
                <Pencil className="h-3.5 w-3.5" /> Editar
              </Button>
              <Button size="sm" variant="ghost" onClick={onDelete}>
                <Trash2 className="h-3.5 w-3.5" /> Remover
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}

function AddDayModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (label: string, title?: string) => Promise<void>;
}) {
  const [label, setLabel] = useState('');
  const [title, setTitle] = useState('');
  return (
    <Modal open={open} onClose={onClose} title="Novo dia">
      <div className="flex flex-col gap-4">
        <Field label="Etiqueta" hint="ex: Segunda, ou Dia 1">
          <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Segunda" autoFocus />
        </Field>
        <Field label="Título (opcional)">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Peito e Tríceps" />
        </Field>
        <Button
          disabled={!label.trim()}
          onClick={async () => {
            await onAdd(label.trim(), title || undefined);
            setLabel('');
            setTitle('');
            onClose();
          }}
        >
          Adicionar dia
        </Button>
      </div>
    </Modal>
  );
}

function EditExerciseModal({
  exercise,
  onClose,
  onSave,
}: {
  exercise: PlanExercise | null;
  onClose: () => void;
  onSave: (body: Partial<PlanExercise>) => Promise<void>;
}) {
  const [sets, setSets] = useState(0);
  const [reps, setReps] = useState('');
  const [rest, setRest] = useState(0);
  const [weight, setWeight] = useState<number | ''>('');
  const [video, setVideo] = useState('');
  const [notes, setNotes] = useState('');
  const [initId, setInitId] = useState<string | null>(null);

  // sincroniza o formulário quando muda o exercício selecionado
  if (exercise && exercise.id !== initId) {
    setInitId(exercise.id);
    setSets(exercise.sets);
    setReps(exercise.reps);
    setRest(exercise.restSeconds);
    setWeight(exercise.weight ?? '');
    setVideo(exercise.videoUrl ?? '');
    setNotes(exercise.notes ?? '');
  }

  return (
    <Modal open={!!exercise} onClose={onClose} title={exercise?.name ?? 'Editar'}>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-3">
          <Field label="Séries">
            <NumberInput value={sets} onValueChange={(n) => setSets(n ?? 0)} />
          </Field>
          <Field label="Reps">
            <Input value={reps} onChange={(e) => setReps(e.target.value)} />
          </Field>
          <Field label="Descanso (s)">
            <NumberInput value={rest} onValueChange={(n) => setRest(n ?? 0)} />
          </Field>
        </div>
        <Field label="Carga (kg)">
          <NumberInput
            value={weight === '' ? null : weight}
            onValueChange={(n) => setWeight(n ?? '')}
          />
        </Field>
        <Field label="Vídeo (URL do YouTube)">
          <Input value={video} onChange={(e) => setVideo(e.target.value)} placeholder="https://youtu.be/…" />
        </Field>
        <Field label="Notas">
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
        <Button
          onClick={() =>
            onSave({
              sets,
              reps,
              restSeconds: rest,
              weight: weight === '' ? undefined : weight,
              videoUrl: video || undefined,
              notes: notes || undefined,
            })
          }
        >
          Guardar
        </Button>
      </div>
    </Modal>
  );
}

function ShareModal({
  open,
  onClose,
  code,
}: {
  open: boolean;
  onClose: () => void;
  code: string | null | undefined;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Partilhar plano">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-text-muted">
          Envia este código a um amigo. Ao aderir, o plano é copiado para a conta
          dele — cada um edita a sua cópia.
        </p>
        {code ? (
          <div className="flex items-center justify-between rounded-xl bg-surface-2 px-4 py-3">
            <span className="font-mono text-lg tracking-widest">{code}</span>
            <button
              onClick={() => {
                void navigator.clipboard.writeText(code);
                toast.success('Código copiado');
              }}
              className="rounded-lg p-1.5 text-text-muted hover:text-text"
              aria-label="Copiar"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <Skeleton className="h-12 w-full" />
        )}
      </div>
    </Modal>
  );
}
