import { Inject, Injectable, Logger } from '@nestjs/common';
import { Kysely, sql } from 'kysely';
import { KYSLEY_INSTANCE } from '../database/database.constants.js';
import { Database } from '../database/database.provider.js';
import { EmbeddingsService } from '../embeddings/embeddings.service.js';

export interface SearchResult {
  content: string;
  source: string;
  similarity: number;
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    @Inject(KYSLEY_INSTANCE) private readonly db: Kysely<Database>,
    private readonly embeddingsService: EmbeddingsService,
  ) {}

  /**
   * Ищет релевантные чанки в базе знаний.
   * @param query - Поисковый запрос пользователя.
   * @param limit - Максимальное количество результатов.
   * @returns Массив релевантных чанков с их схожестью.
   */
  async search(query: string, limit = 5): Promise<SearchResult[]> {
    this.logger.log(`Starting global search for query: "${query}"`);

    // 1. Создаем вектор для поискового запроса
    const queryEmbedding =
      await this.embeddingsService.generateEmbedding(query);
    const queryVector = `[${queryEmbedding.join(',')}]`;

    // 2. Выполняем поиск по всей таблице, используя косинусное расстояние
    const results = await this.db
      .selectFrom('chunks')
      .select([
        'content',
        'source',
        // Вычисляем косинусное сходство (1 - косинусное расстояние)
        sql<number>`1 - (embedding <=> ${sql.val(queryVector)})`.as(
          'similarity',
        ),
      ])
      // Строка .where('persona', '=', persona) была удалена
      .orderBy('similarity', 'desc')
      .limit(limit)
      .execute();

    this.logger.log(`Found ${results.length} relevant chunks.`);

    return results;
  }
}
