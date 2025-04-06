import { Injectable } from '@nestjs/common';
import { initializeApp, cert, App } from 'firebase-admin/app';
import { getDatabase, Database } from 'firebase-admin/database';
import * as serviceAccount from '../../firebase/firebase-service-account.json';

@Injectable()
export class CallService {
  private db: Database;
  private app: App;
  private offers = new Map<string, any>();
  private answers = new Map<string, any>();
  private rooms: Record<string, { [socketId: string]: string }> = {};

  constructor() {
    this.app = initializeApp({
      credential: cert(serviceAccount as any),
      databaseURL: 'https://your-project-id.firebaseio.com', // 🔁 Replace with actual
    });

    this.db = getDatabase(this.app);
  }

  // --- WebRTC Signaling (in-memory)
  saveOffer(roomId: string, sdp: any) {
    this.offers.set(roomId, sdp);
  }

  getOffer(roomId: string) {
    return this.offers.get(roomId);
  }

  saveAnswer(roomId: string, sdp: any) {
    this.answers.set(roomId, sdp);
  }

  getAnswer(roomId: string) {
    return this.answers.get(roomId);
  }

  // --- Firebase Signaling
  async sendSignal(receiverId: string, payload: any) {
    await this.db.ref(`calls/${receiverId}`).push(payload);
  }

  async endCall(receiverId: string) {
    await this.db.ref(`calls/${receiverId}`).remove();
  }

  // --- Room User Management
  addUserToRoom(roomId: string, socketId: string, userId: string) {
    if (!this.rooms[roomId]) this.rooms[roomId] = {};
    this.rooms[roomId][socketId] = userId;
  }

  removeUserFromRoom(roomId: string, socketId: string) {
    if (this.rooms[roomId]) {
      delete this.rooms[roomId][socketId];
      if (Object.keys(this.rooms[roomId]).length === 0) delete this.rooms[roomId];
    }
  }

  getUsersInRoom(roomId: string): string[] {
    return this.rooms[roomId] ? Object.values(this.rooms[roomId]) : [];
  }
}
