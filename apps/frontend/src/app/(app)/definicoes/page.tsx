'use client';

import { useQueryClient } from '@tanstack/react-query';
import { LogOut, RotateCcw } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AdminPanel } from '@/components/admin/admin-panel';
import { ChangePassword } from '@/components/settings/change-password';
import { Button } from '@/components/ui/button';
import { Card, Eyebrow, SectionTitle } from '@/components/ui/card';
import { Field, Input } from '@/components/ui/input';
import { Segmented } from '@/components/ui/segmented';
import { useUpdateProfile } from '@/hooks/use-nutrition';
import { logoutRequest } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { api } from '@/lib/api';
import { QUERY_CACHE_KEY } from '@/lib/query-keys';
import { toast } from '@/lib/toast';

const ACCENTS = [
  { value: '#C5F82A', label: 'Lima' },
  { value: '#378ADD', label: 'Azul' },
  { value: '#1D9E75', label: 'Verde' },
  { value: '#EF9F27', label: 'Âmbar' },
  { value: '#E24B4A', label: 'Vermelho' },
  { value: '#A78BFA', label: 'Violeta' },
];

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);
  const setUser = useAuthStore((s) => s.setUser);
  const update = useUpdateProfile();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [name, setName] = useState(user?.name ?? '');

  async function saveName() {
    await update.mutateAsync({ name: name || null });
    toast.success('Guardado');
  }

  async function setAccent(color: string | null) {
    await update.mutateAsync({ accentColor: color });
  }

  async function changeTheme(next: 'dark' | 'light') {
    setTheme(next);
    await update.mutateAsync({ theme: next });
  }

  async function onReset() {
    if (!confirm('Repor os teus dados pessoais e alvos? As refeições e planos mantêm-se.')) return;
    const updated = await api.del<typeof user>('/users/me/data');
    if (updated) setUser(updated);
    toast.success('Dados repostos');
  }

  async function onLogout() {
    await logoutRequest();
    clear();
    // Limpa os dados pessoais em cache (memória + localStorage) para não ficarem
    // acessíveis ao próximo utilizador no mesmo dispositivo (PWA partilhada).
    queryClient.clear();
    try {
      localStorage.removeItem(QUERY_CACHE_KEY);
    } catch {
      /* localStorage indisponível */
    }
    router.replace('/login');
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <Eyebrow>Definições</Eyebrow>
        <SectionTitle className="mt-1">Perfil</SectionTitle>
      </header>

      {user?.role === 'admin' ? <AdminPanel /> : null}

      <Card className="flex flex-col gap-4">
        <Field label="Nome">
          <div className="flex gap-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="O teu nome" />
            <Button variant="secondary" onClick={saveName} disabled={update.isPending}>
              Guardar
            </Button>
          </div>
        </Field>
        <div className="text-sm text-text-muted">{user?.email}</div>
      </Card>

      <ChangePassword />

      <Card className="flex flex-col gap-4">
        <SectionTitle className="text-[15px]">Unidades</SectionTitle>
        <Segmented
          value={(user?.units as 'metric' | 'imperial') ?? 'metric'}
          onChange={(u) => update.mutate({ units: u })}
          options={[
            { value: 'metric', label: 'Métrico (kg / cm)' },
            { value: 'imperial', label: 'Imperial (lb / ft)' },
          ]}
        />
      </Card>

      <Card className="flex flex-col gap-4">
        <SectionTitle className="text-[15px]">Tema</SectionTitle>
        <Segmented
          value={(theme as 'dark' | 'light') ?? 'dark'}
          onChange={changeTheme}
          options={[
            { value: 'dark', label: 'Escuro' },
            { value: 'light', label: 'Claro' },
          ]}
        />
      </Card>

      <Card className="flex flex-col gap-4">
        <SectionTitle className="text-[15px]">Cor de destaque</SectionTitle>
        <div className="flex flex-wrap gap-3">
          {ACCENTS.map((a) => (
            <button
              key={a.value}
              onClick={() => setAccent(a.value)}
              aria-label={a.label}
              className={`h-9 w-9 rounded-full border-2 transition ${
                (user?.accentColor ?? '#C5F82A') === a.value
                  ? 'border-text'
                  : 'border-transparent'
              }`}
              style={{ background: a.value }}
            />
          ))}
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        <Button variant="secondary" onClick={onReset}>
          <RotateCcw className="h-4 w-4" /> Repor dados pessoais
        </Button>
        <Button variant="danger" onClick={onLogout}>
          <LogOut className="h-4 w-4" /> Terminar sessão
        </Button>
      </Card>

      <p className="px-1 text-center text-[12px] text-text-muted">
        Biblioteca de exercícios:{' '}
        <a
          href="https://github.com/yuhonas/free-exercise-db"
          target="_blank"
          rel="noreferrer"
          className="hover:underline"
        >
          Free Exercise DB
        </a>{' '}
        (domínio público).
      </p>
    </div>
  );
}
