import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  listUsers(pendingOnly: boolean) {
    return this.prisma.user.findMany({
      where: pendingOnly ? { approved: false } : undefined,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        approved: true,
        createdAt: true,
      },
    });
  }

  approve(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { approved: true },
      select: { id: true, approved: true },
    });
  }

  async reject(adminId: string, id: string) {
    if (adminId === id) {
      throw new BadRequestException('Não podes rejeitar a tua própria conta');
    }
    const target = await this.prisma.user.findUnique({
      where: { id },
      select: { role: true },
    });
    if (!target) throw new NotFoundException('Utilizador não encontrado');
    if (target.role === 'admin') {
      throw new BadRequestException('Não podes rejeitar um administrador');
    }
    await this.prisma.user.delete({ where: { id } });
    return { ok: true };
  }
}
