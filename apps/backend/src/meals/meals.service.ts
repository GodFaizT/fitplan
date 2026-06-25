import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  AddItemDto,
  AddMealDto,
  UpdateItemDto,
  UpdateMealDto,
} from './dto/meal.dto';

const mealInclude = {
  meals: {
    orderBy: { position: 'asc' as const },
    include: { items: { orderBy: { position: 'asc' as const } } },
  },
} satisfies Prisma.DailyLogInclude;

/** Refeições criadas automaticamente num dia novo. */
const DEFAULT_MEALS = ['pequeno-almoco', 'almoco', 'lanche', 'jantar'] as const;

/** Converte "YYYY-MM-DD" para um Date à meia-noite UTC (coluna @db.Date). */
function parseDate(dateStr: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    throw new BadRequestException('Data inválida (esperado YYYY-MM-DD)');
  }
  return new Date(`${dateStr}T00:00:00.000Z`);
}

@Injectable()
export class MealsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Registo do dia (cria vazio se ainda não existir). PROJECT.md 5.3. */
  async getLog(userId: string, dateStr: string) {
    const date = parseDate(dateStr);
    const existing = await this.prisma.dailyLog.findUnique({
      where: { userId_date: { userId, date } },
      include: mealInclude,
    });
    if (existing) return existing;

    return this.prisma.dailyLog.create({
      data: {
        userId,
        date,
        meals: {
          create: DEFAULT_MEALS.map((type, i) => ({ type, position: i })),
        },
      },
      include: mealInclude,
    });
  }

  async addMeal(userId: string, dateStr: string, dto: AddMealDto) {
    const log = await this.getLog(userId, dateStr);
    const count = await this.prisma.meal.count({ where: { dailyLogId: log.id } });
    return this.prisma.meal.create({
      data: {
        dailyLogId: log.id,
        type: dto.type,
        label: dto.label,
        position: count,
      },
      include: { items: true },
    });
  }

  async updateMeal(userId: string, mealId: string, dto: UpdateMealDto) {
    await this.ensureMeal(userId, mealId);
    return this.prisma.meal.update({
      where: { id: mealId },
      data: dto,
      include: { items: { orderBy: { position: 'asc' } } },
    });
  }

  async deleteMeal(userId: string, mealId: string) {
    await this.ensureMeal(userId, mealId);
    await this.prisma.meal.delete({ where: { id: mealId } });
    return { ok: true };
  }

  async addItem(userId: string, mealId: string, dto: AddItemDto) {
    await this.ensureMeal(userId, mealId);
    const count = await this.prisma.foodItem.count({ where: { mealId } });
    return this.prisma.foodItem.create({
      data: { ...dto, mealId, position: count },
    });
  }

  async updateItem(userId: string, itemId: string, dto: UpdateItemDto) {
    await this.ensureItem(userId, itemId);
    return this.prisma.foodItem.update({ where: { id: itemId }, data: dto });
  }

  async deleteItem(userId: string, itemId: string) {
    await this.ensureItem(userId, itemId);
    await this.prisma.foodItem.delete({ where: { id: itemId } });
    return { ok: true };
  }

  /** Duplica uma refeição (com os seus alimentos) para outra data. PROJECT.md 5.3. */
  async duplicateMeal(userId: string, mealId: string, targetDate: string) {
    const meal = await this.ensureMeal(userId, mealId);
    const items = await this.prisma.foodItem.findMany({ where: { mealId } });
    const targetLog = await this.getLog(userId, targetDate);
    const count = await this.prisma.meal.count({
      where: { dailyLogId: targetLog.id },
    });
    return this.prisma.meal.create({
      data: {
        dailyLogId: targetLog.id,
        type: meal.type,
        label: meal.label,
        position: count,
        items: {
          create: items.map((it, i) => ({
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

  /** Copia todas as refeições (com alimentos) de um dia para outro. */
  async copyDay(userId: string, toDate: string, fromDate: string) {
    const fromD = parseDate(fromDate);
    const source = await this.prisma.dailyLog.findUnique({
      where: { userId_date: { userId, date: fromD } },
      include: {
        meals: { orderBy: { position: 'asc' }, include: { items: true } },
      },
    });
    const target = await this.getLog(userId, toDate);
    const sourceMeals = (source?.meals ?? []).filter((m) => m.items.length > 0);
    if (sourceMeals.length === 0) return target;

    // Remove o scaffolding por defeito vazio antes de copiar.
    await this.prisma.meal.deleteMany({
      where: { dailyLogId: target.id, items: { none: {} } },
    });
    let position = await this.prisma.meal.count({
      where: { dailyLogId: target.id },
    });
    for (const meal of sourceMeals) {
      await this.prisma.meal.create({
        data: {
          dailyLogId: target.id,
          type: meal.type,
          label: meal.label,
          position: position++,
          items: {
            create: meal.items.map((it, i) => ({
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
      });
    }
    return this.getLog(userId, toDate);
  }

  /** Alimentos usados recentemente (distintos por nome), para re-adicionar rápido. */
  async recentFoods(userId: string, limit = 12) {
    const items = await this.prisma.foodItem.findMany({
      where: { meal: { dailyLog: { userId } } },
      orderBy: { meal: { dailyLog: { date: 'desc' } } },
      take: 80,
      select: {
        name: true,
        quantity: true,
        unit: true,
        calories: true,
        protein: true,
        carbs: true,
        fat: true,
      },
    });
    const seen = new Set<string>();
    const out: typeof items = [];
    for (const it of items) {
      const key = it.name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(it);
      if (out.length >= limit) break;
    }
    return out;
  }

  /** Totais diários (calorias + macros + água) num intervalo, para tendências. */
  async summary(userId: string, fromStr: string, toStr: string) {
    const from = parseDate(fromStr);
    const to = parseDate(toStr);
    const logs = await this.prisma.dailyLog.findMany({
      where: { userId, date: { gte: from, lte: to } },
      orderBy: { date: 'asc' },
      include: { meals: { include: { items: true } } },
    });
    return logs.map((log) => {
      const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      for (const meal of log.meals) {
        for (const it of meal.items) {
          totals.calories += it.calories;
          totals.protein += it.protein;
          totals.carbs += it.carbs;
          totals.fat += it.fat;
        }
      }
      return {
        date: log.date.toISOString().slice(0, 10),
        water: log.water,
        calories: Math.round(totals.calories),
        protein: Math.round(totals.protein),
        carbs: Math.round(totals.carbs),
        fat: Math.round(totals.fat),
      };
    });
  }

  /** Define o nº de copos de água do dia. */
  async setWater(userId: string, dateStr: string, water: number) {
    await this.getLog(userId, dateStr); // garante que o dia existe
    const date = parseDate(dateStr);
    const value = Math.max(0, Math.min(Math.round(water), 30));
    await this.prisma.dailyLog.update({
      where: { userId_date: { userId, date } },
      data: { water: value },
    });
    return { water: value };
  }

  // ---- verificações de propriedade ---------------------------------------

  private async ensureMeal(userId: string, mealId: string) {
    const meal = await this.prisma.meal.findUnique({
      where: { id: mealId },
      include: { dailyLog: true },
    });
    if (!meal || meal.dailyLog.userId !== userId) {
      throw new NotFoundException('Refeição não encontrada');
    }
    return meal;
  }

  private async ensureItem(userId: string, itemId: string) {
    const item = await this.prisma.foodItem.findUnique({
      where: { id: itemId },
      include: { meal: { include: { dailyLog: true } } },
    });
    if (!item || item.meal.dailyLog.userId !== userId) {
      throw new NotFoundException('Alimento não encontrado');
    }
    return item;
  }
}
