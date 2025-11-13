import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as slugifyModule from 'slugify';
import { KnowledgeChunkEntity } from './entities/knowledge-chunk.entity.js';
import { DocumentEntity } from './entities/document.entity.js';
import { CreateDocumentData, UpdateDocumentData } from './dto/document.dto.js';

// Временно отключаем типизацию, чтобы получить доступ к реальному экспорту
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
const slugify = (slugifyModule as any).default || slugifyModule;

@Injectable()
export class KnowledgeService {
  constructor(
    @InjectRepository(DocumentEntity)
    private readonly documentRepository: Repository<DocumentEntity>,
    @InjectRepository(KnowledgeChunkEntity)
    private readonly chunkRepository: Repository<KnowledgeChunkEntity>,
  ) {}

  async createDocument(data: CreateDocumentData): Promise<DocumentEntity> {
    const newDoc = this.documentRepository.create(data);

    // --- НАЧАЛО НОВОЙ ЛОГИКИ ---
    // Генерируем source, только если он не был предоставлен явно
    // eslint-disable-next-line no-constant-condition
    // if (newDoc.source) {
    //   // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    //   const baseSlug = slugify(newDoc.title, {
    //     lower: true,
    //     strict: true,
    //     locale: 'ru',
    //   });

    //   // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    //   let finalSlug = baseSlug;
    //   let counter = 2;

    //   // Проверяем уникальность слага и добавляем суффикс при необходимости
    //   // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    //   while (await this.documentRepository.findOneBy({ source: finalSlug })) {
    //     finalSlug = `${baseSlug}-${counter}`;
    //     counter++;
    //   }
    //   // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    //   newDoc.source = finalSlug;
    // }
    // --- КОНЕЦ НОВОЙ ЛОГИКИ ---

    return this.documentRepository.save(newDoc);
  }

  findAllDocuments(): Promise<DocumentEntity[]> {
    return this.documentRepository.find({ order: { createdAt: 'DESC' } });
  }

  findDocumentById(id: string): Promise<DocumentEntity | null> {
    return this.documentRepository.findOneBy({ id });
  }

  async updateDocument(
    id: string,
    data: UpdateDocumentData,
  ): Promise<DocumentEntity> {
    // При обновлении мы не меняем source, чтобы не ломать возможные ссылки.
    // Поэтому здесь дополнительная логика не нужна.
    const doc = await this.documentRepository.findOneByOrFail({ id });
    // Убедимся, что source не будет случайно затерт, если его нет в data
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { ...updateData } = data;
    // const { source, ...updateData } = data;
    Object.assign(doc, updateData);
    return this.documentRepository.save(doc);
  }

  async removeDocument(id: string): Promise<void> {
    const result = await this.documentRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }
  }

  async replaceChunks(
    documentId: string,
    chunks: Partial<KnowledgeChunkEntity>[],
  ): Promise<void> {
    await this.chunkRepository.manager.transaction(async (tm) => {
      await tm.delete(KnowledgeChunkEntity, { documentId });
      if (chunks.length > 0) {
        const newChunks = this.chunkRepository.create(
          chunks.map((c) => ({ ...c, documentId })),
        );
        await tm.save(newChunks);
      }
    });
  }
}
