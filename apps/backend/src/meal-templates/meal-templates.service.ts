import { Injectable, NotFoundException } from '@nestjs/common';
import { MealsService } from '../meals/meals.service';
import { PrismaService } from '../prisma/prisma.service';
import { ApplyTemplateDto, CreateTemplateDto } from './dto/template.dto';

@Injectable()
export class MealTemplatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly meals: MealsService,
  ) {}

  /** Modelos do utilizador, com os respetivos alimentos. */
  list(userId: string) {
    return this.prisma.mealTemplate.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { items: { orderBy: { position: 'asc' } } },
    });
  }

  /** Guarda uma refeição (lista de alimentos) como modelo reutilizável. */
  create(userId: string, dto: CreateTemplateDto) {
    return this.prisma.mealTemplate.create({
      data: {
        userId,
        name: dto.name,
        items: {
          create: dto.items.map((it, i) => ({
            name: it.name,
            quantity: it.quantity,
            unit: it.unit,
            calories: it.calories,
            protein: it.protein,
            carbs: it.carbs,
            fat: it.fat,
            position: i,
          })),
        },
      },
      include: { items: { orderBy: { position: 'asc' } } },
    });
  }

  /** Aplica um modelo a um dia: cria uma refeição com os seus alimentos. */
  async apply(userId: string, templateId: string, dto: ApplyTemplateDto) {
    const template = await this.prisma.mealTemplate.findUnique({
      where: { id: templateId },
      include: { items: { orderBy: { position: 'asc' } } },
    });
    if (!template || template.userId !== userId) {
      throw new NotFoundException('Modelo não encontrado');
    }

    const log = await this.meals.getLog(userId, dto.date);
    const position = await this.prisma.meal.count({
      where: { dailyLogId: log.id },
    });
    return this.prisma.meal.create({
      data: {
        dailyLogId: log.id,
        type: dto.type ?? 'outro',
        label: dto.label ?? template.name,
        position,
        items: {
          create: template.items.map((it, i) => ({
            name: it.name,
            quantity: it.quantity,
            unit: it.unit,
            calories: it.calories,
            protein: it.protein,
            carbs: it.carbs,
            fat: it.fat,
            position: i,
          })),
        },
      },
      include: { items: { orderBy: { position: 'asc' } } },
    });
  }

  async remove(userId: string, id: string) {
    const template = await this.prisma.mealTemplate.findUnique({
      where: { id },
    });
    if (!template || template.userId !== userId) {
      throw new NotFoundException('Modelo não encontrado');
    }
    await this.prisma.mealTemplate.delete({ where: { id } });
    return { ok: true };
  }
}
