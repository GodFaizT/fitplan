/**
 * Gera os ícones da PWA a partir de um logótipo SVG (sem dependências de fontes).
 * Uso: node scripts/generate-icons.mjs
 */
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const pub = path.join(process.cwd(), 'apps/frontend/public/icons');
const appDir = path.join(process.cwd(), 'apps/frontend/src/app');
await mkdir(pub, { recursive: true });

// Halteres (dumbbell) em escuro sobre fundo lima.
const glyph = `
  <rect x="120" y="214" width="28" height="84" rx="8" fill="#1A1C1E"/>
  <rect x="152" y="192" width="32" height="128" rx="10" fill="#1A1C1E"/>
  <rect x="184" y="236" width="144" height="40" rx="8" fill="#1A1C1E"/>
  <rect x="328" y="192" width="32" height="128" rx="10" fill="#1A1C1E"/>
  <rect x="364" y="214" width="28" height="84" rx="8" fill="#1A1C1E"/>
`;

function svg({ rounded, scale }) {
  const inner = scale
    ? `<g transform="translate(256,256) scale(${scale}) translate(-256,-256)">${glyph}</g>`
    : glyph;
  const rx = rounded ? 112 : 0;
  return `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><rect width="512" height="512" rx="${rx}" fill="#C5F82A"/>${inner}</svg>`;
}

const iconSvg = Buffer.from(svg({ rounded: true }));
const maskableSvg = Buffer.from(svg({ rounded: false, scale: 0.7 }));

async function render(svgBuf, size, file) {
  await sharp(svgBuf).resize(size, size).png().toFile(file);
  console.log('->', path.relative(process.cwd(), file));
}

await render(iconSvg, 192, path.join(pub, 'icon-192.png'));
await render(iconSvg, 512, path.join(pub, 'icon-512.png'));
await render(maskableSvg, 512, path.join(pub, 'maskable-512.png'));
await render(iconSvg, 180, path.join(pub, 'apple-touch-icon.png'));
await render(iconSvg, 256, path.join(appDir, 'icon.png'));
console.log('Ícones gerados.');
