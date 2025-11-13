import { Inject, Injectable, Logger } from '@nestjs/common'; // <-- Добавьте Logger
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions.js';
import { LLM_PROVIDERS } from './llm.constants.js';
import { BaseLlmProvider } from './providers/base-llm.provider.js';

@Injectable()
export class LlmService {
  // ИСПРАВЛЕНО: Добавляем объявление логгера
  private readonly logger = new Logger(LlmService.name);

  private readonly systemPrompt = `Ты — полезный ассистент для мероприятия FOOD FEST. Твоя задача — отвечать на вопросы пользователей, основываясь ИСКЛЮЧИТЕЛЬНО на предоставленном контексте и истории диалога. Если ответ в контексте не найден, вежливо сообщи об этом. Не придумывай информацию.`;

  private readonly userPromptTemplate = `
    Используя приведенный ниже контекст и историю диалога, ответь на вопрос пользователя.
    Отвечай только на основе предоставленной информации.

    Контекст из базы знаний:
    ---
    {CONTEXT}
    ---

    Вопрос пользователя: {QUERY}
  `;

  constructor(
    @Inject(LLM_PROVIDERS) private readonly providers: BaseLlmProvider[],
  ) {
    if (!this.providers || this.providers.length === 0) {
      throw new Error(
        'No LLM providers configured. Please check your .env file.',
      );
    }
    // Теперь эта строка будет работать
    this.logger.log(
      `Initialized with ${this.providers.length} providers: ${this.providers.map((p) => p.providerName).join(', ')}`,
    );
  }

  private buildMessages(
    query: string,
    contextChunks: { content: string }[],
    history: { role: 'user' | 'assistant'; content: string }[],
  ): ChatCompletionMessageParam[] {
    const context =
      contextChunks.length > 0
        ? contextChunks.map((chunk) => chunk.content).join('\n\n---\n\n')
        : 'Контекст не найден.';

    const finalUserPrompt = this.userPromptTemplate
      .replace('{CONTEXT}', context)
      .replace('{QUERY}', query);

    console.log('# finalUserPrompt = ', finalUserPrompt);

    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: this.systemPrompt },
    ];

    history.forEach((msg) => {
      messages.push({ role: msg.role, content: msg.content });
    });

    messages.push({ role: 'user', content: finalUserPrompt });
    return messages;
  }

  // Название метода остается 'generateResponse', но теперь он принимает историю
  async generateResponse(
    query: string,
    contextChunks: { content: string }[],
    history: { role: 'user' | 'assistant'; content: string }[] = [],
  ): Promise<string> {
    // console.log('# query = ', query);
    const messages = this.buildMessages(query, contextChunks, history);

    for (const provider of this.providers) {
      this.logger.log(
        `Attempting to generate response with provider: ${provider.providerName}`,
      );
      const result = await provider.generate(messages);

      if (result) {
        this.logger.log(
          `Successfully generated response using ${provider.providerName}`,
        );
        return result;
      }

      this.logger.warn(
        `Provider ${provider.providerName} failed. Trying next provider...`,
      );
    }

    this.logger.error('All LLM providers failed to generate a response.');
    throw new Error(
      'Failed to generate response from any available LLM provider.',
    );
  }
}
