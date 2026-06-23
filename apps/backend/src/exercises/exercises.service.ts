import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface ExerciseQuery {
  search?: string;
  muscle?: string;
  equipment?: string;
  limit?: number;
}

@Injectable()
export class ExercisesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Pesquisa na biblioteca global (leitura para autenticados). PROJECT.md 6.4. */
  list(query: ExerciseQuery) {
    const where: Prisma.ExerciseLibraryWhereInput = {};
    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }
    if (query.muscle) {
      where.primaryMuscles = { has: query.muscle };
    }
    if (query.equipment) {
      where.equipment = query.equipment;
    }

    const take = Math.min(query.limit ?? 40, 100);
    return this.prisma.exerciseLibrary.findMany({
      where,
      take,
      orderBy: { name: 'asc' },
    });
  }

  async get(id: string) {
    const exercise = await this.prisma.exerciseLibrary.findUnique({ where: { id } });
    if (!exercise) throw new NotFoundException('Exercício não encontrado');
    return exercise;
  }

  /** Lista distinta de grupos musculares e equipamentos, para os filtros da UI. */
  async facets() {
    const all = await this.prisma.exerciseLibrary.findMany({
      select: { primaryMuscles: true, equipment: true },
    });
    const muscles = new Set<string>();
    const equipment = new Set<string>();
    for (const e of all) {
      e.primaryMuscles.forEach((m) => muscles.add(m));
      if (e.equipment) equipment.add(e.equipment);
    }
    return {
      muscles: [...muscles].sort(),
      equipment: [...equipment].sort(),
    };
  }
}
