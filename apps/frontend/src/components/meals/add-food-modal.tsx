'use client';

import { scaleNutrition } from '@fitplan/shared';
import { ScanBarcode, Search } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { useFoodLibrary, useFoodMutations, useSavedFoods } from '@/hooks/use-foods';
import { useRecentFoods } from '@/hooks/use-meals';
import { foodIcon } from '@/lib/food-icon';
import type { RecentFood } from '@/lib/types';
import { fmt } from '@/lib/format';
import { lookupBarcode } from '@/lib/open-food-facts';
import { toast } from '@/lib/toast';
import { BarcodeScanner } from './barcode-scanner';

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
  category?: string | null;
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
  const recent = useRecentFoods();
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
  const [scanning, setScanning] = useState(false);
  const [looking, setLooking] = useState(false);

  async function handleScan(code: string) {
    setScanning(false);
    setLooking(true);
    const food = await lookupBarcode(code);
    setLooking(false);
    if (!food) {
      toast.error('Produto não encontrado nesta base de dados');
      return;
    }
    setName(food.name);
    setPer(food.per);
    setUnit(food.unit);
    setCalories(food.calories);
    setProtein(food.protein);
    setCarbs(food.carbs);
    setFat(food.fat);
    setQuantity(food.per);
    setSaveToLib(true);
    setSearch('');
    toast.success('Produto encontrado');
  }

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

  // Re-adicionar um alimento recente: os valores já são para a quantidade usada.
  function pickRecent(f: RecentFood) {
    setName(f.name);
    setPer(f.quantity);
    setUnit(f.unit);
    setCalories(f.calories);
    setProtein(f.protein);
    setCarbs(f.carbs);
    setFat(f.fat);
    setQuantity(f.quantity);
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
        {/* Pesquisa no catálogo + biblioteca pessoal + scanner de código de barras */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar (arroz, frango, ovos…)"
              className="pl-9"
            />
          </div>
          <button
            type="button"
            onClick={() => setScanning(true)}
            aria-label="Ler código de barras"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line bg-surface-2 text-text transition hover:bg-surface"
          >
            <ScanBarcode className="h-5 w-5" />
          </button>
        </div>
        {looking ? (
          <p className="-mt-2 text-[12px] text-text-muted">A procurar produto…</p>
        ) : null}

        {scanning ? (
          <BarcodeScanner onDetected={handleScan} onClose={() => setScanning(false)} />
        ) : null}

        {!search && (recent.data?.length ?? 0) > 0 ? (
          <div>
            <p className="mb-1.5 text-[12px] uppercase tracking-[0.04em] text-text-muted">
              Recentes
            </p>
            <div className="flex flex-wrap gap-1.5">
              {recent.data!.slice(0, 12).map((f, i) => (
                <button
                  key={`${f.name}-${i}`}
                  type="button"
                  onClick={() => pickRecent(f)}
                  className="rounded-pill border border-line bg-surface-2 px-2.5 py-1 text-[13px] transition hover:border-accent/50"
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {suggestions.length > 0 ? (
          <div className="max-h-52 overflow-y-auto rounded-xl border border-line">
            {suggestions.map((f) => {
              const Icon = foodIcon(f.name, f.category);
              return (
                <button
                  key={`${f.source}-${f.id}`}
                  onClick={() => pick(f)}
                  className="flex w-full items-center justify-between gap-2 border-b border-line px-3 py-2 text-left text-sm last:border-0 hover:bg-surface-2"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <Icon className="h-4 w-4 shrink-0 text-accent" strokeWidth={1.8} />
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
              );
            })}
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
