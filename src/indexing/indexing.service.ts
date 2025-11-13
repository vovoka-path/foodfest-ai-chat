import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { KnowledgeService } from '../knowledge/knowledge.service.js';
import { ChunkingService } from '../chunking/chunking.service.js';
import { EmbeddingsService } from '../embeddings/embeddings.service.js';
import { DocumentStatus } from '../knowledge/entities/document.entity.js';
import { DOCUMENT_SAVED_EVENT } from '../documents/documents.service.js';
import { KnowledgeChunkEntity } from '../knowledge/entities/knowledge-chunk.entity.js';
// import { DocumentUpdateData } from '../knowledge/dto/document.dto.js';
import pgvector from 'pgvector';

@Injectable()
export class IndexingService {
  private readonly logger = new Logger(IndexingService.name);

  constructor(
    private readonly knowledgeService: KnowledgeService,
    private readonly chunkingService: ChunkingService,
    private readonly embeddingsService: EmbeddingsService,
  ) {}

  @OnEvent(DOCUMENT_SAVED_EVENT)
  async handleDocumentSavedEvent(documentId: string) {
    this.logger.log(`Received document.saved event for ID: ${documentId}`);
    await this.indexDocument(documentId);
  }

  private async indexDocument(documentId: string): Promise<void> {
    this.logger.log(`Starting indexing for document ${documentId}`);
    const document = await this.knowledgeService.findDocumentById(documentId);

    if (!document) {
      this.logger.error(
        `Document with id ${documentId} not found for indexing.`,
      );
      return;
    }

    try {
      // Это теперь валидно, так как updateDocument принимает частичный объект
      await this.knowledgeService.updateDocument(documentId, {
        status: DocumentStatus.INDEXING,
      });

      const chunks = await this.chunkingService.chunkFile(
        document.content,
        // document.source,
        // document.persona,
      );
      this.logger.log(
        `Created ${chunks.length} chunks for document ${documentId}`,
      );

      const chunksToSave: Partial<KnowledgeChunkEntity>[] = [];
      for (const chunk of chunks) {
        const embedding = await this.embeddingsService.generateEmbedding(
          chunk.pageContent,
        );
        chunksToSave.push({
          content: chunk.pageContent,
          embedding: pgvector.toSql(embedding),
          documentId: document.id,
        });
      }

      await this.knowledgeService.replaceChunks(documentId, chunksToSave);

      this.logger.log(`Saved ${chunksToSave.length} new chunks to DB`);
      await this.knowledgeService.updateDocument(documentId, {
        status: DocumentStatus.INDEXED,
      });
      this.logger.log(`Successfully indexed document ${documentId}`);
    } catch (error: unknown) {
      // Типизируем ошибку
      const errorMessage = error instanceof Error ? error.stack : String(error);
      this.logger.error(`Failed to index document ${documentId}`, errorMessage);
      await this.knowledgeService.updateDocument(documentId, {
        status: DocumentStatus.FAILED,
      });
    }
  }
}
