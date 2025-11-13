import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions.js';
import { BaseLlmProvider } from './base-llm.provider.js';

@Injectable()
export class OpenAiProvider extends BaseLlmProvider {
  readonly providerName = 'openai';
  private readonly logger = new Logger(OpenAiProvider.name);
  private openai: OpenAI;
  private model: string;

  constructor(private readonly configService: ConfigService) {
    super();
    // Когда типы загрузятся, ESLint поймет, что `new OpenAI` - это безопасная операция.
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
      baseURL: this.configService.get<string>('OPENAI_BASE_URL'),
      timeout: this.configService.get<number>('OPENAI_REQUEST_TIMEOUT', 60000),
      maxRetries: this.configService.get<number>('OPENAI_MAX_RETRIES', 2),
    });
    this.model = this.configService.get<string>('OPENAI_MODEL_NAME', 'gpt-4o');
  }

  async generate(
    messages: ChatCompletionMessageParam[],
  ): Promise<string | null> {
    try {
      this.logger.log(`Requesting completion from OpenAI model: ${this.model}`);
      // ESLint поймет, что `this.openai.chat.completions.create` - это существующий метод.
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: messages,
        temperature: 0.2,
      });
      // ESLint поймет, что `completion` имеет свойство `choices`.
      return completion.choices[0].message.content;
    } catch (error) {
      // ESLint поймет, что `OpenAI.APIError` - это существующий тип для проверки.
      if (error instanceof OpenAI.APIError) {
        this.logger.error(
          `OpenAI API Error: status=${error.status}, type=${error.type}, message=${error.message}`,
        );
      } else {
        this.logger.error(
          'An unexpected error occurred calling OpenAI API',
          error,
        );
      }
      return null;
    }
  }
}
