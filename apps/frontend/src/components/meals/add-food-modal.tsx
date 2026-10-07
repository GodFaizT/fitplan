'use client';

import { scaleNutrition } from '@fitplan/shared';
import {
  ArrowLeft,
  Camera,
  ChevronDown,
  Plus,
  ScanBarcode,
  Search,
  Sparkles,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { NumberInput } from '@/components/ui/number-input';
import { useAnalyzeFood, useFoodVisionEnabled } from '@/hooks/use-food-vision';
import { useFoodLibrary, useFoodMutations, useSavedFoods } from '@/hooks/use-foods';
import { useRecentFoods } from '@/hooks/use-meals';
import { foodIcon } from '@/lib/food-icon';
import { fmt } from '@/lib/format';
import { compressImage } from '@/lib/image';
import { lookupBarcode } from '@/lib/open-food-facts';
import { toast } from '@/lib/toast';
import type { DetectedFood } from '@/lib/types';
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

interface FoodValues {
  name: string;
  per: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface Suggestion extends FoodValues {
  id: string;
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

  const vision = useFoodVisionEnabled();
  const visionEnabled = vision.data?.enabled ?? false;
  const analyze = useAnalyzeFood();
  const photoRef = useRef<HTMLInputElement>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [detected, setDetected] = useState<DetectedFood[] | null>(null);
  const [activeDetected, setActiveDetected] = useState<DetectedFood | null>(null);

  // 'search' = encontrar o alimento · 'detail' = quantidade + adicionar
  const [stage, setStage] = useState<'search' | 'detail'>('search');
  const [manual, setManual] = useState(false); // alimento criado/editado à mão
  const [showValues, setShowValues] = useState(false);

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

  function reset() {
    setStage('search');
    setManual(false);
    setShowValues(false);
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
    setAnalyzing(false);
    setDetected(null);
    setActiveDetected(null);
  }

  function close() {
    reset();
    onClose();
  }

  function fill(f: FoodValues) {
    setName(f.name);
    setPer(f.per);
    setUnit(f.unit);
    setCalories(f.calories);
    setProtein(f.protein);
    setCarbs(f.carbs);
    setFat(f.fat);
    setQuantity(f.per);
  }

  function selectFood(f: FoodValues) {
    fill(f);
    setManual(false);
    setShowValues(false);
    setSaveToLib(false);
    setActiveDetected(null);
    setStage('detail');
  }

  function startManual() {
    fill({ name: search.trim(), per: 100, unit: 'g', calories: 0, protein: 0, carbs: 0, fat: 0 });
    setManual(true);
    setShowValues(true);
    setSaveToLib(true);
    setActiveDetected(null);
    setStage('detail');
  }

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setDetected(null);
    setAnalyzing(true);
    try {
      const img = await compressImage(file, 1080, 0.8);
      const res = await analyze.mutateAsync(img.dataUrl);
      if (res.items.length === 0) {
        toast.error('Não reconheci alimentos nesta foto');
      } else {
        setDetected(res.items);
      }
    } catch {
      toast.error('Não foi possível analisar a foto');
    } finally {
      setAnalyzing(false);
    }
  }

  function selectDetected(d: DetectedFood) {
    fill({
      name: d.name,
      per: d.quantity,
      unit: d.unit,
      calories: d.calories,
      protein: d.protein,
      carbs: d.carbs,
      fat: d.fat,
    });
    setManual(true);
    setShowValues(true);
    setSaveToLib(false);
    setActiveDetected(d);
    setStage('detail');
  }

  async function handleScan(code: string) {
    setScanning(false);
    setLooking(true);
    const food = await lookupBarcode(code);
    setLooking(false);
    if (!food) {
      toast.error('Produto não encontrado nesta base de dados');
      return;
    }
    fill(food);
    setManual(true);
    setShowValues(false);
    setSaveToLib(true);
    setActiveDetected(null);
    setStage('detail');
    toast.success('Produto encontrado');
  }

  // alimentos pessoais primeiro, depois o catálogo comum
  const suggestions: Suggestion[] = [
    ...(saved.data ?? []).map((f) => ({ ...f, source: 'meu' as const })),
    ...(catalog.data ?? []).map((f) => ({ ...f, source: 'catalogo' as const })),
  ];

  const scaled = scaleNutrition({ calories, protein, carbs, fat }, per, quantity);
  const r1 = (n: number) => Math.round(n * 10) / 10;

  async function submit() {
    if (!name.trim()) return;
    setBusy(true);
    try {
      if (manual && saveToLib) {
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
      // Vindo de uma foto com vários alimentos: remove o que foi adicionado e
      // volta à lista se ainda sobrarem itens (modal permanece aberto).
      if (activeDetected) {
        const rest = (detected ?? []).filter((d) => d !== activeDetected);
        setActiveDetected(null);
        if (rest.length > 0) {
          setDetected(rest);
          setStage('search');
          return;
        }
        setDetected(null);
      }
      close();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={close} title="Adicionar alimento">
      {scanning ? (
        <BarcodeScanner onDetected={handleScan} onClose={() => setScanning(false)} />
      ) : null}

      {stage === 'search' ? (
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquisar (arroz, frango, ovos…)"
                className="pl-9"
                autoFocus
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
            {visionEnabled ? (
              <button
                type="button"
                onClick={() => photoRef.current?.click()}
                disabled={analyzing}
                aria-label="Analisar foto da refeição"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line bg-surface-2 text-accent transition hover:bg-surface disabled:opacity-50"
              >
                <Camera className="h-5 w-5" />
              </button>
            ) : null}
          </div>

          <input
            ref={photoRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onPhoto}
          />

          {looking ? (
            <p className="-mt-2 text-[12px] text-text-muted">A procurar produto…</p>
          ) : null}
          {analyzing ? (
            <p className="-mt-2 flex items-center gap-1.5 text-[12px] text-accent">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" /> A analisar a foto…
            </p>
          ) : null}

          {detected && detected.length > 0 ? (
            <div>
              <p className="mb-1.5 flex items-center gap-1 text-[12px] uppercase tracking-[0.04em] text-text-muted">
                <Sparkles className="h-3.5 w-3.5 text-accent" /> Detetado na foto
              </p>
              <div className="overflow-hidden rounded-xl border border-line">
                {detected.map((d, i) => (
                  <button
                    key={`${d.name}-${i}`}
                    onClick={() => selectDetected(d)}
                    className="flex w-full items-center justify-between gap-2 border-b border-line px-3 py-2.5 text-left text-sm last:border-0 hover:bg-surface-2"
                  >
                    <span className="min-w-0 truncate">{d.name}</span>
                    <span className="stat shrink-0 text-text-muted">
                      {fmt(d.calories)} kcal / {fmt(d.quantity)}
                      {d.unit}
                    </span>
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[11px] text-text-muted">
                Estimativas por IA — toca para confirmar e ajustar antes de adicionar.
              </p>
            </div>
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
                    onClick={() =>
                      selectFood({
                        name: f.name,
                        per: f.quantity,
                        unit: f.unit,
                        calories: f.calories,
                        protein: f.protein,
                        carbs: f.carbs,
                        fat: f.fat,
                      })
                    }
                    className="rounded-pill border border-line bg-surface-2 px-2.5 py-1 text-[13px] transition hover:border-accent/50"
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {suggestions.length > 0 ? (
            <div className="max-h-64 overflow-y-auto rounded-xl border border-line">
              {suggestions.map((f) => {
                const Icon = foodIcon(f.name, f.category);
                return (
                  <button
                    key={`${f.source}-${f.id}`}
                    onClick={() => selectFood(f)}
                    className="flex w-full items-center justify-between gap-2 border-b border-line px-3 py-2.5 text-left text-sm last:border-0 hover:bg-surface-2"
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
                    <span className="stat shrink-0 text-text-muted">
                      {fmt(f.calories)} kcal / {f.per}
                      {f.unit}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}

          <button
            onClick={startManual}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-line py-2.5 text-sm text-text-muted transition hover:text-text"
          >
            <Plus className="h-4 w-4" />
            {search.trim() ? `Criar "${search.trim()}"` : 'Inserir manualmente'}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <button
            onClick={() => {
              setActiveDetected(null);
              setStage('search');
            }}
            className="-mt-1 inline-flex items-center gap-1.5 self-start text-sm text-text-muted transition hover:text-text"
          >
            <ArrowLeft className="h-4 w-4" /> Outro alimento
          </button>

          {manual ? (
            <Field label="Nome">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex: Peito de frango"
                autoFocus
              />
            </Field>
          ) : (
            <div className="rounded-xl bg-surface-2 px-3 py-2.5">
              <p className="font-medium">{name}</p>
              <p className="text-[12px] text-text-muted">
                <span className="stat">
                  {fmt(calories)} kcal · P{fmt(protein, 1)} H{fmt(carbs, 1)} G
                  {fmt(fat, 1)}
                </span>{' '}
                por {per}
                {unit}
              </p>
            </div>
          )}

          <Field label={`Quantidade (${unit})`}>
            <NumberInput
              value={quantity}
              onValueChange={(n) => setQuantity(n ?? 0)}
              autoFocus={!manual}
              className="stat text-lg"
            />
          </Field>

          <div className="rounded-xl bg-surface-2 px-3 py-2.5 text-sm">
            <span className="text-text-muted">
              Para {quantity}
              {unit}:{' '}
            </span>
            <span className="stat">
              {Math.round(scaled.calories)} kcal · P{r1(scaled.protein)} · H
              {r1(scaled.carbs)} · G{r1(scaled.fat)}
            </span>
          </div>

          {manual || showValues ? (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Valores por">
                  <div className="flex gap-2">
                    <NumberInput
                      value={per}
                      onValueChange={(n) => setPer(n ?? 0)}
                      className="w-20"
                    />
                    <Input
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      placeholder="g"
                    />
                  </div>
                </Field>
                <Field label="Calorias (kcal)">
                  <NumberInput
                    value={calories}
                    onValueChange={(n) => setCalories(n ?? 0)}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Field label="Prot.">
                  <NumberInput
                    value={protein}
                    onValueChange={(n) => setProtein(n ?? 0)}
                  />
                </Field>
                <Field label="Hidr.">
                  <NumberInput
                    value={carbs}
                    onValueChange={(n) => setCarbs(n ?? 0)}
                  />
                </Field>
                <Field label="Gord.">
                  <NumberInput
                    value={fat}
                    onValueChange={(n) => setFat(n ?? 0)}
                  />
                </Field>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowValues(true)}
              className="inline-flex items-center gap-1 self-start text-sm text-text-muted transition hover:text-text"
            >
              <ChevronDown className="h-4 w-4" /> Editar valores nutricionais
            </button>
          )}

          {manual ? (
            <label className="flex items-center gap-2 text-sm text-text-muted">
              <input
                type="checkbox"
                checked={saveToLib}
                onChange={(e) => setSaveToLib(e.target.checked)}
                className="h-4 w-4 accent-[color:var(--accent)]"
              />
              Guardar na minha biblioteca
            </label>
          ) : null}

          <Button onClick={submit} disabled={busy || !name.trim()}>
            {busy ? 'A adicionar…' : 'Adicionar'}
          </Button>
        </div>
      )}
    </Modal>
  );
}
