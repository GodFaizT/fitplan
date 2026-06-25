import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertMeasurementDto } from './dto/measurement.dto';

@Injectable()
export class MeasurementsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Todas as medidas do utilizador (ordem cronológica, para os gráficos). */
  list(userId: string) {
    return this.prisma.bodyMeasurement.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
    });
  }

  /** Cria ou atualiza a medida do dia (uma por data + tipo). */
  upsert(userId: string, dto: UpsertMeasurementDto) {
    const date = new Date(`${dto.date}T00:00:00.000Z`);
    return this.prisma.bodyMeasurement.upsert({
      where: { userId_date_type: { userId, date, type: dto.type } },
      create: { userId, date, type: dto.type, value: dto.value },
      update: { value: dto.value },
    });
  }

  async remove(userId: string, id: string) {
    const entry = await this.prisma.bodyMeasurement.findUnique({
      where: { id },
    });
    if (!entry || entry.userId !== userId) {
      throw new NotFoundException('Registo não encontrado');
    }
    await this.prisma.bodyMeasurement.delete({ where: { id } });
    return { ok: true };
  }
}
