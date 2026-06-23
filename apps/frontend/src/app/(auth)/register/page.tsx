'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Logo } from '@/components/nav/app-shell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field, Input } from '@/components/ui/input';
import { ApiError, registerRequest } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await registerRequest(email, password, name || undefined);
      setAuth(res.accessToken, res.user);
      router.replace('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <div className="mb-6 flex flex-col items-center gap-2 text-center">
        <Logo className="text-2xl" />
        <p className="text-sm text-text-muted">Cria a tua conta</p>
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Field label="Nome (opcional)">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="O teu nome"
            autoComplete="name"
          />
        </Field>
        <Field label="Email">
          <Input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
          />
        </Field>
        <Field label="Password" hint="Mínimo 8 caracteres">
          <Input
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </Field>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button type="submit" disabled={loading} className="mt-1">
          {loading ? 'A criar…' : 'Criar conta'}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-text-muted">
        Já tens conta?{' '}
        <Link href="/login" className="text-accent hover:underline">
          Entrar
        </Link>
      </p>
    </Card>
  );
}
