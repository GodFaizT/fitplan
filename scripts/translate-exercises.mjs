/**
 * Traduz os nomes + instruções da Free Exercise DB para português e guarda em
 * apps/backend/prisma/exercises-pt.json (slug -> { name, instructions }).
 * Idempotente/retomável: salta os que já estão traduzidos. Guarda a cada 25.
 *
 * Uso: node scripts/translate-exercises.mjs
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const OUT = path.join(process.cwd(), 'apps/backend/prisma/exercises-pt.json');
const SRC =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function translate(text) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=pt&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const data = await res.json();
  return data[0].map((seg) => seg[0]).join('');
}

async function main() {
  let out = {};
  try {
    out = JSON.parse(await readFile(OUT, 'utf8'));
  } catch {
    /* primeiro arranque */
  }

  const exercises = await (await fetch(SRC)).json();
  console.log(
    `${exercises.length} exercícios; já traduzidos: ${Object.keys(out).length}`,
  );

  let done = 0;
  let failed = 0;
  for (const ex of exercises) {
    if (out[ex.id]) {
      done++;
      continue;
    }
    const lines = [ex.name, ...(ex.instructions || [])];
    const joined = lines.join('\n');

    let ok = false;
    for (let attempt = 1; attempt <= 3 && !ok; attempt++) {
      try {
        const translated = await translate(joined);
        const parts = translated.split('\n');
        out[ex.id] =
          parts.length === lines.length
            ? { name: parts[0], instructions: parts.slice(1) }
            : { name: parts[0] || ex.name, instructions: ex.instructions || [] };
        ok = true;
      } catch {
        await sleep(1000 * attempt);
      }
    }
    if (!ok) {
      failed++;
      out[ex.id] = { name: ex.name, instructions: ex.instructions || [] };
    }

    done++;
    if (done % 25 === 0) {
      await writeFile(OUT, JSON.stringify(out));
      console.log(`${done}/${exercises.length} (falhas: ${failed})`);
    }
    await sleep(120);
  }

  await writeFile(OUT, JSON.stringify(out));
  console.log(`Concluído: ${Object.keys(out).length} traduzidos, ${failed} falhas.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
