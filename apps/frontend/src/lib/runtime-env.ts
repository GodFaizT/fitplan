/** Valores injetados por /env.js (ver app/env.js/route.ts). */
interface RuntimeEnv {
  apiUrl?: string;
  vapidPublicKey?: string;
}

declare global {
  interface Window {
    __FITPLAN_ENV__?: RuntimeEnv;
  }
}

// Lidos em cada chamada (não no load do módulo) para garantir que /env.js já correu.
function runtimeEnv(): RuntimeEnv {
  return typeof window !== 'undefined' ? (window.__FITPLAN_ENV__ ?? {}) : {};
}

export function apiUrl(): string {
  return (
    runtimeEnv().apiUrl ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:3001/api'
  );
}

export function vapidPublicKey(): string {
  return runtimeEnv().vapidPublicKey || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
}
