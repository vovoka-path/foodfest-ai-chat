import { createZodDto } from 'nestjs-zod';
// ИСПРАВЛЕНО: импортируем DocumentSchema, а не DocumentContentSchema
import { DocumentSchema } from '../../knowledge/dto/document.dto.js';

export class CreateDocumentDto extends createZodDto(DocumentSchema) {}
