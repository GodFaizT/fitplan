'use client';

import {
  ChevronDown,
  ChevronRight,
  Dumbbell,
  Plus,
  Sparkles,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, Eyebrow, SectionTitle } from '@/components/ui/card';
import { Field, Input } from '@/components/ui/input';
import { EmptyState, Skeleton } from '@/components/ui/misc';
import { Modal } from '@/components/ui/modal';
import {
  usePlanMutations,
  usePlans,
  useWorkoutTemplates,
} from '@/hooks/use-plans';
import { useAuthStore } from '@/lib/auth-store';
import { toast } from '@/lib/toast';
import type { WorkoutTemplateSummary } from '@/lib/types';

export default function WorkoutsPage() {
  const user = useAuthStore((s) => s.user);
  const plans = usePlans();
  const { createPlan, join, createFromTemplate } = usePlanMutations();
  const router = useRouter();

  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  async function onUseTemplate(id: string) {
    try {
      const plan = await createFromTemplate.mutateAsync(id);
      setTemplatesOpen(false);
      toast.success('Plano criado a partir do modelo');
      router.push(`/treino/${plan.id}`);
    } catch {
      toast.error('Não foi possível criar o plano');
    }
  }

  async function onCreate() {
    if (!name.trim()) return;
    const plan = await createPlan.mutateAsync({ name: name.trim() });
    setName('');
    setCreateOpen(false);
    router.push(`/treino/${plan.id}`);
  }

  async function onJoin() {
    try {
      const plan = await join.mutateAsync(code.trim());
      setCode('');
      setJoinOpen(false);
      toast.success('Plano adicionado à tua conta');
      router.push(`/treino/${plan.id}`);
    } catch {
      toast.error('Código inválido');
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <Eyebrow>Treino</Eyebrow>
          <SectionTitle className="mt-1">Os meus planos</SectionTitle>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setJoinOpen(true)}>
            <Users className="h-4 w-4" /> Aderir
          </Button>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> Criar
          </Button>
        </div>
      </header>

      {/* Planos prontos a usar */}
      <button
        onClick={() => setTemplatesOpen(true)}
        className="group flex items-center gap-3 rounded-card border border-line bg-surface p-4 text-left transition hover:border-accent/40"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium">Começar com um plano pronto</p>
          <p className="text-[12px] text-text-muted">
            Modelos para 3 e 5 dias — Full Body, PPL, split e mais
          </p>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-text-muted transition group-hover:text-accent" />
      </button>

      {plans.isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : plans.data && plans.data.length > 0 ? (
        <div className="flex flex-col gap-3">
          {plans.data.map((plan) => {
            const mine = plan.ownerId === user?.id;
            return (
              <Link key={plan.id} href={`/treino/${plan.id}`}>
                <Card className="flex items-center justify-between transition hover:border-accent/40">
                  <div>
                    <p className="font-medium">{plan.name}</p>
                    <p className="text-[12px] text-text-muted">
                      {plan._count?.days ?? plan.days?.length ?? 0} dias
                      {!mine && plan.owner
                        ? ` · partilhado por ${plan.owner.name ?? plan.owner.email}`
                        : ''}
                      {plan.isShared && mine ? ' · partilhado' : ''}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-text-muted" />
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Dumbbell}
          title="Ainda não tens planos"
          description="Cria o teu primeiro plano ou adere a um com um código."
          action={
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" /> Criar plano
            </Button>
          }
        />
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Novo plano">
        <div className="flex flex-col gap-4">
          <Field label="Nome do plano">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Hipertrofia 5 dias"
              autoFocus
            />
          </Field>
          <Button onClick={onCreate} disabled={createPlan.isPending || !name.trim()}>
            Criar
          </Button>
        </div>
      </Modal>

      <TemplatesModal
        open={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        onUse={onUseTemplate}
        busyId={
          createFromTemplate.isPending
            ? (createFromTemplate.variables ?? null)
            : null
        }
      />

      <Modal open={joinOpen} onClose={() => setJoinOpen(false)} title="Aderir a um plano">
        <div className="flex flex-col gap-4">
          <Field label="Código de partilha" hint="Cola o código que te enviaram. O plano é copiado para a tua conta.">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="ex: a1b2c3d4e5"
              autoFocus
            />
          </Field>
          <Button onClick={onJoin} disabled={join.isPending || !code.trim()}>
            Aderir
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function TemplatesModal({
  open,
  onClose,
  onUse,
  busyId,
}: {
  open: boolean;
  onClose: () => void;
  onUse: (id: string) => void;
  busyId: string | null;
}) {
  const templates = useWorkoutTemplates();
  const list = templates.data ?? [];

  return (
    <Modal open={open} onClose={onClose} title="Planos prontos a usar">
      {templates.isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : (
        <div className="flex max-h-[70vh] flex-col gap-3 overflow-y-auto">
          <p className="text-sm text-text-muted">
            Escolhe um modelo — fica como uma cópia tua, que podes editar à
            vontade.
          </p>
          {list.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              onUse={() => onUse(t.id)}
              busy={busyId === t.id}
            />
          ))}
        </div>
      )}
    </Modal>
  );
}

function TemplateCard({
  template,
  onUse,
  busy,
}: {
  template: WorkoutTemplateSummary;
  onUse: () => void;
  busy: boolean;
}) {
  const [open, setOpen] = useState(false);
  const totalExercises = template.days.reduce(
    (n, d) => n + d.exercises.length,
    0,
  );

  return (
    <div className="rounded-xl border border-line">
      <div className="flex items-start justify-between gap-3 p-3.5">
        <div className="min-w-0">
          <p className="font-medium">{template.name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="rounded-pill bg-accent/15 px-2 py-0.5 text-accent">
              {template.daysPerWeek} dias
            </span>
            <span className="rounded-pill bg-surface-2 px-2 py-0.5 text-text-muted">
              {template.level}
            </span>
            <span className="rounded-pill bg-surface-2 px-2 py-0.5 text-text-muted">
              {template.focus}
            </span>
          </div>
          <p className="mt-2 text-[13px] text-text-muted">{template.description}</p>
        </div>
      </div>

      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between border-t border-line px-3.5 py-2 text-[13px] text-text-muted transition hover:text-text"
      >
        <span>
          {template.days.length} treinos · {totalExercises} exercícios
        </span>
        <ChevronDown className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open ? (
        <div className="flex flex-col gap-3 border-t border-line p-3.5">
          {template.days.map((d) => (
            <div key={d.label}>
              <p className="text-[12px] font-medium uppercase tracking-[0.04em] text-text-muted">
                {d.label} · {d.title}
              </p>
              <ul className="mt-1 space-y-0.5">
                {d.exercises.map((e, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between text-[13px]"
                  >
                    <span className="min-w-0 truncate">{e.name}</span>
                    <span className="stat shrink-0 text-text-muted">
                      {e.sets} × {e.reps}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : null}

      <div className="border-t border-line p-3">
        <Button className="w-full" onClick={onUse} disabled={busy}>
          {busy ? 'A criar…' : 'Usar este plano'}
        </Button>
      </div>
    </div>
  );
}
