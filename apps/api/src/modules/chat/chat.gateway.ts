import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL, credentials: true },
})
export class ChatGateway {
  @WebSocketServer()
  server!: Server;

  @SubscribeMessage('join-thread')
  handleJoin(@MessageBody() data: { threadId: string }, @ConnectedSocket() client: Socket) {
    client.join(`chat:${data.threadId}`);
  }

  emitMessage(threadId: string, message: any) {
    this.server.to(`chat:${threadId}`).emit('chat:message', message);
  }
}