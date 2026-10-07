/**
 * Configuração do cliente lida em runtime (env do container), não em build-time:
 * a mesma imagem Docker serve qualquer domínio. O layout carrega /env.js antes
 * da app; o cliente lê os valores via `lib/runtime-env.ts`.
 *
 * Usar nomes sem NEXT_PUBLIC_ — essas são substituídas em build-time e aqui só
 * servem de fallback para o desenvolvimento local (.env.local).
 */
export const dynamic = 'force-dynamic';

export function GET() {
  const env = {
    apiUrl:
      process.env.API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:3001/api',
    vapidPublicKey:
      process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  };
  return new Response(`window.__FITPLAN_ENV__=${JSON.stringify(env)};`, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
