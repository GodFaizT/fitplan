'use client';

import {
  calculateNutrition,
  cmToFeetInches,
  feetInchesToCm,
  kgToLb,
  lbToKg,
  type NutritionInput,
} from '@fitplan/shared';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { MacroCards } from '@/components/nutrition/macro-display';
import { Button } from '@/components/ui/button';
import { Card, PageHeader } from '@/components/ui/card';
import { Field, Select } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { Skeleton } from '@/components/ui/misc';
import { Segmented } from '@/components/ui/segmented';
import { nutritionFromUser, useUpdateProfile } from '@/hooks/use-nutrition';
import { useAuthStore } from '@/lib/auth-store';
import { fmt } from '@/lib/format';
import {
  ACTIVITY_HINTS,
  ACTIVITY_LABELS,
  GOAL_LABELS,
  INTENSITY_LABELS,
} from '@/lib/labels';
import { toast } from '@/lib/toast';

const MacroDonut = dynamic(
  () => import('@/components/nutrition/macro-donut'),
  { ssr: false, loading: () => <Skeleton className="h-44 w-44 rounded-full" /> },
);

type Units = 'metric' | 'imperial';

export default function NutritionPage() {
  const user = useAuthStore((s) => s.user);
  const update = useUpdateProfile();

  const [units, setUnits] = useState<Units>((user?.units as Units) ?? 'metric');
  const [sex, setSex] = useState<NutritionInput['sex']>(
    (user?.sex as NutritionInput['sex']) ?? 'male',
  );
  const [age, setAge] = useState(user?.age ?? 30);
  const [weightKg, setWeightKg] = useState(user?.weightKg ?? 75);
  const [heightCm, setHeightCm] = useState(user?.heightCm ?? 175);
  const [activityLevel, setActivityLevel] = useState<
    NutritionInput['activityLevel']
  >((user?.activityLevel as NutritionInput['activityLevel']) ?? 'moderate');
  const [goal, setGoal] = useState<NutritionInput['goal']>(
    (user?.goal as NutritionInput['goal']) ?? 'maintain',
  );
  const [intensity, setIntensity] = useState<
    NonNullable<NutritionInput['goalIntensity']>
  >((user?.goalIntensity as NonNullable<NutritionInput['goalIntensity']>) ?? 'moderate');

  const result = useMemo(
    () =>
      calculateNutrition({
        sex,
        age,
        weightKg,
        heightCm,
        activityLevel,
        goal,
        goalIntensity: goal === 'maintain' ? undefined : intensity,
      }),
    [sex, age, weightKg, heightCm, activityLevel, goal, intensity],
  );

  const ft = cmToFeetInches(heightCm);

  async function onSave() {
    try {
      await update.mutateAsync({
        sex,
        age,
        weightKg: Math.round(weightKg * 10) / 10,
        heightCm: Math.round(heightCm * 10) / 10,
        activityLevel,
        goal,
        goalIntensity: goal === 'maintain' ? null : intensity,
        units,
      });
      toast.success('Alvos guardados');
    } catch {
      toast.error('Não foi possível guardar');
    }
  }

  const changed = nutritionFromUser(user)?.targetCalories !== result.targetCalories;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Nutrição"
        title="Calculadora"
        subtitle="Os teus dados, traduzidos em calorias e macros diários — atualiza em tempo real."
      />

      {/* Resultados */}
      <Card className="flex animate-fade-up flex-col items-center gap-5 [animation-delay:60ms] sm:flex-row sm:gap-8">
        <MacroDonut result={result} />
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-hero stat">{fmt(result.targetCalories)}</span>
            <span className="text-text-muted">kcal / dia</span>
          </div>
          <p className="mt-1 text-[13px] text-text-muted">
            BMR: {fmt(result.bmr)} kcal · TDEE: {fmt(result.tdee)} kcal
          </p>
          <div className="mt-4">
            <MacroCards result={result} />
          </div>
          {result.warning ? (
            <p className="mt-3 rounded-lg bg-warning/10 px-3 py-2 text-[13px] text-warning">
              {result.warning}
            </p>
          ) : null}
        </div>
      </Card>

      {/* Formulário */}
      <Card className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Sexo">
            <Segmented
              value={sex}
              onChange={setSex}
              options={[
                { value: 'male', label: 'Masculino' },
                { value: 'female', label: 'Feminino' },
              ]}
            />
          </Field>
          <Field label="Unidades">
            <Segmented
              value={units}
              onChange={setUnits}
              options={[
                { value: 'metric', label: 'Métrico' },
                { value: 'imperial', label: 'Imperial' },
              ]}
            />
          </Field>

          <Field label="Idade">
            <NumberInput
              inputMode="numeric"
              value={age}
              onValueChange={(n) => setAge(n ?? 0)}
            />
          </Field>

          {units === 'metric' ? (
            <Field label="Peso (kg)">
              <NumberInput
                value={weightKg}
                onValueChange={(n) => setWeightKg(n ?? 0)}
              />
            </Field>
          ) : (
            <Field label="Peso (lb)">
              <NumberInput
                value={Math.round(kgToLb(weightKg) * 10) / 10}
                onValueChange={(n) => setWeightKg(lbToKg(n ?? 0))}
              />
            </Field>
          )}

          {units === 'metric' ? (
            <Field label="Altura (cm)">
              <NumberInput
                value={heightCm}
                onValueChange={(n) => setHeightCm(n ?? 0)}
              />
            </Field>
          ) : (
            <Field label="Altura (ft / in)">
              <div className="flex gap-2">
                <NumberInput
                  inputMode="numeric"
                  aria-label="pés"
                  value={ft.feet}
                  onValueChange={(n) =>
                    setHeightCm(feetInchesToCm(n ?? 0, ft.inches))
                  }
                />
                <NumberInput
                  inputMode="numeric"
                  aria-label="polegadas"
                  value={ft.inches}
                  onValueChange={(n) =>
                    setHeightCm(feetInchesToCm(ft.feet, n ?? 0))
                  }
                />
              </div>
            </Field>
          )}

          <Field label="Nível de atividade" hint={ACTIVITY_HINTS[activityLevel]}>
            <Select
              value={activityLevel}
              onChange={(e) =>
                setActivityLevel(
                  e.target.value as NutritionInput['activityLevel'],
                )
              }
            >
              {Object.entries(ACTIVITY_LABELS).map(([v, label]) => (
                <option key={v} value={v}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Objetivo">
          <Segmented
            value={goal}
            onChange={setGoal}
            options={[
              { value: 'lose', label: GOAL_LABELS.lose },
              { value: 'maintain', label: GOAL_LABELS.maintain },
              { value: 'gain', label: GOAL_LABELS.gain },
            ]}
          />
        </Field>

        {goal !== 'maintain' ? (
          <Field label="Intensidade">
            <Segmented
              value={intensity}
              onChange={setIntensity}
              options={[
                { value: 'light', label: INTENSITY_LABELS.light },
                { value: 'moderate', label: INTENSITY_LABELS.moderate },
                { value: 'aggressive', label: INTENSITY_LABELS.aggressive },
              ]}
            />
          </Field>
        ) : null}

        <Button onClick={onSave} disabled={update.isPending}>
          {update.isPending
            ? 'A guardar…'
            : changed
              ? 'Guardar alvos'
              : 'Alvos guardados'}
        </Button>
      </Card>
    </div>
  );
}
