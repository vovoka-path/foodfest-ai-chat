import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ChatService } from './chat.service.js';
import { CreateChatMessageDto } from './dto/create-chat-message.dto.js';
import { RagResponse } from './dto/rag-response.dto.js';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('message')
  @HttpCode(HttpStatus.OK)
  async createMessage(
    @Body() createChatMessageDto: CreateChatMessageDto,
  ): Promise<RagResponse> {
    return this.chatService.generateRagResponse(createChatMessageDto);
  }
}
