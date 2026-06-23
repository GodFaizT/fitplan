'use client';

import {
  calculateNutrition,
  cmToFeetInches,
  feetInchesToCm,
  kgToLb,
  lbToKg,
  type NutritionInput,
} from '@fitplan/shared';
import { useMemo, useState } from 'react';
import { MacroCards, MacroDonut } from '@/components/nutrition/macro-display';
import { Button } from '@/components/ui/button';
import { Card, Eyebrow, SectionTitle } from '@/components/ui/card';
import { Field, Input, Select } from '@/components/ui/input';
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
      <header>
        <Eyebrow>Nutrição</Eyebrow>
        <SectionTitle className="mt-1">Calculadora</SectionTitle>
        <p className="mt-1 text-sm text-text-muted">
          Os teus dados → calorias e macros diários. Atualiza em tempo real.
        </p>
      </header>

      {/* Resultados */}
      <Card className="flex flex-col items-center gap-5 sm:flex-row sm:gap-8">
        <MacroDonut result={result} />
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-hero tabular">{fmt(result.targetCalories)}</span>
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
            <Input
              type="number"
              min={10}
              max={120}
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
            />
          </Field>

          {units === 'metric' ? (
            <Field label="Peso (kg)">
              <Input
                type="number"
                step="0.1"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
              />
            </Field>
          ) : (
            <Field label="Peso (lb)">
              <Input
                type="number"
                step="0.1"
                value={Math.round(kgToLb(weightKg) * 10) / 10}
                onChange={(e) => setWeightKg(lbToKg(Number(e.target.value)))}
              />
            </Field>
          )}

          {units === 'metric' ? (
            <Field label="Altura (cm)">
              <Input
                type="number"
                step="0.1"
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
              />
            </Field>
          ) : (
            <Field label="Altura (ft / in)">
              <div className="flex gap-2">
                <Input
                  type="number"
                  aria-label="pés"
                  value={ft.feet}
                  onChange={(e) =>
                    setHeightCm(feetInchesToCm(Number(e.target.value), ft.inches))
                  }
                />
                <Input
                  type="number"
                  aria-label="polegadas"
                  value={ft.inches}
                  onChange={(e) =>
                    setHeightCm(feetInchesToCm(ft.feet, Number(e.target.value)))
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
