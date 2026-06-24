import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { RemindersService } from './reminders.service';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, RemindersService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
