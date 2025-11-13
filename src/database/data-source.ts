// src/database/data-source.ts

import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';
// import { fileURLToPath } from 'url';
// import { dirname, join } from 'path';

import { DocumentEntity } from '../knowledge/entities/document.entity.js';
import { KnowledgeChunkEntity } from '../knowledge/entities/knowledge-chunk.entity.js';
import {
  ChatSessionEntity,
  ChatMessageEntity,
} from '../chat/entities/chat.entities.js';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// Это просто декларативный объект с опциями.
// Его будет использовать и AppModule, и CLI-инструменты TypeORM.
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [
    DocumentEntity,
    KnowledgeChunkEntity,
    ChatSessionEntity,
    ChatMessageEntity,
  ],
  synchronize: true, // Для разработки OK.
};

// Этот экспорт нужен для CLI TypeORM.
export const dataSource = new DataSource(dataSourceOptions);
