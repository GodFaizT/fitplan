/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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

export default nextConfig;
