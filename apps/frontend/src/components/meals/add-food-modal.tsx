'use client';

import { scaleNutrition } from '@fitplan/shared';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { useFoodLibrary, useFoodMutations, useSavedFoods } from '@/hooks/use-foods';
import { fmt } from '@/lib/format';

export interface NewFoodItem {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface Suggestion {
  id: string;
  name: string;
  per: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  source: 'meu' | 'catalogo';
}

export function AddFoodModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (item: NewFoodItem) => Promise<void>;
}) {
  const [search, setSearch] = useState('');
  const saved = useSavedFoods(search);
  const catalog = useFoodLibrary(search);
  const { create } = useFoodMutations();

  const [name, setName] = useState('');
  const [per, setPer] = useState(100);
  const [unit, setUnit] = useState('g');
  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fat, setFat] = useState(0);
  const [quantity, setQuantity] = useState(100);
  const [saveToLib, setSaveToLib] = useState(false);
  const [busy, setBusy] = useState(false);

  // alimentos pessoais primeiro, depois o catálogo comum
  const suggestions: Suggestion[] = [
    ...(saved.data ?? []).map((f) => ({ ...f, source: 'meu' as const })),
    ...(catalog.data ?? []).map((f) => ({ ...f, source: 'catalogo' as const })),
  ];

  function pick(f: Suggestion) {
    setName(f.name);
    setPer(f.per);
    setUnit(f.unit);
    setCalories(f.calories);
    setProtein(f.protein);
    setCarbs(f.carbs);
    setFat(f.fat);
    setQuantity(f.per);
    setSaveToLib(false);
  }

  function reset() {
    setName('');
    setPer(100);
    setUnit('g');
    setCalories(0);
    setProtein(0);
    setCarbs(0);
    setFat(0);
    setQuantity(100);
    setSaveToLib(false);
    setSearch('');
  }

  const scaled = scaleNutrition({ calories, protein, carbs, fat }, per, quantity);
  const r1 = (n: number) => Math.round(n * 10) / 10;

  async function submit() {
    if (!name.trim()) return;
    setBusy(true);
    try {
      if (saveToLib) {
        await create.mutateAsync({ name, per, unit, calories, protein, carbs, fat });
      }
      await onAdd({
        name: name.trim(),
        quantity,
        unit,
        calories: Math.round(scaled.calories),
        protein: r1(scaled.protein),
        carbs: r1(scaled.carbs),
        fat: r1(scaled.fat),
      });
      reset();
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Adicionar alimento">
      <div className="flex flex-col gap-4">
        {/* Pesquisa no catálogo comum + biblioteca pessoal */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar (arroz, frango, ovos…)"
            className="pl-9"
          />
        </div>

        {suggestions.length > 0 ? (
          <div className="max-h-52 overflow-y-auto rounded-xl border border-line">
            {suggestions.map((f) => (
              <button
                key={`${f.source}-${f.id}`}
                onClick={() => pick(f)}
                className="flex w-full items-center justify-between gap-2 border-b border-line px-3 py-2 text-left text-sm last:border-0 hover:bg-surface-2"
              >
                <span className="flex items-center gap-2">
                  {f.source === 'meu' ? (
                    <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-accent">
                      Meu
                    </span>
                  ) : null}
                  <span className="truncate">{f.name}</span>
                </span>
                <span className="shrink-0 text-text-muted">
                  {fmt(f.calories)} kcal / {f.per}
                  {f.unit}
                </span>
              </button>
            ))}
          </div>
        ) : null}

        <div className="h-px bg-line" />
        <p className="-mb-2 text-[12px] text-text-muted">
          Ou insere/ajusta os valores:
        </p>

        <Field label="Nome">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="ex: Peito de frango" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Valores por">
            <div className="flex gap-2">
              <Input
                type="number"
                value={per}
                onChange={(e) => setPer(Number(e.target.value))}
                className="w-20"
              />
              <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="g" />
            </div>
          </Field>
          <Field label={`Quantidade (${unit})`}>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </Field>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <Field label="kcal">
            <Input type="number" value={calories} onChange={(e) => setCalories(Number(e.target.value))} />
          </Field>
          <Field label="Prot.">
            <Input type="number" value={protein} onChange={(e) => setProtein(Number(e.target.value))} />
          </Field>
          <Field label="Hidr.">
            <Input type="number" value={carbs} onChange={(e) => setCarbs(Number(e.target.value))} />
          </Field>
          <Field label="Gord.">
            <Input type="number" value={fat} onChange={(e) => setFat(Number(e.target.value))} />
          </Field>
        </div>

        {/* Pré-visualização escalada */}
        <div className="rounded-xl bg-surface-2 px-3 py-2.5 text-sm">
          <span className="text-text-muted">Para {quantity}{unit}: </span>
          <span className="tabular">
            {Math.round(scaled.calories)} kcal · P{r1(scaled.protein)} · H{r1(scaled.carbs)} · G{r1(scaled.fat)}
          </span>
        </div>

        <label className="flex items-center gap-2 text-sm text-text-muted">
          <input
            type="checkbox"
            checked={saveToLib}
            onChange={(e) => setSaveToLib(e.target.checked)}
            className="h-4 w-4 accent-[color:var(--accent)]"
          />
          Guardar na minha biblioteca
        </label>

        <Button onClick={submit} disabled={busy || !name.trim()}>
          {busy ? 'A adicionar…' : 'Adicionar'}
        </Button>
      </div>
    </Modal>
  );
}
