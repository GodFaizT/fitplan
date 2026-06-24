import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertWeightDto } from './dto/weight.dto';

/** Converte "YYYY-MM-DD" para um Date à meia-noite UTC (coluna @db.Date). */
function parseDate(dateStr: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    throw new BadRequestException('Data inválida (esperado YYYY-MM-DD)');
  }
  return new Date(`${dateStr}T00:00:00.000Z`);
}

@Injectable()
export class WeightsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Histórico de peso do utilizador (ordem cronológica, para o gráfico). */
  list(userId: string) {
    return this.prisma.weightEntry.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
    });
  }

  /** Cria ou atualiza o registo do dia (um por data). */
  upsert(userId: string, dto: UpsertWeightDto) {
    const date = parseDate(dto.date);
    return this.prisma.weightEntry.upsert({
      where: { userId_date: { userId, date } },
      create: { userId, date, weightKg: dto.weightKg },
      update: { weightKg: dto.weightKg },
    });
  }

  async remove(userId: string, id: string) {
    const entry = await this.prisma.weightEntry.findUnique({ where: { id } });
    if (!entry || entry.userId !== userId) {
      throw new NotFoundException('Registo não encontrado');
    }
    await this.prisma.weightEntry.delete({ where: { id } });
    return { ok: true };
  }
}
