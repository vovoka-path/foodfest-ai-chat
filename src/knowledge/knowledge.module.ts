import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentEntity } from './entities/document.entity.js';
import { KnowledgeChunkEntity } from './entities/knowledge-chunk.entity.js';
import { KnowledgeService } from './knowledge.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentEntity, KnowledgeChunkEntity])],
  providers: [KnowledgeService],
  exports: [TypeOrmModule, KnowledgeService], // Экспортируем TypeOrmModule и сервис
})
export class KnowledgeModule {}
