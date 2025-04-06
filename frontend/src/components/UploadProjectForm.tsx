// components/uploadform.tsx
'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  LinearProgress,
  Alert,
} from '@mui/material';
import axios from 'axios';

const UploadForm = () => {
  const [video, setVideo] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setVideo(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!video || !title) {
      setMessage('Please select a video and enter a title');
      return;
    }

    const formData = new FormData();
    formData.append('video', video);
    formData.append('title', title);
    formData.append('description', description);

    try {
      setUploading(true);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/videos/upload`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      setMessage(`✅ Uploaded! Project ID: ${res.data.projectId}`);
    } catch (err: any) {
      setMessage(`❌ Upload failed: ${err?.response?.data?.message || err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        maxWidth: 500,
        mx: 'auto',
        mt: 4,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        p: 3,
        borderRadius: 2,
        boxShadow: 3,
        backgroundColor: '#fff',
      }}
    >
      <Typography variant="h5" fontWeight="bold">
        Upload AI Video
      </Typography>

      {message && <Alert severity="info">{message}</Alert>}

      <TextField
        label="Video Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <TextField
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        multiline
        rows={3}
      />

      <input type="file" accept="video/*" onChange={handleFileChange} required />

      {uploading && <LinearProgress />}

      <Button type="submit" variant="contained" disabled={uploading}>
        Upload Video
      </Button>
    </Box>
  );
};

export default UploadForm;





