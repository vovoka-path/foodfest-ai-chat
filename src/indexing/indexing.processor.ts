import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  DocumentEntity,
  DocumentStatus,
} from '../knowledge/entities/document.entity.js';
import { KnowledgeChunkEntity } from '../knowledge/entities/knowledge-chunk.entity.js';
import { ChunkingService } from '../chunking/chunking.service.js';
import { EmbeddingsService } from '../embeddings/embeddings.service.js';
import { Logger } from '@nestjs/common';
import pgvector from 'pgvector';

@Processor('indexing-queue')
export class IndexingProcessor extends WorkerHost {
  private readonly logger = new Logger(IndexingProcessor.name);

  constructor(
    @InjectRepository(DocumentEntity)
    private readonly documentRepository: Repository<DocumentEntity>,
    @InjectRepository(KnowledgeChunkEntity)
    private readonly chunkRepository: Repository<KnowledgeChunkEntity>,
    private readonly chunkingService: ChunkingService,
    private readonly embeddingsService: EmbeddingsService,
  ) {
    super();
    this.logger.log('IndexingProcessor has been initialized.');
  }

  async process(job: Job<{ documentId: string }>) {
    const { documentId } = job.data;
    this.logger.log(`Processing job '${job.name}' for document: ${documentId}`);

    const document = await this.documentRepository.findOneBy({
      id: documentId,
    });
    if (!document) {
      this.logger.error(
        `Document with ID ${documentId} not found. Failing job.`,
      );
      throw new Error(`Document with ID ${documentId} not found.`);
    }

    try {
      await this.documentRepository.update(documentId, {
        status: DocumentStatus.INDEXING_IN_PROGRESS,
      });

      this.logger.log(`[${documentId}] Deleting old chunks...`);
      await this.chunkRepository.delete({ document: { id: documentId } });

      this.logger.log(`[${documentId}] Chunking content...`);
      const langchainDocuments = await this.chunkingService.chunkFile(
        document.content,
      );

      this.logger.log(
        `[${documentId}] Processing ${langchainDocuments.length} chunks with two-pass strategy...`,
      );

      const chunkEntities: KnowledgeChunkEntity[] = [];

      for (const doc of langchainDocuments) {
        const cleanContent = doc.pageContent;
        const contentForEmbedding = `Источник: "${document.title}"\n\nСодержимое: ${cleanContent}`;
        const embeddingArray =
          await this.embeddingsService.generateEmbedding(contentForEmbedding);

        const chunkEntity = new KnowledgeChunkEntity();
        chunkEntity.content = cleanContent;
        chunkEntity.document = document;

        // <<<--- ВОЗВРАЩАЕМ БЕЗОПАСНУЮ ЛОГИКУ ---
        // Преобразуем number[] в строку, чтобы соответствовать типу в KnowledgeChunkEntity.
        // Это предотвращает ошибку TypeScript и каскадные изменения.
        chunkEntity.embedding = pgvector.toSql(embeddingArray);

        chunkEntities.push(chunkEntity);
      }

      this.logger.log(
        `[${documentId}] Saving ${chunkEntities.length} new chunks to the database...`,
      );
      await this.chunkRepository.save(chunkEntities);

      await this.documentRepository.update(documentId, {
        status: DocumentStatus.INDEXED,
      });

      this.logger.log(`Successfully indexed document: ${documentId}`);
    } catch (error) {
      // <<<--- ИСПРАВЛЕНИЕ ESLINT ОШИБКИ ---
      const errorMessage = error instanceof Error ? error.stack : String(error);
      this.logger.error(`Failed to index document ${documentId}`, errorMessage);
      // --- КОНЕЦ ИСПРАВЛЕНИЯ --->>>
      await this.documentRepository.update(documentId, {
        status: DocumentStatus.INDEXING_FAILED,
      });
      throw error;
    }
  }
}
