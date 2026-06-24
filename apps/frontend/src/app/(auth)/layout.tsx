'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/lib/auth-store';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const status = useAuthStore((s) => s.status);
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') router.replace('/');
  }, [status, router]);

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-4 py-10">
      <div
        aria-hidden
        className="glow-accent pointer-events-none absolute left-1/2 top-[14%] h-[420px] w-[560px] max-w-[120vw] -translate-x-1/2 opacity-60"
      />
      {children}
    </div>
  );
}
