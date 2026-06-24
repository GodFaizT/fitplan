import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from './notifications.service';

@Injectable()
export class RemindersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  /**
   * Lembrete diário às 19h (Lisboa) a quem tem push ativo e ainda não registou
   * refeições hoje.
   */
  @Cron('0 19 * * *', { timeZone: 'Europe/Lisbon' })
  async dailyMealReminder(): Promise<void> {
    if (!this.notifications.isEnabled()) return;

    const subs = await this.prisma.pushSubscription.findMany({
      distinct: ['userId'],
      select: { userId: true },
    });
    if (subs.length === 0) return;

    const now = new Date();
    const today = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );

    for (const { userId } of subs) {
      const log = await this.prisma.dailyLog.findUnique({
        where: { userId_date: { userId, date: today } },
        include: { _count: { select: { meals: true } } },
      });
      if (log && log._count.meals > 0) continue; // já registou hoje

      await this.notifications.sendToUser(userId, {
        title: 'FitPlan',
        body: 'Já registaste as tuas refeições de hoje? 🍽️',
        url: '/refeicoes',
      });
    }
  }
}
