import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Server, Socket } from 'socket.io';
import { User } from '../entities/user.entity';
import { JwtPayload } from '../auth/auth.service';
import { ChatService } from './chat.service';

type SocketUser = {
  id: string;
  role: string;
  firstName: string;
  lastName: string;
  email: string;
};

@WebSocketGateway({
  cors: { origin: true, credentials: true },
})
export class ChatGateway implements OnGatewayInit, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  /** Authenticate during handshake so client.data.user exists before any emit (avoids join race). */
  afterInit(server: Server) {
    server.use(async (socket: Socket, next: (err?: Error) => void) => {
      try {
        const raw =
          (socket.handshake.auth && (socket.handshake.auth as { token?: string }).token) ||
          (typeof socket.handshake.query?.token === 'string' ? socket.handshake.query.token : null);
        if (!raw) {
          this.logger.warn('Socket handshake rejected: no token');
          return next(new Error('Unauthorized'));
        }
        const payload = this.jwtService.verify<JwtPayload>(raw);
        const user = await this.userRepo.findOne({ where: { id: payload.sub } });
        if (!user || !user.isActive) {
          return next(new Error('Unauthorized'));
        }
        const su: SocketUser = {
          id: user.id,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        };
        (socket.data as { user?: SocketUser }).user = su;
        next();
      } catch (e) {
        this.logger.warn(`Socket handshake JWT failed: ${(e as Error).message}`);
        next(new Error('Unauthorized'));
      }
    });
  }

  constructor(
    private readonly jwtService: JwtService,
    private readonly chatService: ChatService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  private roomName(groupId: string) {
    return `group:${groupId}`;
  }

  handleDisconnect(client: Socket) {
    const joined = (client.data as { joinedRooms?: string[] }).joinedRooms || [];
    for (const r of joined) {
      client.leave(r);
    }
  }

  private getUser(client: Socket): SocketUser | null {
    return (client.data as { user?: SocketUser }).user || null;
  }

  private trackJoin(client: Socket, room: string) {
    const data = client.data as { joinedRooms?: string[] };
    if (!data.joinedRooms) data.joinedRooms = [];
    if (!data.joinedRooms.includes(room)) data.joinedRooms.push(room);
  }

  @SubscribeMessage('chat:join')
  async onJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { groupId?: string },
  ) {
    const u = this.getUser(client);
    if (!u || !body?.groupId) return { ok: false, error: 'Unauthorized' };

    const userEntity = await this.userRepo.findOne({ where: { id: u.id } });
    if (!userEntity) return { ok: false, error: 'Unauthorized' };

    const allowed = await this.chatService.canAccessGroup(userEntity, body.groupId);
    if (!allowed) return { ok: false, error: 'Forbidden' };

    const room = this.roomName(body.groupId);
    await client.join(room);
    this.trackJoin(client, room);

    const history = await this.chatService.getRecentMessages(body.groupId, 80);
    return { ok: true, history };
  }

  @SubscribeMessage('chat:leave')
  async onLeave(@ConnectedSocket() client: Socket, @MessageBody() body: { groupId?: string }) {
    if (!body?.groupId) return { ok: false };
    await client.leave(this.roomName(body.groupId));
    return { ok: true };
  }

  @SubscribeMessage('chat:message')
  async onMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { groupId?: string; text?: string },
  ) {
    const u = this.getUser(client);
    if (!u || !body?.groupId) return { ok: false, error: 'Unauthorized' };

    const userEntity = await this.userRepo.findOne({ where: { id: u.id } });
    if (!userEntity) return { ok: false, error: 'Unauthorized' };

    try {
      const msg = await this.chatService.saveMessage(userEntity, body.groupId, body.text || '');
      this.server.to(this.roomName(body.groupId)).emit('chat:message', msg);
      return { ok: true, message: msg };
    } catch (e) {
      const err = e as Error;
      return { ok: false, error: err.message || 'Failed' };
    }
  }

  @SubscribeMessage('chat:typing')
  async onTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { groupId?: string; typing?: boolean },
  ) {
    const u = this.getUser(client);
    if (!u || !body?.groupId) return { ok: false };

    const userEntity = await this.userRepo.findOne({ where: { id: u.id } });
    if (!userEntity) return { ok: false };

    const allowed = await this.chatService.canAccessGroup(userEntity, body.groupId);
    if (!allowed) return { ok: false, error: 'Forbidden' };

    const displayName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email;
    client.to(this.roomName(body.groupId)).emit('chat:typing', {
      groupId: body.groupId,
      userId: u.id,
      displayName,
      typing: Boolean(body.typing),
    });
    return { ok: true };
  }
}
