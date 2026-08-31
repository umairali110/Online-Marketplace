import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ChatThreadsService } from './chat-threads.service';
import { ChatMessagesService } from './chat-messages.service';
import { CreateThreadDto } from './dto/create-thread.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { Throttle } from '@nestjs/throttler';

@UseGuards(JwtAuthGuard)
@Controller('chat/threads')
export class ChatController {
  constructor(
    private threadsService: ChatThreadsService,
    private messagesService: ChatMessagesService,
  ) {}

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateThreadDto) {
    return this.threadsService.getOrCreate(userId, dto.otherUserId, dto.jobPostId);
  }

  @Get('mine')
  listMine(@CurrentUser('id') userId: string) {
    return this.threadsService.listMine(userId);
  }

  @Get(':id/messages')
  async listMessages(@CurrentUser('id') userId: string, @Param('id') id: string) {
    await this.threadsService.ensureParticipant(userId, id);
    return this.messagesService.list(id);
  }

    @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Post(':id/messages')
  async sendMessage(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: SendMessageDto) {
    await this.threadsService.ensureParticipant(userId, id);
    return this.messagesService.send(id, userId, dto.content);
  }
}