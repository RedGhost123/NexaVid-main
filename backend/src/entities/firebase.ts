// src/videos/firebase.ts
import { initializeApp, cert } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import * as serviceAccount from "../../firebase-service-account.json"; // 👈 your service account

initializeApp({
  credential: cert(serviceAccount as any),
  storageBucket: "your-project-id.appspot.com",
});

export const storage = getStorage().bucket();
