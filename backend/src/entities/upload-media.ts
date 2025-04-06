import { storage } from "../firebase"; // Firebase setup
import { v4 as uuidv4 } from "uuid";

export default async function handler(req, res) {
  const file = req.file;
  const fileRef = storage.bucket().file(`media/${uuidv4()}-${file.originalname}`);
  
  await fileRef.save(file.buffer);
  const fileUrl = await fileRef.getSignedUrl({ action: "read", expires: "03-09-2099" });

  res.json({ fileUrl });
}

