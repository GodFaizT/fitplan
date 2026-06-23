'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, SectionTitle } from '@/components/ui/card';
import { Field, Input } from '@/components/ui/input';
import { ApiError, api } from '@/lib/api';
import { toast } from '@/lib/toast';

export function ChangePassword() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (next.length < 8) {
      toast.error('A nova password deve ter pelo menos 8 caracteres');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: current,
        newPassword: next,
      });
      setCurrent('');
      setNext('');
      toast.success('Password alterada');
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : 'Não foi possível alterar a password',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="flex flex-col gap-4">
      <SectionTitle className="text-[15px]">Password</SectionTitle>
      <Field label="Password atual">
        <Input
          type="password"
          autoComplete="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
        />
      </Field>
      <Field label="Nova password" hint="Mínimo 8 caracteres">
        <Input
          type="password"
          autoComplete="new-password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
        />
      </Field>
      <Button
        variant="secondary"
        onClick={submit}
        disabled={loading || !current || next.length < 8}
      >
        {loading ? 'A alterar…' : 'Alterar password'}
      </Button>
    </Card>
  );
}
