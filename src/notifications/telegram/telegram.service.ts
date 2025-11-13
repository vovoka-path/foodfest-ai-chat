import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';

@Injectable()
export class TelegramService {
  private bot: Telegraf;

  constructor(private readonly configService: ConfigService) {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (token) {
      this.bot = new Telegraf(token);
    } else {
      console.warn(
        'TELEGRAM_BOT_TOKEN is not configured. Telegram notifications are disabled.',
      );
    }
  }

  async sendMessage(text: string): Promise<void> {
    const chatId = this.configService.get<string>('TELEGRAM_CHAT_ID');
    if (!this.bot || !chatId) {
      console.error(
        'Telegram client is not initialized or CHAT_ID is missing.',
      );
      return;
    }

    try {
      // Используем MarkdownV2 для форматирования
      await this.bot.telegram.sendMessage(chatId, text, {
        parse_mode: 'MarkdownV2',
      });
    } catch (error) {
      console.error('Failed to send Telegram message:', error);
    }
  }
}
