import { Module } from '@nestjs/common';
import { TelegramService } from './telegram/telegram.service.js';

@Module({
  providers: [TelegramService],
  exports: [TelegramService],
})
export class NotificationsModule {}
