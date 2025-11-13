import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // <-- 1. Импортируем TypeOrmModule
import { SearchService } from './search.service.js';
// <-- 2. Импортируем сущность, репозиторий которой нам нужен
import { KnowledgeChunkEntity } from '../knowledge/entities/knowledge-chunk.entity.js';

@Module({
  imports: [
    // <-- 3. Регистрируем сущность в этом модуле.
    // Это создаст провайдер 'KnowledgeChunkEntityRepository'
    // и сделает его доступным для инъекции внутри SearchModule.
    TypeOrmModule.forFeature([KnowledgeChunkEntity]),
  ],
  providers: [SearchService],
  // <-- 4. (Best Practice) Убедитесь, что сервис экспортируется,
  // чтобы другие модули (например, ChatModule) могли его использовать.
  exports: [SearchService],
})
export class SearchModule {}
