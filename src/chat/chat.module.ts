import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller.js';
import { ChatService } from './chat.service.js';
import { EmbeddingsModule } from '../embeddings/embeddings.module.js';
import { SearchModule } from '../search/search.module.js';
import { LlmModule } from '../llm/llm.module.js';
// ИЗМЕНЕНО: Импортируем все из одного нового файла
import {
  ChatSessionEntity,
  ChatMessageEntity,
} from './entities/chat.entities.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatSessionEntity, ChatMessageEntity]),
    EmbeddingsModule,
    SearchModule,
    LlmModule,
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
