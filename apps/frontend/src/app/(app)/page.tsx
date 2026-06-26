'use client';

import { ArrowRight, Dumbbell, Flame, Utensils } from 'lucide-react';
import Link from 'next/link';
import { WeeklySummary } from '@/components/dashboard/weekly-summary';
import { Card, Eyebrow, PageHeader, SectionTitle } from '@/components/ui/card';
import { CountUp } from '@/components/ui/count-up';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Ring } from '@/components/ui/ring';
import { useDailyLog } from '@/hooks/use-meals';
import { useWorkoutWeek } from '@/hooks/use-plans';
import { useAuthStore } from '@/lib/auth-store';
import { fmt, todayISO, WEEK_ORDER, WEEKDAY_SHORT, weekdayIndex } from '@/lib/format';
import { MACROS, type MacroMeta } from '@/lib/macros';
import type { WeekScheduleDay } from '@/lib/types';
import { sumMeals, targetsFromUser } from '@/lib/totals';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const today = todayISO();
  const log = useDailyLog(today);
  const week = useWorkoutWeek();

  const targets = targetsFromUser(user);
  const totals = log.data ? sumMeals(log.data.meals) : null;

  const todayIdx = weekdayIndex(today);
  const schedule = week.data ?? [];
  const dayFor = (wd: number) =>
    schedule.find((d) => d.scheduledDays.includes(wd)) ?? null;
  const todayDay = dayFor(todayIdx);

  const firstName = user?.name?.split(' ')[0] ?? null;
  const consumed = totals?.calories ?? 0;
  const remaining = targets ? Math.max(targets.calories - consumed, 0) : 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={user?.email ?? 'FitPlan'}
        title={firstName ? `Olá, ${firstName}` : 'Bom treino'}
      />

      {/* Resumo de calorias */}
      {targets ? (
        <Card className="flex animate-fade-up flex-col items-center gap-6 [animation-delay:60ms] sm:flex-row sm:gap-8">
          <div className="relative shrink-0">
            <div
              aria-hidden
              className="glow-accent pointer-events-none absolute left-1/2 top-1/2 h-[150%] w-[150%] -translate-x-1/2 -translate-y-1/2 opacity-70"
            />
            <Ring value={consumed} max={targets.calories}>
              <CountUp
                value={consumed}
                format={(n) => fmt(Math.round(n))}
                className="stat text-[2rem] font-medium leading-none"
              />
              <span className="mt-1 text-[12px] text-text-muted">
                de <span className="stat">{fmt(targets.calories)}</span> kcal
              </span>
            </Ring>
          </div>
          <div className="w-full flex-1">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-text-muted">Restam hoje</span>
              <span className="stat text-lg font-medium">
                {fmt(remaining)}{' '}
                <span className="text-sm font-normal text-text-muted">kcal</span>
              </span>
            </div>
            <div className="mt-4 flex flex-col gap-3.5">
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
        <Card className="flex animate-fade-up items-center justify-between gap-4 [animation-delay:60ms]">
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
            className="shrink-0 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-accent-text transition hover:shadow-glow"
          >
            Calcular
          </Link>
        </Card>
      )}

      {/* Esta semana */}
      <div className="animate-fade-up [animation-delay:90ms]">
        <SectionTitle className="mb-3">Esta semana</SectionTitle>
        <WeeklySummary />
      </div>

      {/* Treino de hoje */}
      <div className="animate-fade-up [animation-delay:120ms]">
        <div className="mb-3 flex items-center justify-between">
          <SectionTitle>Treino de hoje</SectionTitle>
          <Link href="/treino" className="text-sm text-text-muted hover:text-text">
            Ver planos
          </Link>
        </div>
        {todayDay ? (
          <Link href={`/treino/${todayDay.planId}?dia=${todayDay.id}`}>
            <Card className="lift cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <Eyebrow>{todayDay.label}</Eyebrow>
                  <p className="mt-1 text-lg font-medium">
                    {todayDay.title ?? 'Treino'}
                  </p>
                  <p className="mt-0.5 text-sm text-text-muted">
                    {todayDay.exerciseCount} exercícios · {todayDay.planName}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-text-muted" />
              </div>
            </Card>
          </Link>
        ) : schedule.length === 0 ? (
          <Card className="text-sm text-text-muted">
            Ainda não tens a semana organizada.{' '}
            <Link href="/treino" className="text-accent hover:underline">
              Marca os teus dias de treino
            </Link>
            .
          </Card>
        ) : (
          <Card className="text-sm text-text-muted">Hoje é dia de descanso. 🧘</Card>
        )}

        {/* Agenda da semana */}
        {schedule.length > 0 ? (
          <div className="mt-3 grid grid-cols-7 gap-1.5">
            {WEEK_ORDER.map((wd) => {
              const d = dayFor(wd);
              const isToday = wd === todayIdx;
              const inner = (
                <div
                  className={`flex h-full flex-col items-center gap-1 rounded-xl border px-1 py-2 text-center transition ${
                    isToday
                      ? 'border-accent/60 bg-accent/10'
                      : 'border-line bg-surface'
                  }`}
                >
                  <span
                    className={`text-[11px] ${isToday ? 'text-accent' : 'text-text-muted'}`}
                  >
                    {WEEKDAY_SHORT[wd]}
                  </span>
                  {d ? (
                    <span className="line-clamp-2 text-[11px] font-medium leading-tight">
                      {dayShort(d)}
                    </span>
                  ) : (
                    <span className="text-[11px] text-text-muted">—</span>
                  )}
                </div>
              );
              return d ? (
                <Link key={wd} href={`/treino/${d.planId}?dia=${d.id}`}>
                  {inner}
                </Link>
              ) : (
                <div key={wd}>{inner}</div>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* Atalhos */}
      <div className="grid animate-fade-up grid-cols-2 gap-3 [animation-delay:180ms]">
        <QuickLink href="/refeicoes" icon={Utensils} label="Refeições" />
        <QuickLink href="/treino" icon={Dumbbell} label="Treino" />
      </div>
    </div>
  );
}

/** Rótulo curto para os chips da agenda (título sem o tipo entre parênteses). */
function dayShort(d: WeekScheduleDay): string {
  const base = d.title ?? d.label;
  return base.split('(')[0].replace(/·.*/, '').trim();
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
      <div className="mb-1.5 flex items-center justify-between text-[13px]">
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
      <Card className="lift flex cursor-pointer items-center gap-3">
        <Icon className="h-5 w-5 text-accent" />
        <span className="font-medium">{label}</span>
      </Card>
    </Link>
  );
}
