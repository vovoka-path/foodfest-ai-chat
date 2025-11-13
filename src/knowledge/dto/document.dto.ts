import { z } from 'zod';
import { DocumentStatus } from '../entities/document-status.enum.js';

// Это наш новый "единый источник правды" о структуре документа.
// Он находится в самом нижнем слое приложения.
export const DocumentSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long'),
  // source: z
  //   // 1. Сначала мы принимаем практически любое значение.
  //   .any()
  //   // 2. Затем мы используем .transform() для отладки и преобразования.
  //   // Этот код выполнится ВНУТРИ ZodValidationPipe.
  //   .transform((val, ctx) => {
  //     // ЭТОТ LOG ТЕПЕРЬ ОБЯЗАН ПОЯВИТЬСЯ В КОНСОЛИ
  //     console.log(
  //       `[Zod Transform] Received source value:`,
  //       val,
  //       `(type: ${typeof val})`,
  //     );

  //     // 3. Наша логика: если значение - null, пустая строка или undefined,
  //     // мы преобразуем его в undefined, чтобы наша логика в сервисе сработала.
  //     if (val === null || val === '' || val === undefined) {
  //       return undefined;
  //     }

  //     // 4. Если это непустая строка, мы ее возвращаем для дальнейшей валидации.
  //     if (typeof val === 'string') {
  //       return val;
  //     }

  //     // 5. Если пришло что-то иное (число, объект), мы сообщаем Zod о ошибке.
  //     ctx.addIssue({
  //       code: z.ZodIssueCode.invalid_type,
  //       expected: 'string',
  //       received: typeof val,
  //     });
  //     return z.NEVER;
  //   })
  //   // 6. И только ПОСЛЕ трансформации мы применяем финальные правила.
  //   // Теперь сюда придет либо строка, либо undefined.
  //   .pipe(z.string().min(3).optional()),
  // // --- КОНЕЦ ОКОНЧАТЕЛЬНОГО ИСПРАВЛЕНИЯ С ОТЛАДКОЙ ---
  // persona: z.string().min(3, 'Persona must be at least 3 characters long'),
  content: z.string().min(10, 'Content must be at least 10 characters long'),
});

// Schema for updating a document with status
export const DocumentUpdateSchema = DocumentSchema.extend({
  status: z.nativeEnum(DocumentStatus).optional(),
}).partial();

// Выводим и экспортируем тип TypeScript из схемы
export type DocumentData = z.infer<typeof DocumentSchema>;
export type DocumentUpdateData = z.infer<typeof DocumentUpdateSchema>;

// Type for creating a new document (same as DocumentData)
export type CreateDocumentData = DocumentData;

// Type for updating a document (partial version of DocumentData with optional status)
export type UpdateDocumentData = DocumentUpdateData;
