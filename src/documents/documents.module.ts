import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller.js';
import { DocumentsService } from './documents.service.js';
import { KnowledgeModule } from '../knowledge/knowledge.module.js';

@Module({
  // IndexingModule полностью удален из импортов!
  imports: [KnowledgeModule],
  controllers: [DocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule {}
