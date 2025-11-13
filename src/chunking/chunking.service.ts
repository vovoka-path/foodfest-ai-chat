// src/chunking/chunking.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { Document } from 'langchain/document';
import { SanitizerService } from '../sanitizer/sanitizer.service.js';

@Injectable()
export class ChunkingService {
  private readonly logger = new Logger(ChunkingService.name);

  constructor(private readonly sanitizerService: SanitizerService) {}

  async chunkFile(htmlContent: string): Promise<Document[]> {
    this.logger.log(
      'Starting robust chunking pipeline: Sanitize -> Hierarchical Split',
    );

    // ЭТАП 1: Санитизация HTML в чистый Markdown.
    const markdownContent = this.sanitizerService.htmlToMarkdown(htmlContent);
    this.logger.log(
      'Step 1 complete: Sanitized HTML to clean Markdown content.',
    );

    // ЭТАП 2: Иерархическое разделение.
    // Сначала делим на крупные секции по заголовкам (если они есть).
    const headerSeparator = /(?=^#{1,6} )/m;
    const initialSections = markdownContent
      .split(headerSeparator)
      .filter((section) => section.trim() !== '');

    const finalChunks: string[] = [];

    // Теперь проходим по каждой секции и делим ее на абзацы.
    // Это гарантирует, что даже если заголовков нет, текст все равно будет разбит.
    for (const section of initialSections) {
      // Разделитель для абзацев - два или более переноса строки.
      const paragraphSeparator = /\n{2,}/;
      const paragraphs = section
        .split(paragraphSeparator)
        .filter((p) => p.trim() !== '');

      // Добавляем полученные абзацы в финальный массив чанков.
      finalChunks.push(...paragraphs);
    }

    this.logger.log(
      `Step 2 complete: Split content into ${finalChunks.length} final chunks.`,
    );

    // Преобразуем массив строковых чанков в ожидаемый формат Document[].
    return finalChunks.map(
      (chunk) =>
        new Document({
          pageContent: chunk.trim(),
          metadata: {},
        }),
    );
  }
}
