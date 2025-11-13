import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmbeddingsService } from '../embeddings/embeddings.service.js';
import { SearchService } from '../search/search.service.js';
import { LlmService } from '../llm/llm.service.js';
import { CreateChatMessageDto } from './dto/create-chat-message.dto.js';
import { RagResponse } from './dto/rag-response.dto.js';
import {
  ChatSessionEntity,
  ChatMessageEntity,
  ChatMessageRole,
} from './entities/chat.entities.js';

const CHAT_CONFIG = {
  TAKE: 10,
} as const;

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly embeddingsService: EmbeddingsService,
    private readonly searchService: SearchService,
    private readonly llmService: LlmService,
    @InjectRepository(ChatSessionEntity)
    private readonly sessionRepository: Repository<ChatSessionEntity>,
    @InjectRepository(ChatMessageEntity)
    private readonly messageRepository: Repository<ChatMessageEntity>,
  ) {}

  async generateRagResponse(dto: CreateChatMessageDto): Promise<RagResponse> {
    const query: string = dto.query as string;
    const sessionId: string | undefined = dto.sessionId as string | undefined;
    this.logger.log(`Received query: "${query}"`);

    const session = await this.findOrCreateSession(sessionId);
    // Получаем историю ДО обработки нового сообщения
    const history = await this.getHistory(session.id);

    // <<<--- НАЧАЛО КЛЮЧЕВЫХ ИЗМЕНЕНИЙ: QUERY REWRITING ---
    let queryForSearch = query;
    // Если в диалоге уже есть сообщения, переформулируем запрос
    if (history.length > 0) {
      this.logger.log('History detected. Rewriting query for context...');
      queryForSearch = await this.rewriteQueryWithHistory(query, history);
      this.logger.log(`Rewritten query for search: "${queryForSearch}"`);
    }
    // --- КОНЕЦ КЛЮЧЕВЫХ ИЗМЕНЕНИЙ --->>>

    // Сохраняем в базу ОРИГИНАЛЬНЫЙ запрос пользователя для точности логов
    await this.messageRepository.save({
      session: session,
      role: ChatMessageRole.USER,
      content: query,
    });

    // Используем ПЕРЕФОРМУЛИРОВАННЫЙ запрос для поиска релевантной информации
    const queryEmbedding =
      await this.embeddingsService.generateEmbedding(queryForSearch);
    // Увеличиваем количество чанков до 5 для более полного контекста
    const relevantChunks = await this.searchService.findRelevantChunks(
      queryEmbedding,
      5,
    );

    // Обновляем историю, чтобы она включала последнее сообщение пользователя
    const updatedHistory = [
      ...history,
      { role: ChatMessageRole.USER, content: query } as ChatMessageEntity,
    ];

    const llmResponse = await this.llmService.generateResponse(
      queryForSearch, // Передаем в LLM также переформулированный запрос
      relevantChunks,
      updatedHistory.map((h) => ({ role: h.role, content: h.content })),
    );

    await this.messageRepository.save({
      session: session,
      role: ChatMessageRole.ASSISTANT,
      content: llmResponse,
    });

    return {
      response: llmResponse,
      sessionId: session.id,
      sources: relevantChunks.map((c) => ({ content: c.content })),
    };
  }

  private async findOrCreateSession(
    sessionId?: string,
  ): Promise<ChatSessionEntity> {
    if (sessionId) {
      const session = await this.sessionRepository.findOneBy({ id: sessionId });
      if (session) return session;
    }
    return this.sessionRepository.save(new ChatSessionEntity());
  }

  /**
   * Извлекает историю сообщений для сессии в правильном хронологическом порядке.
   */
  private async getHistory(sessionId: string): Promise<ChatMessageEntity[]> {
    return this.messageRepository.find({
      where: { session: { id: sessionId } },
      order: { createdAt: 'ASC' }, // ASC, чтобы история была от старых к новым
      take: CHAT_CONFIG.TAKE,
    });
  }

  /**
   * Переформулирует запрос пользователя, используя историю диалога,
   * чтобы сделать его самостоятельным и понятным для векторного поиска.
   */
  private async rewriteQueryWithHistory(
    query: string,
    history: ChatMessageEntity[],
  ): Promise<string> {
    const formattedHistory = history
      .map(
        (msg) =>
          `${
            msg.role === ChatMessageRole.USER ? 'Пользователь' : 'Ассистент'
          }: ${msg.content}`,
      )
      .join('\n');

    const prompt = `Переформулируй финальный вопрос пользователя в самостоятельный, полноценный запрос, используя историю диалога. Ответь ТОЛЬКО переформулированным запросом и ничем больше.

История диалога:
${formattedHistory}

Финальный вопрос пользователя: ${query}

Самостоятельный запрос:`;

    try {
      // ПРИМЕЧАНИЕ: Здесь предполагается, что в LlmService есть или будет создан
      // простой метод для выполнения промпта без RAG-логики, например, `generateStandaloneResponse`.
      // Если его нет, можно временно использовать `generateResponse` с пустыми чанками.
      return await this.llmService.generateResponse(prompt, [], []);
    } catch (error) {
      this.logger.warn(
        'Query rewriting failed. Falling back to original query.',
        error,
      );
      // Если переформулировка не удалась, безопасно возвращаем исходный запрос
      return query;
    }
  }
}
