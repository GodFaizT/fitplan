'use client';

import { Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, SectionTitle } from '@/components/ui/card';
import {
  disablePush,
  enablePush,
  pushStatus,
  pushSupported,
  sendTestPush,
} from '@/lib/push';
import { toast } from '@/lib/toast';

export function NotificationsCard() {
  const [supported, setSupported] = useState(false);
  const [active, setActive] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setSupported(pushSupported());
    void pushStatus().then(setActive);
  }, []);

  if (!supported) return null;

  async function toggle() {
    setBusy(true);
    try {
      if (active) {
        await disablePush();
        setActive(false);
        toast.success('Notificações desativadas');
      } else {
        const ok = await enablePush();
        setActive(ok);
        if (ok) toast.success('Notificações ativadas');
        else toast.error('Permissão de notificações negada');
      }
    } catch {
      toast.error('Não foi possível alterar as notificações');
    } finally {
      setBusy(false);
    }
  }

  async function test() {
    try {
      await sendTestPush();
      toast.success('Teste enviado — deve aparecer em instantes');
    } catch {
      toast.error('Não foi possível enviar o teste');
    }
  }

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Bell className="h-4 w-4 text-accent" />
        <SectionTitle className="text-[15px]">Notificações</SectionTitle>
      </div>
      <p className="text-sm text-text-muted">
        Lembrete diário para registar as refeições e avisos no telemóvel.
        Funciona melhor com a app instalada no ecrã principal.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={active ? 'secondary' : 'primary'}
          onClick={toggle}
          disabled={busy}
        >
          {active ? 'Desativar' : 'Ativar notificações'}
        </Button>
        {active ? (
          <Button variant="ghost" onClick={test} disabled={busy}>
            Enviar teste
          </Button>
        ) : null}
      </div>
    </Card>
  );
}
