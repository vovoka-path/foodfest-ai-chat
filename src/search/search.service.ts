// src/search/search.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { KnowledgeChunkEntity } from '../knowledge/entities/knowledge-chunk.entity.js';
// Импортируем pgvector для использования хелпера
import pgvector from 'pgvector';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findRelevantChunks(
    queryEmbedding: number[],
    topK = 5,
  ): Promise<KnowledgeChunkEntity[]> {
    this.logger.log(`Searching for ${topK} relevant chunks...`);

    const query = `
      SELECT *, (embedding <=> $1) as distance
      FROM "knowledge_chunks"
      ORDER BY distance ASC
      LIMIT $2
    `;

    /**
     * КЛЮЧЕВОЕ ИЗМЕНЕНИЕ:
     * Мы явно преобразуем массив в строку с помощью `pgvector.toSql()`.
     * Это гарантирует, что в базу данных будет отправлен правильный формат '[...]'.
     */
    const results = await this.dataSource.query(query, [
      pgvector.toSql(queryEmbedding),
      topK,
    ]);

    this.logger.log(`Found ${results.length} chunks.`);
    return results as KnowledgeChunkEntity[];
  }
}
