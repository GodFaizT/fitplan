import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import { PrismaService } from '../prisma/prisma.service';
import { COMMON_FOODS } from './foods.data';

const EX_SOURCE =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
const IMG_BASE =
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

type Translations = Record<string, { name: string; instructions: string[] }>;

/**
 * Popula automaticamente as bibliotecas no arranque, se estiverem vazias
 * (PROJECT.md 5.4 / 6.4), e garante as traduções PT dos exercícios. Idempotente.
 */
@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.seedFoods();
    await this.seedExercises();
  }

  private loadTranslations(): Translations {
    try {
      const file = path.join(__dirname, '../../prisma/exercises-pt.json');
      return JSON.parse(readFileSync(file, 'utf8')) as Translations;
    } catch {
      this.logger.warn('Sem exercises-pt.json — exercícios ficam em inglês.');
      return {};
    }
  }

  private async seedFoods(): Promise<void> {
    try {
      const count = await this.prisma.foodLibrary.count();
      if (count > 0) return;
      await this.prisma.foodLibrary.createMany({ data: COMMON_FOODS });
      this.logger.log(`Catálogo de alimentos semeado: ${COMMON_FOODS.length}.`);
    } catch (err) {
      this.logger.error(`Falha ao semear alimentos: ${String(err)}`);
    }
  }

  private async seedExercises(): Promise<void> {
    try {
      const count = await this.prisma.exerciseLibrary.count();
      if (count > 0) {
        await this.backfillTranslations();
        return;
      }

      this.logger.log('Biblioteca de exercícios vazia — a descarregar Free Exercise DB...');
      const res = await fetch(EX_SOURCE);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as RawExercise[];
      const pt = this.loadTranslations();

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
          imageUrls: (e.images ?? []).map((p) => IMG_BASE + p),
        };
      });

      const chunk = 200;
      for (let i = 0; i < rows.length; i += chunk) {
        await this.prisma.exerciseLibrary.createMany({
          data: rows.slice(i, i + chunk),
          skipDuplicates: true,
        });
      }
      this.logger.log(`Biblioteca de exercícios semeada: ${rows.length}.`);
    } catch (err) {
      this.logger.error(`Falha ao semear exercícios: ${String(err)}`);
    }
  }

  /** Aplica traduções PT a exercícios já existentes que ainda não as têm. */
  private async backfillTranslations(): Promise<void> {
    const missing = await this.prisma.exerciseLibrary.count({
      where: { namePt: null },
    });
    if (missing === 0) return;

    const pt = this.loadTranslations();
    const entries = Object.entries(pt);
    if (entries.length === 0) return;

    this.logger.log(`A aplicar traduções PT a ${missing} exercícios...`);
    let updated = 0;
    for (const [slug, t] of entries) {
      const r = await this.prisma.exerciseLibrary.updateMany({
        where: { slug, namePt: null },
        data: { namePt: t.name, instructionsPt: t.instructions },
      });
      updated += r.count;
    }
    this.logger.log(`Traduções PT aplicadas a ${updated} exercícios.`);
  }
}
