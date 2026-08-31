import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatThreadsService } from './chat-threads.service';
import { ChatMessagesService } from './chat-messages.service';

@Module({
  controllers: [ChatController],
  providers: [ChatGateway, ChatThreadsService, ChatMessagesService],
})
export class ChatModule {}