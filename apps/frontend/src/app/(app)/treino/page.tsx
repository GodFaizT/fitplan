'use client';

import { ChevronRight, Dumbbell, Plus, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, Eyebrow, SectionTitle } from '@/components/ui/card';
import { Field, Input } from '@/components/ui/input';
import { EmptyState, Skeleton } from '@/components/ui/misc';
import { Modal } from '@/components/ui/modal';
import { usePlanMutations, usePlans } from '@/hooks/use-plans';
import { useAuthStore } from '@/lib/auth-store';
import { toast } from '@/lib/toast';

export default function WorkoutsPage() {
  const user = useAuthStore((s) => s.user);
  const plans = usePlans();
  const { createPlan, join } = usePlanMutations();
  const router = useRouter();

  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  async function onCreate() {
    if (!name.trim()) return;
    const plan = await createPlan.mutateAsync({ name: name.trim() });
    setName('');
    setCreateOpen(false);
    router.push(`/treino/${plan.id}`);
  }

  async function onJoin() {
    try {
      const plan = await join.mutateAsync(code.trim());
      setCode('');
      setJoinOpen(false);
      toast.success('Plano adicionado à tua conta');
      router.push(`/treino/${plan.id}`);
    } catch {
      toast.error('Código inválido');
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <Eyebrow>Treino</Eyebrow>
          <SectionTitle className="mt-1">Os meus planos</SectionTitle>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setJoinOpen(true)}>
            <Users className="h-4 w-4" /> Aderir
          </Button>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> Criar
          </Button>
        </div>
      </header>

      {plans.isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : plans.data && plans.data.length > 0 ? (
        <div className="flex flex-col gap-3">
          {plans.data.map((plan) => {
            const mine = plan.ownerId === user?.id;
            return (
              <Link key={plan.id} href={`/treino/${plan.id}`}>
                <Card className="flex items-center justify-between transition hover:border-accent/40">
                  <div>
                    <p className="font-medium">{plan.name}</p>
                    <p className="text-[12px] text-text-muted">
                      {plan._count?.days ?? plan.days?.length ?? 0} dias
                      {!mine && plan.owner
                        ? ` · partilhado por ${plan.owner.name ?? plan.owner.email}`
                        : ''}
                      {plan.isShared && mine ? ' · partilhado' : ''}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-text-muted" />
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Dumbbell}
          title="Ainda não tens planos"
          description="Cria o teu primeiro plano ou adere a um com um código."
          action={
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" /> Criar plano
            </Button>
          }
        />
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Novo plano">
        <div className="flex flex-col gap-4">
          <Field label="Nome do plano">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Hipertrofia 5 dias"
              autoFocus
            />
          </Field>
          <Button onClick={onCreate} disabled={createPlan.isPending || !name.trim()}>
            Criar
          </Button>
        </div>
      </Modal>

      <Modal open={joinOpen} onClose={() => setJoinOpen(false)} title="Aderir a um plano">
        <div className="flex flex-col gap-4">
          <Field label="Código de partilha" hint="Cola o código que te enviaram. O plano é copiado para a tua conta.">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="ex: a1b2c3d4e5"
              autoFocus
            />
          </Field>
          <Button onClick={onJoin} disabled={join.isPending || !code.trim()}>
            Aderir
          </Button>
        </div>
      </Modal>
    </div>
  );
}
