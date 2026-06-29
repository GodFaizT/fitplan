'use client';

import { useQueryClient } from '@tanstack/react-query';
import { Download, LogOut, RotateCcw } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AdminPanel } from '@/components/admin/admin-panel';
import { ChangePassword } from '@/components/settings/change-password';
import { NotificationsCard } from '@/components/settings/notifications';
import { Button } from '@/components/ui/button';
import { Card, PageHeader, SectionTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Field, Input } from '@/components/ui/input';
import { Segmented } from '@/components/ui/segmented';
import { useUpdateProfile } from '@/hooks/use-nutrition';
import { logoutRequest } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { api } from '@/lib/api';
import { todayISO } from '@/lib/format';
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
  const [confirmReset, setConfirmReset] = useState(false);
  const [exporting, setExporting] = useState(false);

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

  async function onExport() {
    setExporting(true);
    try {
      const data = await api.get<unknown>('/users/me/export');
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fitplan-${todayISO()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success('Dados exportados');
    } catch {
      toast.error('Não foi possível exportar');
    } finally {
      setExporting(false);
    }
  }

  async function onReset() {
    const updated = await api.del<typeof user>('/users/me/data');
    if (updated) setUser(updated);
    setConfirmReset(false);
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
      <PageHeader eyebrow="Definições" title="Perfil" />

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

      <NotificationsCard />

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
        <Button variant="secondary" onClick={onExport} disabled={exporting}>
          <Download className="h-4 w-4" />{' '}
          {exporting ? 'A exportar…' : 'Exportar os meus dados'}
        </Button>
        <Button variant="secondary" onClick={() => setConfirmReset(true)}>
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

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={onReset}
        title="Repor dados pessoais"
        description="Repor os teus dados pessoais e alvos? As refeições e planos mantêm-se."
        confirmLabel="Repor"
      />
    </div>
  );
}
