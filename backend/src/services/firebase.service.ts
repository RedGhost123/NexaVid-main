// src/videos/firebase.service.ts
import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as serviceAccount from '../../firebase-service-account.json';


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  storageBucket: '<your-firebase-project-id>.appspot.com',
});

@Injectable()
export class FirebaseService {
  private bucket = admin.storage().bucket();

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const fileName = `videos/${uuidv4()}-${file.originalname}`;
    const fileUpload = this.bucket.file(fileName);

    await fileUpload.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
        metadata: { firebaseStorageDownloadTokens: uuidv4() },
      },
    });

    const publicUrl = `https://storage.googleapis.com/${this.bucket.name}/${fileName}`;
    return publicUrl;
  }
}
