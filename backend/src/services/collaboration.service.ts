import { Injectable } from '@nestjs/common';
import { Firestore } from '@google-cloud/firestore';
import { PrismaService } from '../../prisma/prisma.service';
import { EditAction } from 'src/interfaces/collaboration/edit-action.interface';

@Injectable()
export class CollaborationService {
  private firestore: Firestore;

  constructor(private readonly prisma: PrismaService) {
    this.firestore = new Firestore(); // Uses GOOGLE_APPLICATION_CREDENTIALS
  }

  async saveEditAction(sessionId: string, action: string, data: any): Promise<void> {
    const timestamp = new Date();

    // 🔁 Firestore (for real-time sync)
    await this.firestore.collection('collaboration_sessions').doc(sessionId).set(
      {
        lastEdit: {
          action,
          data,
          timestamp,
        },
      },
      { merge: true }
    );

    // 💾 PostgreSQL (for history tracking)
    await this.prisma.collaborationSession.update({
      where: { sessionId },
      data: {
        lastEdit: JSON.stringify({ action, data, timestamp }),
      },
    });
  }
}
