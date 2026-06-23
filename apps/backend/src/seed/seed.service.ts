import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
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

/**
 * Popula automaticamente as bibliotecas no arranque, se estiverem vazias
 * (PROJECT.md 5.4 / 6.4). Idempotente: só semeia quando a tabela está vazia,
 * por isso pode correr em todos os deploys sem duplicar.
 */
@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.seedFoods();
    await this.seedExercises();
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
      if (count > 0) return;

      this.logger.log('Biblioteca de exercícios vazia — a descarregar Free Exercise DB...');
      const res = await fetch(EX_SOURCE);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as RawExercise[];

      const rows = data.map((e) => ({
        slug: e.id,
        name: e.name,
        category: e.category ?? null,
        level: e.level ?? null,
        force: e.force ?? null,
        mechanic: e.mechanic ?? null,
        equipment: e.equipment ?? null,
        primaryMuscles: e.primaryMuscles ?? [],
        secondaryMuscles: e.secondaryMuscles ?? [],
        instructions: e.instructions ?? [],
        imageUrls: (e.images ?? []).map((p) => IMG_BASE + p),
      }));

      const chunk = 200;
      for (let i = 0; i < rows.length; i += chunk) {
        await this.prisma.exerciseLibrary.createMany({
          data: rows.slice(i, i + chunk),
          skipDuplicates: true,
        });
      }
      this.logger.log(`Biblioteca de exercícios semeada: ${rows.length}.`);
    } catch (err) {
      this.logger.error(
        `Falha ao semear exercícios (a app continua, tenta no próximo arranque): ${String(err)}`,
      );
    }
  }
}
