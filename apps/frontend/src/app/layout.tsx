import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { InstallPrompt } from '@/components/pwa/install-prompt';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

// Mono só para os números de destaque (calorias, cargas, macros) — dá um ar
// de instrumento de medição (PROJECT.md 8.3 permite mono nos números-herói).
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['500', '600'],
});

export const metadata: Metadata = {
  title: 'FitPlan',
  description:
    'Plataforma de fitness pessoal — calculadora de nutrição, registo de refeições e planos de treino.',
  applicationName: 'FitPlan',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FitPlan',
  },
  icons: {
    apple: '/icons/apple-touch-icon.png',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport: Viewport = {
  themeColor: '#1A1C1E',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  // o teclado virtual reduz a área visível (em vez de tapar o conteúdo)
  interactiveWidget: 'resizes-content',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
        <InstallPrompt />
        <Toaster />
      </body>
    </html>
  );
}
