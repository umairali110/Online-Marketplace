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
export class TrackingGateway {
  @WebSocketServer()
  server!: Server;

  // Client joins a room named after the orderId right after opening the tracking page.
  @SubscribeMessage('join')
  handleJoin(@MessageBody() data: { orderId: string }, @ConnectedSocket() client: Socket) {
    client.join(`order:${data.orderId}`);
  }

  emitTrackingUpdate(orderId: string, subOrderId: string, trackingStatus: string) {
    this.server.to(`order:${orderId}`).emit('tracking:update', { subOrderId, trackingStatus });
  }
}