import withSerwistInit from '@serwist/next';

// Cabeçalhos de segurança aplicados a todas as respostas.
// CSP conservadora: trava clickjacking (frame-ancestors), injeção de <base> e o
// alvo de formulários, e bloqueia plugins (object-src). Não restringe
// script/style/img/connect para não partir o Next/PWA — um bloqueio total de
// script-src exigiria nonces (middleware), possível evolução futura.
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(self), microphone=(), geolocation=()',
  },
  { key: 'Strict-Transport-Security', value: 'max-age=15552000' },
  {
    key: 'Content-Security-Policy',
    value: [
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join('; '),
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // imagem Docker slim para o deploy (PROJECT.md secção 12)
  output: 'standalone',
  // consome o pacote de lógica partilhada diretamente do workspace
  transpilePackages: ['@fitplan/shared'],
  // ESLint não está configurado neste projeto; não bloquear o build com lint
  eslint: { ignoreDuringBuilds: true },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  images: {
    remotePatterns: [
      // imagens dos exercícios (Free Exercise DB, URLs raw do GitHub)
      { protocol: 'https', hostname: 'raw.githubusercontent.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
    ],
  },
};

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  // service worker desativado em desenvolvimento (evita cache agressiva)
  disable: process.env.NODE_ENV === 'development',
});

export default withSerwist(nextConfig);
