import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthUser, CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { SubscriptionDto, UnsubscribeDto } from './dto/subscription.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Post('subscribe')
  subscribe(@CurrentUser() user: AuthUser, @Body() dto: SubscriptionDto) {
    return this.notifications.subscribe(user.id, dto);
  }

  @Post('unsubscribe')
  unsubscribe(@CurrentUser() user: AuthUser, @Body() dto: UnsubscribeDto) {
    return this.notifications.unsubscribe(user.id, dto.endpoint);
  }

  /** Envia uma notificação de teste ao próprio utilizador. */
  @Post('test')
  async test(@CurrentUser() user: AuthUser) {
    await this.notifications.sendToUser(user.id, {
      title: 'FitPlan',
      body: 'As notificações estão a funcionar! 💪',
      url: '/',
    });
    return { ok: true };
  }
}
