import { NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MealsService } from './meals.service';

function makeService() {
  const prisma = {
    meal: {
      findUnique: vi.fn(),
      update: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({}),
    },
    foodItem: {
      findUnique: vi.fn(),
      delete: vi.fn().mockResolvedValue({}),
    },
  };
  const service = new MealsService(prisma as never);
  return { service, prisma };
}

describe('MealsService (autorização / IDOR)', () => {
  let ctx: ReturnType<typeof makeService>;
  beforeEach(() => {
    ctx = makeService();
  });

  it('não deixa editar refeição de outro utilizador', async () => {
    ctx.prisma.meal.findUnique.mockResolvedValue({
      id: 'm1',
      dailyLog: { userId: 'outro' },
    });
    await expect(
      ctx.service.updateMeal('eu', 'm1', { label: 'x' } as never),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(ctx.prisma.meal.update).not.toHaveBeenCalled();
  });

  it('deixa editar a própria refeição', async () => {
    ctx.prisma.meal.findUnique.mockResolvedValue({
      id: 'm1',
      dailyLog: { userId: 'eu' },
    });
    await ctx.service.updateMeal('eu', 'm1', { label: 'x' } as never);
    expect(ctx.prisma.meal.update).toHaveBeenCalled();
  });

  it('não deixa apagar alimento de outro utilizador', async () => {
    ctx.prisma.foodItem.findUnique.mockResolvedValue({
      id: 'i1',
      meal: { dailyLog: { userId: 'outro' } },
    });
    await expect(ctx.service.deleteItem('eu', 'i1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(ctx.prisma.foodItem.delete).not.toHaveBeenCalled();
  });
});
