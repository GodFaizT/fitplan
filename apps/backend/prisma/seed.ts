/**
 * Seed da biblioteca de exercícios — Free Exercise DB (PROJECT.md 6.4).
 *
 * Descarrega o exercises.json (domínio público, sem chave/quota), mapeia os
 * campos e insere na tabela ExerciseLibrary. Correr uma vez:
 *   npm run seed:exercises -w @fitplan/backend
 *
 * Guarda os URLs raw das imagens do GitHub (mais rápido de montar). Para
 * robustez total, copiar as imagens para um volume/bucket próprio — ver 6.4.
 */
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const prisma = new PrismaClient();

function loadTranslations(): Record<string, { name: string; instructions: string[] }> {
  try {
    return JSON.parse(
      readFileSync(path.join(__dirname, 'exercises-pt.json'), 'utf8'),
    );
  } catch {
    return {};
  }
}

const SOURCE =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
const IMAGE_BASE =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';

interface RawExercise {
  id: string;
  name: string;
  force?: string | null;
  level?: string | null;
  mechanic?: string | null;
  equipment?: string | null;
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  instructions?: string[];
  category?: string | null;
  images?: string[];
}

async function main(): Promise<void> {
  console.log('A descarregar a Free Exercise DB...');
  const res = await fetch(SOURCE);
  if (!res.ok) {
    throw new Error(`Falha ao descarregar exercises.json: HTTP ${res.status}`);
  }
  const data = (await res.json()) as RawExercise[];
  console.log(`Recebidos ${data.length} exercícios.`);

  const pt = loadTranslations();
  const rows = data.map((e) => {
    const t = pt[e.id];
    return {
      slug: e.id,
      name: e.name,
      namePt: t?.name ?? null,
      category: e.category ?? null,
      level: e.level ?? null,
      force: e.force ?? null,
      mechanic: e.mechanic ?? null,
      equipment: e.equipment ?? null,
      primaryMuscles: e.primaryMuscles ?? [],
      secondaryMuscles: e.secondaryMuscles ?? [],
      instructions: e.instructions ?? [],
      instructionsPt: t?.instructions ?? [],
      imageUrls: (e.images ?? []).map((p) => IMAGE_BASE + p),
    };
  });

  // biblioteca estática: limpar e reinserir torna o seed idempotente
  await prisma.exerciseLibrary.deleteMany({});

  const chunkSize = 200;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    await prisma.exerciseLibrary.createMany({ data: chunk, skipDuplicates: true });
    console.log(`Inseridos ${Math.min(i + chunkSize, rows.length)}/${rows.length}`);
  }

  console.log('Seed da biblioteca de exercícios concluído.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
