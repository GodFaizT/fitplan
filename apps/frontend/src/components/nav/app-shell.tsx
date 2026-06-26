'use client';

import {
  Dumbbell,
  LayoutDashboard,
  Settings,
  TrendingUp,
  Utensils,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';

const NAV = [
  { href: '/', label: 'Início', icon: LayoutDashboard },
  { href: '/nutricao', label: 'Nutrição', icon: Zap },
  { href: '/refeicoes', label: 'Refeições', icon: Utensils },
  { href: '/treino', label: 'Treino', icon: Dumbbell },
  { href: '/progresso', label: 'Progresso', icon: TrendingUp },
];

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('text-[19px] font-medium tracking-tight', className)}>
      Fit<span className="text-accent">Plan</span>
    </span>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const settingsActive = isActive(pathname, '/definicoes');

  return (
    <div className="min-h-[100dvh]">
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-line bg-surface px-4 py-6 lg:flex">
        <div className="px-2">
          <Logo />
        </div>
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] transition',
                  active
                    ? 'bg-surface-2 text-text'
                    : 'text-text-muted hover:bg-surface-2 hover:text-text',
                )}
              >
                {active ? (
                  <span
                    aria-hidden
                    className="accent-bar absolute left-1 top-1/2 h-5 w-1 -translate-y-1/2 rounded-pill"
                  />
                ) : null}
                <Icon
                  className={cn('h-5 w-5', active && 'text-accent')}
                  strokeWidth={active ? 2.2 : 1.8}
                />
                {label}
              </Link>
            );
          })}
        </nav>
        {/* Definições no fundo da sidebar */}
        <Link
          href="/definicoes"
          className={cn(
            'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] transition',
            settingsActive
              ? 'bg-surface-2 text-text'
              : 'text-text-muted hover:bg-surface-2 hover:text-text',
          )}
        >
          {settingsActive ? (
            <span
              aria-hidden
              className="accent-bar absolute left-1 top-1/2 h-5 w-1 -translate-y-1/2 rounded-pill"
            />
          ) : null}
          <Settings
            className={cn('h-5 w-5', settingsActive && 'text-accent')}
            strokeWidth={settingsActive ? 2.2 : 1.8}
          />
          Definições
        </Link>
      </aside>

      {/* Barra de topo (mobile) — marca + acesso a Definições */}
      <header className="safe-top sticky top-0 z-30 flex items-center justify-between border-b border-line bg-bg/80 px-4 py-3 backdrop-blur lg:hidden">
        <Logo />
        <Link
          href="/definicoes"
          aria-label="Definições"
          className={cn(
            'rounded-lg p-1.5 transition',
            settingsActive ? 'text-accent' : 'text-text-muted hover:text-text',
          )}
        >
          <Settings className="h-5 w-5" />
        </Link>
      </header>

      {/* Conteúdo */}
      <main className="mx-auto w-full max-w-content px-4 pb-28 pt-5 sm:px-6 lg:pb-10 lg:pl-64 lg:pr-8 lg:pt-6">
        {children}
      </main>

      {/* Bottom-nav (mobile) */}
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-content items-stretch justify-around">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className="relative flex flex-1 flex-col items-center gap-1 py-2.5 transition active:scale-[0.92]"
              >
                {active ? (
                  <span
                    aria-hidden
                    className="accent-bar absolute top-0 h-0.5 w-9 rounded-pill"
                  />
                ) : null}
                <Icon
                  className={cn(
                    'h-[22px] w-[22px] transition',
                    active ? 'text-accent' : 'text-text-muted',
                  )}
                  strokeWidth={active ? 2.2 : 1.8}
                />
                <span
                  className={cn(
                    'text-[11px] transition',
                    active ? 'font-medium text-text' : 'text-text-muted',
                  )}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
