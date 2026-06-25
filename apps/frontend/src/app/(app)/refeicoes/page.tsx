'use client';

import {
  BookmarkPlus,
  ChevronLeft,
  ChevronRight,
  CopyPlus,
  GlassWater,
  LayoutList,
  Minus,
  Plus,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { AddFoodModal, type NewFoodItem } from '@/components/meals/add-food-modal';
import { Button } from '@/components/ui/button';
import { Card, Eyebrow, SectionTitle } from '@/components/ui/card';
import { Field, Input } from '@/components/ui/input';
import { EmptyState, Skeleton } from '@/components/ui/misc';
import { Modal } from '@/components/ui/modal';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Ring } from '@/components/ui/ring';
import { Segmented } from '@/components/ui/segmented';
import {
  type NewTemplateItem,
  useMealTemplateMutations,
  useMealTemplates,
} from '@/hooks/use-meal-templates';
import { useDailyLog, useMealMutations } from '@/hooks/use-meals';
import { useAuthStore } from '@/lib/auth-store';
import { foodIcon } from '@/lib/food-icon';
import { addDays, dateLabel, fmt, todayISO } from '@/lib/format';
import { MEAL_TYPE_LABELS, MEAL_TYPES } from '@/lib/labels';
import { MACROS, type MacroMeta } from '@/lib/macros';
import { mealIcon } from '@/lib/meal-icon';
import { toast } from '@/lib/toast';
import type { Meal } from '@/lib/types';
import { sumMeals, targetsFromUser } from '@/lib/totals';

export default function MealsPage() {
  const user = useAuthStore((s) => s.user);
  const [date, setDate] = useState(todayISO());
  const log = useDailyLog(date);
  const m = useMealMutations(date);

  const [addFoodFor, setAddFoodFor] = useState<string | null>(null);
  const [addMealOpen, setAddMealOpen] = useState(false);
  const [saveTplFor, setSaveTplFor] = useState<Meal | null>(null);
  const [tplModalOpen, setTplModalOpen] = useState(false);

  const tpl = useMealTemplateMutations(date);

  const targets = targetsFromUser(user);
  const totals = log.data ? sumMeals(log.data.meals) : null;
  const hasItems = (log.data?.meals ?? []).some((meal) => meal.items.length > 0);

  async function handleAddFood(item: NewFoodItem) {
    if (!addFoodFor) return;
    await m.addItem.mutateAsync({ mealId: addFoodFor, body: item });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Navegação de data */}
      <header className="flex items-center justify-between">
        <div>
          <Eyebrow>Refeições</Eyebrow>
          <SectionTitle className="mt-1">{dateLabel(date)}</SectionTitle>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="secondary" size="icon" onClick={() => setDate(addDays(date, -1))}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          {date !== todayISO() ? (
            <Button variant="ghost" size="sm" onClick={() => setDate(todayISO())}>
              Hoje
            </Button>
          ) : null}
          <Button variant="secondary" size="icon" onClick={() => setDate(addDays(date, 1))}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Resumo do dia */}
      {!targets ? (
        <Card className="text-sm text-text-muted">
          Ainda não calculaste os teus alvos.{' '}
          <Link href="/nutricao" className="text-accent hover:underline">
            Abrir calculadora
          </Link>
          .
        </Card>
      ) : (
        <Card className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
          <Ring value={totals?.calories ?? 0} max={targets.calories}>
            <span className="stat text-2xl font-medium">{fmt(totals?.calories ?? 0)}</span>
            <span className="text-[12px] text-text-muted">
              de <span className="stat">{fmt(targets.calories)}</span>
            </span>
          </Ring>
          <div className="w-full flex-1 space-y-3">
            {MACROS.map((mm) => (
              <Bar
                key={mm.key}
                meta={mm}
                value={totals?.[mm.key] ?? 0}
                max={targets[mm.key]}
              />
            ))}
          </div>
        </Card>
      )}

      {log.data ? (
        <WaterCard
          glasses={log.data.water}
          onChange={(n) => m.setWater.mutate(n)}
        />
      ) : null}

      {/* Refeições */}
      {log.isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : (
        <div className="flex flex-col gap-3">
          {(log.data?.meals ?? []).map((meal) => {
            const mt = sumMeals([meal]);
            const MealIcon = mealIcon(meal.type);
            return (
              <Card key={meal.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                      <MealIcon className="h-5 w-5" strokeWidth={1.8} />
                    </div>
                    <div>
                      <p className="font-medium">
                        {meal.label || MEAL_TYPE_LABELS[meal.type] || 'Refeição'}
                      </p>
                      <p className="text-[12px] text-text-muted">
                        {MEAL_TYPE_LABELS[meal.type]} · {fmt(mt.calories)} kcal
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {meal.items.length > 0 ? (
                      <button
                        onClick={() => setSaveTplFor(meal)}
                        className="rounded-lg p-1.5 text-text-muted hover:bg-surface-2 hover:text-accent"
                        aria-label="Guardar como modelo"
                        title="Guardar como modelo"
                      >
                        <BookmarkPlus className="h-4 w-4" />
                      </button>
                    ) : null}
                    <button
                      onClick={() => m.deleteMeal.mutate(meal.id)}
                      className="rounded-lg p-1.5 text-text-muted hover:bg-surface-2 hover:text-danger"
                      aria-label="Remover refeição"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {meal.items.length > 0 ? (
                  <ul className="mt-3 divide-y divide-line">
                    {meal.items.map((it) => {
                      const Icon = foodIcon(it.name);
                      return (
                        <li key={it.id} className="flex items-center justify-between gap-2 py-2">
                          <div className="flex min-w-0 items-center gap-2.5">
                            <Icon
                              className="h-4 w-4 shrink-0 text-text-muted"
                              strokeWidth={1.8}
                            />
                            <div className="min-w-0">
                              <p className="truncate text-sm">{it.name}</p>
                              <p className="text-[12px] text-text-muted">
                                {fmt(it.quantity)}
                                {it.unit} · P{fmt(it.protein, 1)} H{fmt(it.carbs, 1)} G{fmt(it.fat, 1)}
                              </p>
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <span className="stat text-sm">{fmt(it.calories)}</span>
                            <button
                              onClick={() => m.deleteItem.mutate(it.id)}
                              className="rounded p-1 text-text-muted hover:text-danger"
                              aria-label="Remover alimento"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}

                <button
                  onClick={() => setAddFoodFor(meal.id)}
                  className="mt-3 flex items-center gap-1.5 text-sm text-accent hover:underline"
                >
                  <Plus className="h-4 w-4" /> Adicionar alimento
                </button>
              </Card>
            );
          })}
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        {!hasItems ? (
          <Button
            variant="secondary"
            className="sm:flex-1"
            onClick={() => m.copyDay.mutate(addDays(date, -1))}
            disabled={m.copyDay.isPending}
          >
            <CopyPlus className="h-4 w-4" />
            {m.copyDay.isPending ? 'A copiar…' : 'Copiar dia anterior'}
          </Button>
        ) : null}
        <Button
          variant="secondary"
          className="sm:flex-1"
          onClick={() => setTplModalOpen(true)}
        >
          <LayoutList className="h-4 w-4" /> Modelos
        </Button>
        <Button
          variant="secondary"
          className="sm:flex-1"
          onClick={() => setAddMealOpen(true)}
        >
          <Plus className="h-4 w-4" /> Adicionar refeição
        </Button>
      </div>

      <AddFoodModal
        open={addFoodFor !== null}
        onClose={() => setAddFoodFor(null)}
        onAdd={handleAddFood}
      />
      <AddMealModal
        open={addMealOpen}
        onClose={() => setAddMealOpen(false)}
        onAdd={(type, label) => m.addMeal.mutate({ type, label })}
      />
      <SaveTemplateModal
        meal={saveTplFor}
        onClose={() => setSaveTplFor(null)}
        onSave={async (name, items) => {
          await tpl.create.mutateAsync({ name, items });
          toast.success('Modelo guardado');
        }}
        busy={tpl.create.isPending}
      />
      <TemplatesModal
        open={tplModalOpen}
        onClose={() => setTplModalOpen(false)}
        onApply={(id) => tpl.apply.mutate({ id })}
        onDelete={(id) => tpl.remove.mutate(id)}
        applying={tpl.apply.isPending}
      />
    </div>
  );
}

function Bar({
  meta,
  value,
  max,
}: {
  meta: MacroMeta;
  value: number;
  max: number;
}) {
  const Icon = meta.icon;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[13px]">
        <span className="flex items-center gap-1.5 text-text-muted">
          <Icon className="h-3.5 w-3.5" style={{ color: meta.color }} strokeWidth={2.2} />
          {meta.label}
        </span>
        <span className="stat text-text-muted">
          <span className="text-text">{fmt(value)}</span> / {fmt(max)} g
        </span>
      </div>
      <ProgressBar value={value} max={max} color={meta.color} />
    </div>
  );
}

function WaterCard({
  glasses,
  onChange,
}: {
  glasses: number;
  onChange: (n: number) => void;
}) {
  const goal = 8;
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GlassWater className="h-4 w-4" style={{ color: 'var(--protein)' }} />
          <SectionTitle className="text-[15px]">Água</SectionTitle>
        </div>
        <span className="stat text-sm">
          <span className="text-text">{glasses}</span>
          <span className="text-text-muted"> / {goal} copos</span>
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(0, glasses - 1))}
          disabled={glasses === 0}
          aria-label="Menos um copo"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-2 text-text transition hover:bg-surface disabled:opacity-30"
        >
          <Minus className="h-4 w-4" />
        </button>
        <div className="flex flex-1 gap-1">
          {Array.from({ length: goal }).map((_, i) => (
            <div
              key={i}
              className="h-7 flex-1 rounded-md transition-colors"
              style={{
                background: i < glasses ? 'var(--protein)' : 'var(--surface-2)',
              }}
            />
          ))}
        </div>
        <button
          onClick={() => onChange(glasses + 1)}
          aria-label="Mais um copo"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-text transition hover:brightness-95"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </Card>
  );
}

function AddMealModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (type: string, label?: string) => void;
}) {
  const [type, setType] = useState<string>('almoco');
  const [label, setLabel] = useState('');
  return (
    <Modal open={open} onClose={onClose} title="Adicionar refeição">
      <div className="flex flex-col gap-4">
        <Field label="Tipo">
          <div className="grid grid-cols-3 gap-2">
            {MEAL_TYPES.map((t) => {
              const Icon = mealIcon(t);
              return (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex flex-col items-center gap-1 rounded-lg px-2 py-2.5 text-[13px] transition ${
                    type === t
                      ? 'bg-accent text-accent-text'
                      : 'bg-surface-2 text-text-muted hover:text-text'
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.8} />
                  {MEAL_TYPE_LABELS[t]}
                </button>
              );
            })}
          </div>
        </Field>
        <Field label="Nome (opcional)">
          <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="ex: Almoço pós-treino" />
        </Field>
        <Button
          onClick={() => {
            onAdd(type, label || undefined);
            setLabel('');
            onClose();
          }}
        >
          Adicionar
        </Button>
      </div>
    </Modal>
  );
}

function SaveTemplateModal({
  meal,
  onClose,
  onSave,
  busy,
}: {
  meal: Meal | null;
  onClose: () => void;
  onSave: (name: string, items: NewTemplateItem[]) => Promise<void>;
  busy: boolean;
}) {
  const [name, setName] = useState('');
  const [initId, setInitId] = useState<string | null>(null);

  // prefill com o nome da refeição quando abre
  if (meal && meal.id !== initId) {
    setInitId(meal.id);
    setName(meal.label || MEAL_TYPE_LABELS[meal.type] || 'Refeição');
  }

  async function save() {
    if (!meal || !name.trim()) return;
    const items: NewTemplateItem[] = meal.items.map((it) => ({
      name: it.name,
      quantity: it.quantity,
      unit: it.unit,
      calories: it.calories,
      protein: it.protein,
      carbs: it.carbs,
      fat: it.fat,
    }));
    await onSave(name.trim(), items);
    onClose();
  }

  return (
    <Modal open={!!meal} onClose={onClose} title="Guardar como modelo">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-text-muted">
          Guarda os {meal?.items.length ?? 0} alimentos desta refeição para
          voltar a adicionar noutro dia com um toque.
        </p>
        <Field label="Nome do modelo">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ex: Pequeno-almoço de treino"
            autoFocus
          />
        </Field>
        <Button onClick={save} disabled={busy || !name.trim()}>
          {busy ? 'A guardar…' : 'Guardar modelo'}
        </Button>
      </div>
    </Modal>
  );
}

function TemplatesModal({
  open,
  onClose,
  onApply,
  onDelete,
  applying,
}: {
  open: boolean;
  onClose: () => void;
  onApply: (id: string) => void;
  onDelete: (id: string) => void;
  applying: boolean;
}) {
  const templates = useMealTemplates();
  const list = templates.data ?? [];

  return (
    <Modal open={open} onClose={onClose} title="Refeições guardadas">
      {templates.isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : list.length === 0 ? (
        <EmptyState
          icon={BookmarkPlus}
          title="Ainda não tens modelos"
          description="Carrega no marcador de uma refeição para a guardar como modelo."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {list.map((t) => {
            const kcal = t.items.reduce((n, it) => n + it.calories, 0);
            return (
              <div
                key={t.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-line px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{t.name}</p>
                  <p className="text-[12px] text-text-muted">
                    {t.items.length} alimentos · {fmt(kcal)} kcal
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={applying}
                    onClick={() => {
                      onApply(t.id);
                      onClose();
                    }}
                  >
                    <Plus className="h-3.5 w-3.5" /> Adicionar
                  </Button>
                  <button
                    onClick={() => onDelete(t.id)}
                    className="rounded p-1.5 text-text-muted hover:text-danger"
                    aria-label="Remover modelo"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
