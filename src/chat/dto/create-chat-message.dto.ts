import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreateChatMessageSchema = z.object({
  query: z
    .string()
    .min(1, 'Query must not be empty')
    .max(500, 'Query must be 500 characters or less'),
  // sessionId теперь опциональное поле
  sessionId: z.string().uuid().optional(),
});

export class CreateChatMessageDto extends createZodDto(
  CreateChatMessageSchema,
) {}
