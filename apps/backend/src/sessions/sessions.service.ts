import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto } from './dto/session.dto';

/** 1RM estimado (fórmula de Epley). Só faz sentido com carga e reps > 0. */
function epley(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  return Math.round(weight * (1 + reps / 30));
}

/** Volume de uma série (carga × reps). */
function setVolume(s: { weight: number | null; reps: number | null }): number {
  return (s.weight ?? 0) * (s.reps ?? 0);
}

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Grava uma sessão de treino concluída com todas as séries. */
  async create(userId: string, dto: CreateSessionDto) {
    return this.prisma.workoutSession.create({
      data: {
        userId,
        planId: dto.planId ?? null,
        planName: dto.planName ?? null,
        dayLabel: dto.dayLabel ?? null,
        durationSec: dto.durationSec ?? 0,
        notes: dto.notes ?? null,
        completedAt: new Date(),
        sets: {
          create: dto.sets.map((s, i) => ({
            exerciseName: s.exerciseName,
            muscleGroup: s.muscleGroup ?? null,
            setNumber: s.setNumber,
            weight: s.weight ?? null,
            reps: s.reps ?? null,
            position: i,
          })),
        },
      },
      include: { sets: { orderBy: { position: 'asc' } } },
    });
  }

  /** Histórico recente (mais recentes primeiro) com volume calculado. */
  async list(userId: string, limit = 30) {
    const sessions = await this.prisma.workoutSession.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      take: Math.min(limit, 100),
      include: { sets: { orderBy: { position: 'asc' } } },
    });
    return sessions.map((s) => ({
      ...s,
      volume: Math.round(s.sets.reduce((n, x) => n + setVolume(x), 0)),
      totalSets: s.sets.length,
    }));
  }

  /** Estatísticas-resumo: contagens + recordes pessoais por exercício. */
  async stats(userId: string) {
    const sessions = await this.prisma.workoutSession.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      include: { sets: true },
    });

    const total = sessions.length;
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const thisWeek = sessions.filter(
      (s) => (s.completedAt ?? s.createdAt) >= weekAgo,
    ).length;

    // Melhor série por exercício (por 1RM estimado, com fallback à carga).
    const best = new Map<
      string,
      { exerciseName: string; weight: number; reps: number; e1rm: number }
    >();
    for (const s of sessions) {
      for (const set of s.sets) {
        if (!set.weight || set.weight <= 0) continue;
        const reps = set.reps ?? 0;
        const e1rm = epley(set.weight, reps);
        const score = e1rm || set.weight;
        const prev = best.get(set.exerciseName);
        const prevScore = prev ? prev.e1rm || prev.weight : 0;
        if (!prev || score > prevScore) {
          best.set(set.exerciseName, {
            exerciseName: set.exerciseName,
            weight: set.weight,
            reps,
            e1rm,
          });
        }
      }
    }

    const prs = [...best.values()]
      .sort((a, b) => (b.e1rm || b.weight) - (a.e1rm || a.weight))
      .slice(0, 8);

    return { total, thisWeek, prs };
  }

  /** Progressão de um exercício ao longo do tempo (melhor série por sessão). */
  async progression(userId: string, exerciseName: string) {
    const sessions = await this.prisma.workoutSession.findMany({
      where: { userId, sets: { some: { exerciseName } } },
      orderBy: { completedAt: 'asc' },
      include: { sets: { where: { exerciseName } } },
    });

    return sessions
      .map((s) => {
        const withLoad = s.sets.filter((x) => x.weight && x.weight > 0);
        if (withLoad.length === 0) return null;
        const maxWeight = Math.max(...withLoad.map((x) => x.weight ?? 0));
        const e1rm = Math.max(
          ...withLoad.map((x) => epley(x.weight ?? 0, x.reps ?? 0)),
        );
        const volume = Math.round(
          s.sets.reduce((n, x) => n + setVolume(x), 0),
        );
        return {
          date: (s.completedAt ?? s.createdAt).toISOString().slice(0, 10),
          maxWeight,
          e1rm,
          volume,
        };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null);
  }

  async remove(userId: string, id: string) {
    const session = await this.prisma.workoutSession.findUnique({
      where: { id },
    });
    if (!session || session.userId !== userId) {
      throw new NotFoundException('Sessão não encontrada');
    }
    await this.prisma.workoutSession.delete({ where: { id } });
    return { ok: true };
  }
}
