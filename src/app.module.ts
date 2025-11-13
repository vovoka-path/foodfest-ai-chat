import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule, getDataSourceToken } from '@nestjs/typeorm';
import { ZodValidationPipe } from 'nestjs-zod';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DataSource } from 'typeorm';
// import pgvector from 'pgvector/pg';
import { dataSourceOptions } from './database/data-source.js';

import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { BullModule } from '@nestjs/bullmq';
import { getQueueToken } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

// Импорты для AdminJS
import AdminJS from 'adminjs';
import * as AdminJSTypeorm from '@adminjs/typeorm';
import { After, Before, ActionResponse } from 'adminjs';

// Импорты ваших модулей и сервисов
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ChatModule } from './chat/chat.module.js';
import { ChunkingModule } from './chunking/chunking.module.js';
import { DatabaseModule } from './database/database.module.js';
import { EmbeddingsModule } from './embeddings/embeddings.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { SearchModule } from './search/search.module.js';
import { DocumentsModule } from './documents/documents.module.js';
import { IndexingModule } from './indexing/indexing.module.js';
import { KnowledgeModule } from './knowledge/knowledge.module.js';
import { SanitizerModule } from './sanitizer/sanitizer.module.js';

// Импорты сущностей для TypeORM и AdminJS
import { DocumentEntity } from './knowledge/entities/document.entity.js';
import { KnowledgeChunkEntity } from './knowledge/entities/knowledge-chunk.entity.js';
// <-- 1. Импортируем наши новые сущности из единого файла
import {
  ChatSessionEntity,
  ChatMessageEntity,
} from './chat/entities/chat.entities.js';

// Функция аутентификации для админ-панели
const authenticate = async (email: string, password: string) => {
  // В реальном приложении здесь должна быть логика проверки по базе данных
  // и использование переменных окружения для учетных данных по умолчанию.
  const DEFAULT_ADMIN = {
    email: process.env.ADMIN_EMAIL || 'admin@food.com',
    password: process.env.ADMIN_PASSWORD || 'pass',
  };

  if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
    return Promise.resolve(DEFAULT_ADMIN);
  }
  return null;
};

@Module({
  imports: [
    // 1. Конфигурация AdminJS
    // Используем динамический импорт, так как AdminJS v7+ является ESM-only.
    import('@adminjs/nestjs').then(({ AdminModule }) =>
      AdminModule.createAdminAsync({
        // Явно указываем, что этот модуль зависит от TypeOrmModule.
        // Это гарантирует, что соединение с БД будет установлено до инициализации AdminJS.
        imports: [
          TypeOrmModule.forFeature([DocumentEntity, KnowledgeChunkEntity]),
          BullModule.registerQueue({ name: 'indexing-queue' }), // Делаем очередь доступной здесь
        ],

        // Внедряем (inject) провайдер DataSource в нашу фабрику.
        // NestJS не вызовет useFactory, пока dataSource не будет готов.
        inject: [getDataSourceToken(), getQueueToken('indexing-queue')],

        // Фабрика для создания конфигурации AdminJS.
        // Принимает готовый dataSource в качестве аргумента.
        useFactory: (dataSource: DataSource, indexingQueue: Queue) => {
          // Регистрируем адаптер, чтобы AdminJS "знал" о существовании @adminjs/typeorm.
          AdminJS.registerAdapter({
            Resource: AdminJSTypeorm.Resource,
            Database: AdminJSTypeorm.Database,
          });

          // BEFORE hook остается без изменений
          const beforeHook: Before = (request, context) => {
            if (request.method.toLowerCase() === 'post') {
              context.isPostRequest = true;
            }
            return request;
          };

          // AFTER hook теперь определяется прямо здесь
          const afterHook: After<ActionResponse> = async (
            response,
            request,
            context,
          ) => {
            // Добавляем проверку на context.record
            if (context.isPostRequest && context.record) {
              const record = context.record.params;
              console.log(
                `--- POST request detected. Adding job for documentId: ${record.id} ---`,
              );
              await indexingQueue.add('index-document', {
                documentId: record.id,
              });
              console.log(`--- JOB ADDED for documentId: ${record.id} ---`);
            }
            return response;
          };

          return {
            adminJsOptions: {
              rootPath: '/admin',

              // Явно передаем инициализированный dataSource.
              // AdminJS будет использовать его для автоматического обнаружения сущностей.
              // Это ключевой шаг для корректной работы.
              // databases: [dataSource],

              resources: [
                {
                  resource: DocumentEntity,
                  options: {
                    parent: { name: 'Knowledge Base', icon: 'Document' },
                    properties: {
                      content: { type: 'richtext' },
                      status: {
                        isVisible: {
                          list: true,
                          show: true,
                          edit: false,
                          filter: true,
                        },
                      },
                      id: { isVisible: { list: false, show: true } },
                      chunks: { isVisible: { list: false, show: true } },
                      // source: {
                      //   isVisible: {
                      //     list: true,
                      //     show: true,
                      //     edit: true,
                      //     new: false,
                      //   },
                      //   isDisabled: true,
                      // },
                    },
                    actions: {
                      new: {
                        // <<<--- ШАГ 2: Применяем оба хука
                        before: [beforeHook],
                        after: [afterHook],
                      },
                      edit: {
                        // <<<--- ШАГ 3: Применяем оба хука и здесь
                        before: [beforeHook],
                        after: [afterHook],
                      },
                    },
                  },
                },
                {
                  resource: KnowledgeChunkEntity,
                  options: {
                    parent: { name: 'Knowledge Base', icon: 'Database' },
                    properties: {
                      embedding: { isVisible: false },
                      documentId: { isVisible: { list: false, show: true } },
                    },
                  },
                },
              ],
              branding: {
                companyName: 'FOOD FEST AI CHAT',
                withMadeWithLove: false, // Убираем подпись "Made with AdminJS"
              },
            },
            // auth: {
            //   authenticate,
            //   cookieName: 'adminjs',
            //   cookiePassword: 'a-very-secret-and-long-password-for-cookies', // Лучше брать из .env
            // },
            // sessionOptions: {
            //   resave: true,
            //   saveUninitialized: true,
            //   secret: 'a-very-secret-and-long-password-for-session', // Лучше брать из .env
            // },
          };
        },
      }),
    ),

    // 2. Глобальные модули
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    EventEmitterModule.forRoot(),

    // 3. Конфигурация TypeORM
    TypeOrmModule.forRoot(dataSourceOptions),

    ServeStaticModule.forRoot({
      // Указываем путь к папке 'public'
      // join(process.cwd(), 'public') - это надежный способ получить путь к папке public
      rootPath: join(process.cwd(), 'public'),
    }),

    BullModule.forRootAsync({
      imports: [ConfigModule], // Делаем ConfigModule доступным
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
        },
      }),
      inject: [ConfigService],
    }),
    // Регистрируем нашу будущую очередь
    BullModule.registerQueue({
      name: 'indexing-queue',
    }),

    // 4. Модули вашего приложения
    SanitizerModule,
    DatabaseModule,
    EmbeddingsModule,
    ChunkingModule,
    SearchModule,
    ChatModule,
    NotificationsModule,
    DocumentsModule,
    IndexingModule,
    KnowledgeModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule {}
