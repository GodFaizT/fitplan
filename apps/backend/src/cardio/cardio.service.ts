import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCardioDto } from './dto/cardio.dto';

@Injectable()
export class CardioService {
  constructor(private readonly prisma: PrismaService) {}

  /** Sessões de cardio recentes (mais recentes primeiro). */
  list(userId: string, limit = 60) {
    return this.prisma.cardioSession.findMany({
      where: { userId },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      take: Math.min(limit, 200),
    });
  }

  create(userId: string, dto: CreateCardioDto) {
    return this.prisma.cardioSession.create({
      data: {
        userId,
        date: new Date(`${dto.date}T00:00:00.000Z`),
        type: dto.type,
        durationMin: dto.durationMin,
        distanceKm: dto.distanceKm ?? null,
        calories: dto.calories ?? null,
        note: dto.note ?? null,
      },
    });
  }

  async remove(userId: string, id: string) {
    const entry = await this.prisma.cardioSession.findUnique({ where: { id } });
    if (!entry || entry.userId !== userId) {
      throw new NotFoundException('Registo não encontrado');
    }
    await this.prisma.cardioSession.delete({ where: { id } });
    return { ok: true };
  }
}
