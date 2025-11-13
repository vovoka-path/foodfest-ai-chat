import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { DocumentEntity } from '../knowledge/entities/document.entity.js';
import { KnowledgeModule } from '../knowledge/knowledge.module.js';
import { ChunkingModule } from '../chunking/chunking.module.js';
import { EmbeddingsModule } from '../embeddings/embeddings.module.js';
import { IndexingProcessor } from './indexing.processor.js';
import { KnowledgeChunkEntity } from '../knowledge/entities/knowledge-chunk.entity.js';

@Module({
  imports: [
    // 1. Делаем очередь доступной в этом модуле
    BullModule.registerQueue({
      name: 'indexing-queue',
    }),
    // 2. Импортируем TypeOrm, чтобы можно было внедрять репозитории
    TypeOrmModule.forFeature([DocumentEntity, KnowledgeChunkEntity]),
    // 3. Импортируем модули, которые предоставляют нужные сервисы
    ChunkingModule,
    EmbeddingsModule,
    KnowledgeModule,
  ],
  providers: [IndexingProcessor],
  exports: [IndexingProcessor],
})
export class IndexingModule {}
