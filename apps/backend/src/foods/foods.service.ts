import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFoodDto, UpdateFoodDto } from './dto/food.dto';

@Injectable()
export class FoodsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Biblioteca pessoal do utilizador, com pesquisa por nome (autocomplete). */
  list(userId: string, search?: string) {
    return this.prisma.savedFood.findMany({
      where: {
        userId,
        ...(search
          ? { name: { contains: search, mode: 'insensitive' as const } }
          : {}),
      },
      orderBy: { name: 'asc' },
    });
  }

  /** Catálogo global de alimentos comuns (leitura, predefinidos). PROJECT.md 5.4. */
  listLibrary(search?: string) {
    return this.prisma.foodLibrary.findMany({
      where: search
        ? { name: { contains: search, mode: 'insensitive' as const } }
        : undefined,
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  create(userId: string, dto: CreateFoodDto) {
    return this.prisma.savedFood.create({ data: { ...dto, userId } });
  }

  async update(userId: string, id: string, dto: UpdateFoodDto) {
    await this.ensureOwner(userId, id);
    return this.prisma.savedFood.update({ where: { id }, data: dto });
  }

  async remove(userId: string, id: string) {
    await this.ensureOwner(userId, id);
    await this.prisma.savedFood.delete({ where: { id } });
    return { ok: true };
  }

  private async ensureOwner(userId: string, id: string) {
    const food = await this.prisma.savedFood.findUnique({ where: { id } });
    if (!food || food.userId !== userId) {
      throw new NotFoundException('Alimento não encontrado');
    }
  }
}
