import withSerwistInit from '@serwist/next';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // imagem Docker slim para o deploy (PROJECT.md secção 12)
  output: 'standalone',
  // consome o pacote de lógica partilhada diretamente do workspace
  transpilePackages: ['@fitplan/shared'],
  // ESLint não está configurado neste projeto; não bloquear o build com lint
  eslint: { ignoreDuringBuilds: true },
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
