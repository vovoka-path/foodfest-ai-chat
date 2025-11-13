/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DocumentEntity } from '../knowledge/entities/document.entity.js';
import { CreateDocumentDto } from './dto/create-document.dto.js';
import { KnowledgeService } from '../knowledge/knowledge.service.js';
import { CreateDocumentData } from '../knowledge/dto/document.dto.js';

export const DOCUMENT_SAVED_EVENT = 'document.saved';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly knowledgeService: KnowledgeService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateDocumentDto): Promise<DocumentEntity> {
    // Extract the data from the DTO to ensure type compatibility
    const { title, source, persona, content } = dto;
    console.log('# source = ', source, '# persona = ', persona);

    const documentData: CreateDocumentData = {
      title,
      // source: source || 'default',
      // persona,
      content,
    };
    const savedDoc = await this.knowledgeService.createDocument(documentData);
    this.eventEmitter.emit(DOCUMENT_SAVED_EVENT, savedDoc.id);
    return savedDoc;
  }

  findAll(): Promise<DocumentEntity[]> {
    return this.knowledgeService.findAllDocuments();
  }

  async findOne(id: string): Promise<DocumentEntity> {
    const doc = await this.knowledgeService.findDocumentById(id);
    if (!doc) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }
    return doc;
  }

  async update(id: string, dto: CreateDocumentDto): Promise<DocumentEntity> {
    // То же самое для обновления
    const updatedDoc = await this.knowledgeService.updateDocument(id, dto);
    this.eventEmitter.emit(DOCUMENT_SAVED_EVENT, updatedDoc.id);
    return updatedDoc;
  }

  async remove(id: string): Promise<void> {
    await this.knowledgeService.removeDocument(id);
  }
}
