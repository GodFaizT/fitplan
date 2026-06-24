'use client';

import {
  ChevronLeft,
  ChevronRight,
  CopyPlus,
  Plus,
  Trash2,
  UtensilsCrossed,
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
import { useDailyLog, useMealMutations } from '@/hooks/use-meals';
import { useAuthStore } from '@/lib/auth-store';
import { foodIcon } from '@/lib/food-icon';
import { addDays, dateLabel, fmt, todayISO } from '@/lib/format';
import { MEAL_TYPE_LABELS, MEAL_TYPES } from '@/lib/labels';
import { MACROS, type MacroMeta } from '@/lib/macros';
import { mealIcon } from '@/lib/meal-icon';
import { sumMeals, targetsFromUser } from '@/lib/totals';

export default function MealsPage() {
  const user = useAuthStore((s) => s.user);
  const [date, setDate] = useState(todayISO());
  const log = useDailyLog(date);
  const m = useMealMutations(date);

  const [addFoodFor, setAddFoodFor] = useState<string | null>(null);
  const [addMealOpen, setAddMealOpen] = useState(false);

  const targets = targetsFromUser(user);
  const totals = log.data ? sumMeals(log.data.meals) : null;

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

      {/* Refeições */}
      {log.isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : log.data && log.data.meals.length > 0 ? (
        <div className="flex flex-col gap-3">
          {log.data.meals.map((meal) => {
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
                  <button
                    onClick={() => m.deleteMeal.mutate(meal.id)}
                    className="rounded-lg p-1.5 text-text-muted hover:bg-surface-2 hover:text-danger"
                    aria-label="Remover refeição"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
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
      ) : (
        <EmptyState
          icon={UtensilsCrossed}
          title="Ainda não registaste refeições"
          description="Adiciona a primeira refeição ou copia o dia anterior."
          action={
            <Button
              variant="secondary"
              onClick={() => m.copyDay.mutate(addDays(date, -1))}
              disabled={m.copyDay.isPending}
            >
              <CopyPlus className="h-4 w-4" />
              {m.copyDay.isPending ? 'A copiar…' : 'Copiar dia anterior'}
            </Button>
          }
        />
      )}

      <Button variant="secondary" onClick={() => setAddMealOpen(true)}>
        <Plus className="h-4 w-4" /> Adicionar refeição
      </Button>

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
