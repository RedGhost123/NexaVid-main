import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    WebSocketServer,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface SessionUser {
    userId: string;
    role: 'owner' | 'editor' | 'viewer';
}

interface EditLock {
    userId: string;
    lockedBy: string;
    timestamp: number;
}

@WebSocketGateway({ cors: true })
export class CollaborationGateway {
    @WebSocketServer()
    server: Server;

    private sessions: Record<string, SessionUser[]> = {}; // Store users in sessions
    private editLocks: Record<string, EditLock> = {}; // Track locked edits
    private peerConnections: Map<string, Map<string, RTCPeerConnection>> = new Map();


    @SubscribeMessage('joinSession')
    handleJoin(
        @MessageBody() { sessionId, userId, role }: { sessionId: string; userId: string; role: 'owner' | 'editor' | 'viewer' },
        @ConnectedSocket() client: Socket,
    ) {
        if (!this.sessions[sessionId]) {
            this.sessions[sessionId] = [];
        }

        this.sessions[sessionId].push({ userId, role });
        client.join(sessionId);

        this.server.to(sessionId).emit('userJoined', { userId, role });
    }

    @SubscribeMessage('requestEditLock')
    handleEditLock(
        @MessageBody() { sessionId, userId, timestamp }: { sessionId: string; userId: string; timestamp: number },
    ) {
        if (this.editLocks[sessionId]) {
            return;
        }

        this.editLocks[sessionId] = { userId, lockedBy: userId, timestamp };
        this.server.to(sessionId).emit('editLocked', { userId, timestamp });
    }

    @SubscribeMessage('releaseEditLock')
    handleReleaseLock(@MessageBody() { sessionId, userId }: { sessionId: string; userId: string }) {
        if (this.editLocks[sessionId]?.lockedBy === userId) {
            delete this.editLocks[sessionId];
            this.server.to(sessionId).emit('editUnlocked', { userId });
        }
    }

    @SubscribeMessage('editAction')
    handleEdit(
        @MessageBody() { sessionId, userId, action, data }: { sessionId: string; userId: string; action: string; data: any },
    ) {
        if (this.editLocks[sessionId]?.lockedBy !== userId) {
            return;
        }

        this.server.to(sessionId).emit('editUpdate', { userId, action, data });
    }

    @SubscribeMessage('sendMessage')
    handleMessage(
        @MessageBody() { sessionId, userId, message }: { sessionId: string; userId: string; message: string },
    ) {
        this.server.to(sessionId).emit('newMessage', { userId, message, timestamp: new Date().toISOString() });
    }
    @SubscribeMessage('callUser')
    handleCallUser(
        @MessageBody() { to, signalData, from }: { to: string; signalData: any; from: string },
    ) {
        this.server.to(to).emit('callIncoming', { signal: signalData, from });
    }

    @SubscribeMessage('answerCall')
    handleAnswerCall(
        @MessageBody() { to, signal }: { to: string; signal: any },
    ) {
        this.server.to(to).emit('callAccepted', { signal });
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
      const fileUrl = await this.uploadService.uploadToFirebase(file);
      return { fileUrl };
    }
    

    @WebSocketGateway({ cors: true })
export class PresenceGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private onlineUsers = new Map<string, string>(); // userId -> socketId

  handleConnection(client: Socket, ...args: any[]) {
    const userId = client.handshake.query.userId;
    if (userId) {
      this.onlineUsers.set(userId, client.id);
      this.server.emit('updateUserPresence', Array.from(this.onlineUsers.keys()));
    }
  }

  handleDisconnect(client: Socket) {
    const userId = [...this.onlineUsers.entries()].find(([_, id]) => id === client.id)?.[0];
    if (userId) {
      this.onlineUsers.delete(userId);
      this.server.emit('updateUserPresence', Array.from(this.onlineUsers.keys()));
    }
  }
}

// src/call/call.gateway.ts
import {
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayInit,
    WebSocketServer,
    MessageBody,
    ConnectedSocket,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { CallService } from './call.service';
  import { CallSignalDto } from '../dto/call.dto';
  
  @WebSocketGateway({ cors: true })
  export class CallGateway implements OnGatewayInit {
    @WebSocketServer() server: Server;
  
    constructor(private readonly callService: CallService) {}
  
    afterInit() {
      console.log('Call Gateway Initialized');
    }
  
    @SubscribeMessage('call:signal')
    async handleSignal(
      @MessageBody() data: CallSignalDto,
      @ConnectedSocket() client: Socket,
    ) {
      const { receiverId, type, data: signalData } = data;
      const payload = {
        type,
        senderId: client.id,
        data: signalData,
      };
  
      await this.callService.sendSignal(receiverId, payload);
    }
  
    @SubscribeMessage('call:end')
    async handleEndCall(
      @MessageBody() { receiverId }: { receiverId: string },
    ) {
      await this.callService.endCall(receiverId);
    }
  }
  
}
import { 
    SubscribeMessage, WebSocketGateway, WebSocketServer, 
    OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect 
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { CollaborationService } from '../services/collaboration.service';
  
  @WebSocketGateway({ cors: true })
  export class CollaborationGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    
    @WebSocketServer() server: Server;
  
    constructor(private readonly collaborationService: CollaborationService) {}
  
    // New user joins editing session
    @SubscribeMessage('joinSession')
    async handleJoinSession(client: Socket, payload: { sessionId: string, userId: string }) {
      client.join(payload.sessionId);
      this.server.to(payload.sessionId).emit('userJoined', payload.userId);
    }
  
    // Handle real-time editing actions
    @SubscribeMessage('editAction')
    async handleEditAction(client: Socket, payload: { sessionId: string, action: string, data: any }) {
      // Save edit action to Firestore or PostgreSQL
      await this.collaborationService.saveEditAction(payload.sessionId, payload.action, payload.data);
      
      // Broadcast changes to all clients except sender
      client.to(payload.sessionId).emit('editUpdate', payload);
    }
  
    // User leaves session
    @SubscribeMessage('leaveSession')
    async handleLeaveSession(client: Socket, payload: { sessionId: string, userId: string }) {
      client.leave(payload.sessionId);
      this.server.to(payload.sessionId).emit('userLeft', payload.userId);
    }
  
    afterInit(server: Server) {
      console.log('WebSocket Initialized');
    }
  
    handleConnection(client: Socket) {
      console.log(`Client connected: ${client.id}`);
    }
  
    handleDisconnect(client: Socket) {
      console.log(`Client disconnected: ${client.id}`);
    }
  
    @SubscribeMessage('cursorMove')
  handleCursorMove(
    @MessageBody() { sessionId, userId, position }: { sessionId: string; userId: string; position: { x: number; y: number } },
  ) {
    this.server.to(sessionId).emit('cursorUpdate', { userId, position });
  }
  interface EditHistory {
    sessionId: string;
    history: any[];
    currentIndex: number;
  }
  
  private editHistories: Record<string, EditHistory> = {};
  
  @SubscribeMessage('editAction')
  handleEdit(
    @MessageBody() { sessionId, userId, action, data }: { sessionId: string; userId: string; action: string; data: any },
  ) {
    if (!this.editHistories[sessionId]) {
      this.editHistories[sessionId] = { sessionId, history: [], currentIndex: -1 };
    }
  
    this.editHistories[sessionId].history.push({ userId, action, data });
    this.editHistories[sessionId].currentIndex++;
    
    this.server.to(sessionId).emit('editUpdate', { userId, action, data });
  }
  
  @SubscribeMessage('undoEdit')
  handleUndo(@MessageBody() { sessionId }: { sessionId: string }) {
    if (!this.editHistories[sessionId] || this.editHistories[sessionId].currentIndex < 0) return;
  
    this.editHistories[sessionId].currentIndex--;
    const edit = this.editHistories[sessionId].history[this.editHistories[sessionId].currentIndex];
  
    this.server.to(sessionId).emit('editUndo', edit);
  }
  
  @SubscribeMessage('redoEdit')
  handleRedo(@MessageBody() { sessionId }: { sessionId: string }) {
    if (!this.editHistories[sessionId]) return;
  
    const nextIndex = this.editHistories[sessionId].currentIndex + 1;
    if (nextIndex >= this.editHistories[sessionId].history.length) return;
  
    this.editHistories[sessionId].currentIndex = nextIndex;
    const edit = this.editHistories[sessionId].history[nextIndex];
  
    this.server.to(sessionId).emit('editRedo', edit);
  }
  
  
  import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
  } from '@nestjs/websockets';
  import { Socket } from 'socket.io';
  import { CallService } from './call.service';
  
  @WebSocketGateway({
    cors: {
      origin: '*', // Replace with frontend URL in production
    },
  })
  export class CallGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(private readonly callService: CallService) {}
  
    handleConnection(client: Socket) {
      console.log(`Client connected: ${client.id}`);
    }
  
    handleDisconnect(client: Socket) {
      console.log(`Client disconnected: ${client.id}`);
    }
  
    @SubscribeMessage('joinRoom')
    handleJoinRoom(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
      client.join(data.roomId);
      client.to(data.roomId).emit('userJoined', data.user);
    }
  
    @SubscribeMessage('offer')
    handleOffer(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
      this.callService.saveOffer(data.roomId, data.sdp);
      client.to(data.roomId).emit('offer', { sdp: data.sdp });
    }
  
    @SubscribeMessage('answer')
    handleAnswer(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
      this.callService.saveAnswer(data.roomId, data.sdp);
      client.to(data.roomId).emit('answer', { sdp: data.sdp });
    }
  
    @SubscribeMessage('ice-candidate')
    handleIceCandidate(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
      client.to(data.roomId).emit('ice-candidate', { candidate: data.candidate });
    }
  
    @SubscribeMessage('media-file')
    handleMediaFile(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
      // Optionally store in Firebase here
      client.to(data.roomId).emit('media-file', {
        file: data.file,
        fileName: data.fileName,
        sender: data.sender,
      });
    }
  
    @SubscribeMessage('endCall')
    handleEndCall(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
      client.to(data.roomId).emit('callEnded', data);
    }
  }
  
  }
  import {
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    ConnectedSocket,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { CallService } from './call.service';
  
  @WebSocketGateway({ cors: true })
  export class CallGateway {
    @WebSocketServer()
    server: Server;
  
    constructor(private readonly callService: CallService) {}
  
    @SubscribeMessage('startCall')
    handleStartCall(
      @ConnectedSocket() client: Socket,
      @MessageBody() data: { roomId: string; userId: string },
    ) {
      this.callService.addUserToRoom(data.roomId, client.id, data.userId);
      client.join(data.roomId);
      this.server.to(data.roomId).emit('user-joined', {
        userId: data.userId,
        socketId: client.id,
      });
    }
  
    @SubscribeMessage('joinCall')
    handleJoinCall(
      @ConnectedSocket() client: Socket,
      @MessageBody() data: { roomId: string; userId: string },
    ) {
      this.callService.addUserToRoom(data.roomId, client.id, data.userId);
      client.join(data.roomId);
      this.server.to(data.roomId).emit('user-joined', {
        userId: data.userId,
        socketId: client.id,
      });
    }
  
    @SubscribeMessage('sendOffer')
    handleSendOffer(
      @MessageBody()
      data: { offer: RTCSessionDescriptionInit; targetSocketId: string; senderSocketId: string },
    ) {
      this.server.to(data.targetSocketId).emit('receiveOffer', {
        offer: data.offer,
        senderSocketId: data.senderSocketId,
      });
    }
  
    @SubscribeMessage('sendAnswer')
    handleSendAnswer(
      @MessageBody()
      data: { answer: RTCSessionDescriptionInit; targetSocketId: string; senderSocketId: string },
    ) {
      this.server.to(data.targetSocketId).emit('receiveAnswer', {
        answer: data.answer,
        senderSocketId: data.senderSocketId,
      });
    }
  
    @SubscribeMessage('sendICECandidate')
    handleSendICECandidate(
      @MessageBody()
      data: { candidate: RTCIceCandidateInit; targetSocketId: string },
    ) {
      this.server.to(data.targetSocketId).emit('receiveICECandidate', {
        candidate: data.candidate,
      });
    }
  
    @SubscribeMessage('shareScreen')
    handleShareScreen(
      @MessageBody() data: { roomId: string; streamInfo: any; senderSocketId: string },
    ) {
      this.server.to(data.roomId).emit('screenShareStream', {
        senderSocketId: data.senderSocketId,
        streamInfo: data.streamInfo,
      });
    }
  
    @SubscribeMessage('sendMediaFile')
    handleSendMediaFile(
      @MessageBody() data: { roomId: string; fileData: any; senderSocketId: string },
    ) {
      this.server.to(data.roomId).emit('receiveMediaFile', {
        senderSocketId: data.senderSocketId,
        fileData: data.fileData,
      });
    }
  
    @SubscribeMessage('endCall')
    handleEndCall(
      @ConnectedSocket() client: Socket,
      @MessageBody() data: { roomId: string },
    ) {
      this.callService.removeUserFromRoom(data.roomId, client.id);
      client.leave(data.roomId);
      this.server.to(data.roomId).emit('user-left', {
        socketId: client.id,
      });
    }
  }
  