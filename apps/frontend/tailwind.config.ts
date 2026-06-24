import type { Config } from 'tailwindcss';

/**
 * Tokens de design do FitPlan (PROJECT.md secção 8). As cores apontam para
 * variáveis CSS definidas em globals.css, o que permite trocar tema (escuro/claro)
 * e a cor de destaque sem recompilar.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        line: 'var(--border)',
        text: {
          DEFAULT: 'var(--text)',
          muted: 'var(--text-muted)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          text: 'var(--accent-text)',
        },
        protein: 'var(--protein)',
        carbs: 'var(--carbs)',
        fat: 'var(--fat)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
      },
      borderRadius: {
        card: '16px',
        pill: '9999px',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        hero: ['2.25rem', { lineHeight: '1.05', fontWeight: '500' }],
      },
      maxWidth: {
        content: '1100px',
      },
      boxShadow: {
        // brilho subtil da cor de destaque (botões, estados ativos)
        glow: '0 0 0 1px color-mix(in srgb, var(--accent) 30%, transparent), 0 8px 24px -10px color-mix(in srgb, var(--accent) 45%, transparent)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        // `both` mantém o estado inicial durante o animation-delay (stagger)
        'fade-up': 'fade-up 0.3s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
