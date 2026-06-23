'use client';

import { Check, ShieldCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, SectionTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/misc';
import { useAdminMutations, useAdminUsers } from '@/hooks/use-admin';
import { toast } from '@/lib/toast';

export function AdminPanel() {
  const pending = useAdminUsers(true);
  const { approve, reject } = useAdminMutations();
  const users = pending.data ?? [];

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-accent" />
        <SectionTitle className="text-[15px]">Contas pendentes</SectionTitle>
        {users.length > 0 ? (
          <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[12px] text-accent">
            {users.length}
          </span>
        ) : null}
      </div>

      {pending.isLoading ? (
        <Skeleton className="h-16 w-full" />
      ) : users.length === 0 ? (
        <p className="text-sm text-text-muted">
          Não há contas a aguardar aprovação.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-line">
          {users.map((u) => (
            <li key={u.id} className="flex items-center justify-between gap-2 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm">{u.name || u.email}</p>
                <p className="truncate text-[12px] text-text-muted">{u.email}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  size="sm"
                  disabled={approve.isPending}
                  onClick={() =>
                    approve.mutate(u.id, {
                      onSuccess: () => toast.success('Conta aprovada'),
                    })
                  }
                >
                  <Check className="h-4 w-4" /> Aprovar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label="Rejeitar"
                  onClick={() => {
                    if (confirm(`Rejeitar e apagar a conta ${u.email}?`)) {
                      reject.mutate(u.id, {
                        onSuccess: () => toast.success('Conta rejeitada'),
                      });
                    }
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
