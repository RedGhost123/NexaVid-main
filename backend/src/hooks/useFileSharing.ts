import { getStorage, ref as sRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getDatabase, ref as dbRef, push } from 'firebase/database';

export const sendFile = async (file: File, callId: string, senderId: string) => {
  const storage = getStorage();
  const fileRef = sRef(storage, `calls/${callId}/files/${Date.now()}_${file.name}`);
  const snapshot = await uploadBytes(fileRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);

  const db = getDatabase();
  const fileMeta = {
    name: file.name,
    type: file.type,
    url: downloadURL,
    sender: senderId,
    timestamp: Date.now(),
  };

  await push(dbRef(db, `calls/${callId}/files`), fileMeta);
};
