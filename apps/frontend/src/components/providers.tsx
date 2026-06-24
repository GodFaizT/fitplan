'use client';

import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { ThemeProvider, useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { bootstrapAuth } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { QUERY_CACHE_KEY } from '@/lib/query-keys';

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 1,
        refetchOnWindowFocus: true, // refrescar ao focar (PROJECT.md 3.4)
        gcTime: 1000 * 60 * 60 * 24, // manter em cache 24h para leitura offline
      },
    },
  });
}

/** Restaura a sessão a partir do refresh cookie no arranque. */
function AuthBootstrap() {
  useEffect(() => {
    void bootstrapAuth();
  }, []);
  return null;
}

/** Aplica as preferências do utilizador (cor de destaque + tema). */
function AppearanceSync() {
  const user = useAuthStore((s) => s.user);
  const { setTheme } = useTheme();

  useEffect(() => {
    const root = document.documentElement;
    if (user?.accentColor) {
      root.style.setProperty('--accent', user.accentColor);
    } else {
      root.style.removeProperty('--accent');
    }
  }, [user?.accentColor]);

  useEffect(() => {
    if (user?.theme) setTheme(user.theme);
  }, [user?.theme, setTheme]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(makeQueryClient);
  const [persister] = useState(() =>
    typeof window === 'undefined'
      ? undefined
      : createSyncStoragePersister({
          storage: window.localStorage,
          key: QUERY_CACHE_KEY,
          throttleTime: 1000,
        }),
  );

  const inner = (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <AuthBootstrap />
      <AppearanceSync />
      {children}
    </ThemeProvider>
  );

  if (persister) {
    return (
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister, maxAge: 1000 * 60 * 60 * 24 }}
      >
        {inner}
      </PersistQueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>{inner}</QueryClientProvider>
  );
}
