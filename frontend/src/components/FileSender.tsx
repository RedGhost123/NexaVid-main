import { Button } from '@mui/material';
import { useState } from 'react';

export default function FileSender({ socket, roomId }) {
  const [file, setFile] = useState<File | null>(null);

  const handleSend = () => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      socket.emit('media-file', {
        file: reader.result,
        fileName: file.name,
        roomId,
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <Button onClick={handleSend}>Send File</Button>
    </div>
  );
}
