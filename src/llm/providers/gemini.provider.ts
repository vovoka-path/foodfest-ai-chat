import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GoogleGenAI,
  HarmCategory,
  HarmBlockThreshold,
  Content,
} from '@google/genai';
// ИЗМЕНЕНО: Исправляем путь импорта, чтобы TypeScript мог найти тип
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions.js';
import { BaseLlmProvider } from './base-llm.provider.js';

@Injectable()
export class GeminiProvider extends BaseLlmProvider {
  readonly providerName = 'gemini';
  private readonly logger = new Logger(GeminiProvider.name);
  private ai: GoogleGenAI;
  private model: string;

  constructor(private readonly configService: ConfigService) {
    super();
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error(
        'GEMINI_API_KEY is not set in the environment variables.',
      );
    }
    this.ai = new GoogleGenAI({ apiKey });
    this.model = this.configService.get<string>(
      'GEMINI_MODEL_NAME',
      'gemini-2.5-flash',
    );
  }

  private adaptMessagesToGemini(messages: ChatCompletionMessageParam[]): {
    history: Content[];
    lastMessage: string;
    systemInstruction?: string;
  } {
    let systemInstruction: string | undefined = undefined;

    const conversationMessages = messages.filter((m) => {
      if (m.role === 'system') {
        systemInstruction = m.content as string;
        return false;
      }
      return true;
    });

    const lastUserMessage = conversationMessages.pop();
    if (
      !lastUserMessage ||
      lastUserMessage.role !== 'user' ||
      !lastUserMessage.content
    ) {
      throw new Error(
        'The last message must be a non-empty user message for chat.',
      );
    }

    const history: Content[] = conversationMessages.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content as string }],
    }));

    return {
      history,
      lastMessage: lastUserMessage.content as string,
      systemInstruction,
    };
  }

  async generate(
    messages: ChatCompletionMessageParam[],
  ): Promise<string | null> {
    try {
      this.logger.log(`Requesting completion from Gemini model: ${this.model}`);

      const { history, lastMessage, systemInstruction } =
        this.adaptMessagesToGemini(messages);

      const chat = this.ai.chats.create({
        model: this.model,
        history: history,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.2,
          safetySettings: [
            {
              category: HarmCategory.HARM_CATEGORY_HARASSMENT,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
              threshold: HarmBlockThreshold.BLOCK_NONE,
            },
          ],
        },
      });

      const result = await chat.sendMessage({ message: lastMessage });

      return result.text ?? null;
    } catch (error) {
      this.logger.error('Error calling Gemini API', error);
      return null;
    }
  }
}
