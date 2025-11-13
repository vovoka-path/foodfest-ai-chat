// ИЗМЕНЕНО: Импортируем тип ChatCompletionMessageParam из более стабильного пути
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions.js';

export abstract class BaseLlmProvider {
  abstract readonly providerName: string;

  abstract generate(
    messages: ChatCompletionMessageParam[],
  ): Promise<string | null>;
}
