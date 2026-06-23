'use client';

import { ArrowRight, Dumbbell, Flame, Utensils } from 'lucide-react';
import Link from 'next/link';
import { Card, Eyebrow, SectionTitle } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Ring } from '@/components/ui/ring';
import { useDailyLog } from '@/hooks/use-meals';
import { usePlan, usePlans } from '@/hooks/use-plans';
import { useAuthStore } from '@/lib/auth-store';
import { fmt, todayISO, weekdayIndex } from '@/lib/format';
import { muscleLabel } from '@/lib/labels';
import { MACROS, type MacroMeta } from '@/lib/macros';
import { sumMeals, targetsFromUser } from '@/lib/totals';

const WEEKDAY_NAMES = [
  'domingo',
  'segunda',
  'terça',
  'quarta',
  'quinta',
  'sexta',
  'sábado',
];

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const today = todayISO();
  const log = useDailyLog(today);
  const plans = usePlans();
  const firstPlanId = plans.data?.[0]?.id ?? '';
  const plan = usePlan(firstPlanId);

  const targets = targetsFromUser(user);
  const totals = log.data ? sumMeals(log.data.meals) : null;

  const weekday = WEEKDAY_NAMES[weekdayIndex(today)];
  const todayDay = plan.data?.days?.find((d) =>
    d.label.toLowerCase().startsWith(weekday),
  );

  const firstName = user?.name?.split(' ')[0] ?? null;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <Eyebrow>{user?.email}</Eyebrow>
        <SectionTitle className="mt-1 text-2xl">
          {firstName ? `Olá, ${firstName}` : 'Bom treino'}
        </SectionTitle>
      </header>

      {/* Resumo de calorias */}
      {targets ? (
        <Card className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
          <Ring value={totals?.calories ?? 0} max={targets.calories}>
            <span className="text-2xl font-medium tabular">
              {fmt(totals?.calories ?? 0)}
            </span>
            <span className="text-[12px] text-text-muted">
              de {fmt(targets.calories)} kcal
            </span>
          </Ring>
          <div className="w-full flex-1">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-text-muted">Restam hoje</span>
              <span className="text-lg font-medium tabular">
                {fmt(Math.max(targets.calories - (totals?.calories ?? 0), 0))} kcal
              </span>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              {MACROS.map((mm) => (
                <MacroLine
                  key={mm.key}
                  meta={mm}
                  value={totals?.[mm.key] ?? 0}
                  max={targets[mm.key]}
                />
              ))}
            </div>
          </div>
        </Card>
      ) : (
        <Card className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Flame className="h-6 w-6 text-accent" />
            <div>
              <p className="text-text">Ainda não tens alvos definidos</p>
              <p className="text-sm text-text-muted">
                Preenche os teus dados na calculadora.
              </p>
            </div>
          </div>
          <Link
            href="/nutricao"
            className="shrink-0 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-accent-text"
          >
            Calcular
          </Link>
        </Card>
      )}

      {/* Treino de hoje */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <SectionTitle>Treino de hoje</SectionTitle>
          <Link href="/treino" className="text-sm text-text-muted hover:text-text">
            Ver planos
          </Link>
        </div>
        {todayDay ? (
          <Link href={`/treino/${plan.data?.id}?dia=${todayDay.id}`}>
            <Card className="transition hover:border-accent/40">
              <div className="flex items-center justify-between">
                <div>
                  <Eyebrow>{todayDay.label}</Eyebrow>
                  <p className="mt-1 text-lg font-medium">
                    {todayDay.title ?? 'Treino'}
                  </p>
                  <p className="mt-0.5 text-sm text-text-muted">
                    {todayDay.exercises.length} exercícios ·{' '}
                    {[...new Set(todayDay.exercises.map((e) => muscleLabel(e.muscleGroup)))]
                      .slice(0, 3)
                      .join(', ')}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-text-muted" />
              </div>
            </Card>
          </Link>
        ) : (
          <Card className="text-sm text-text-muted">
            Sem treino marcado para hoje.{' '}
            <Link href="/treino" className="text-accent hover:underline">
              Cria ou ajusta o teu plano
            </Link>
            .
          </Card>
        )}
      </div>

      {/* Atalhos */}
      <div className="grid grid-cols-2 gap-3">
        <QuickLink href="/refeicoes" icon={Utensils} label="Refeições" />
        <QuickLink href="/treino" icon={Dumbbell} label="Treino" />
      </div>
    </div>
  );
}

function MacroLine({
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
        <span className="tabular text-text-muted">
          {fmt(value)} / {fmt(max)} g
        </span>
      </div>
      <ProgressBar value={value} max={max} color={meta.color} />
    </div>
  );
}

function QuickLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof Utensils;
  label: string;
}) {
  return (
    <Link href={href}>
      <Card className="flex items-center gap-3 transition hover:border-accent/40">
        <Icon className="h-5 w-5 text-accent" />
        <span className="font-medium">{label}</span>
      </Card>
    </Link>
  );
}
