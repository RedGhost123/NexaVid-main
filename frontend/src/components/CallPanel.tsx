// components/CallPanel.tsx
import React, { useState } from 'react';
import { Box, IconButton, Tooltip, Paper, Typography } from '@mui/material';
import { Videocam, Mic, ScreenShare, CallEnd, AttachFile, Group } from '@mui/icons-material';

const CallPanel = () => {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  return (
    <Paper
      elevation={4}
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        width: 320,
        borderRadius: 2,
        overflow: 'hidden',
        zIndex: 2000,
      }}
    >
      <Box sx={{ p: 1, bgcolor: '#1e1e1e', color: '#fff' }}>
        <Typography variant="subtitle1">Live Call</Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: 1,
          p: 1,
          bgcolor: '#121212',
        }}
      >
        <Tooltip title="Toggle Mic">
          <IconButton onClick={() => setMicOn(!micOn)} color={micOn ? 'primary' : 'error'}>
            <Mic />
          </IconButton>
        </Tooltip>

        <Tooltip title="Toggle Camera">
          <IconButton onClick={() => setCamOn(!camOn)} color={camOn ? 'primary' : 'error'}>
            <Videocam />
          </IconButton>
        </Tooltip>

        <Tooltip title="Share Screen">
          <IconButton color="primary">
            <ScreenShare />
          </IconButton>
        </Tooltip>

        <Tooltip title="Send File">
          <IconButton color="primary">
            <AttachFile />
          </IconButton>
        </Tooltip>

        <Tooltip title="Participants">
          <IconButton color="primary">
            <Group />
          </IconButton>
        </Tooltip>

        <Tooltip title="End Call">
          <IconButton color="error">
            <CallEnd />
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
};

import React, { useEffect, useRef, useState } from 'react';

const FloatingCallPanel = () => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const startLocalStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Failed to access camera/microphone:', error);
      }
    };

    startLocalStream();

    return () => {
      // Cleanup on unmount
      localStream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <video
        ref={localVideoRef}
        autoPlay
        muted
        playsInline
        style={{
          width: '100%',
          borderRadius: 8,
          background: '#000',
        }}
      />
      {/* Additional controls go here */}
    </div>
  );
};


import { useCallManager } from './useCallManager';
import PeerVideoTile from './PeerVideoTile';

const FloatingCallPanel = ({ roomId }: { roomId: string }) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      setLocalStream(stream);
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    });
  }, []);

  const { remoteStreams } = useCallManager(localStream, roomId);

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <video ref={localVideoRef} autoPlay muted playsInline style={{ width: 200 }} />
      {remoteStreams.map((peer) => (
        <PeerVideoTile key={peer.id} stream={peer.stream} />
      ))}
    </div>
  

<Button onClick={toggleScreenShare} variant="outlined" color="secondary">
  Share Screen
</Button>

<input
  type="file"
  onChange={(e) => {
    const file = e.target.files?.[0];
    if (file) sendFile(file);
  }};
/>
{receivedFiles.map((file, i) => (
    <a
      key={i}
      href={file.data}
      download={file.name}
      target="_blank"
      rel="noopener noreferrer"
    >
      📎 {file.name}
    </a>
  ))}
  <Box
  sx={{
    position: 'absolute',
    bottom: 16,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: 2,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 1,
    boxShadow: 3,
    zIndex: 9999,
  }}
>
  <IconButton onClick={toggleMic} color={micOn ? 'primary' : 'error'}>
    {micOn ? <Mic /> : <MicOff />}
  </IconButton>

  <IconButton onClick={toggleCamera} color={cameraOn ? 'primary' : 'error'}>
    {cameraOn ? <Videocam /> : <VideocamOff />}
  </IconButton>

  <IconButton onClick={toggleScreenShare} color="secondary">
    <ScreenShare />
  </IconButton>

  <IconButton component="label">
    <AttachFile />
    <input type="file" hidden onChange={(e) => sendFile(e.target.files?.[0])} />
  </IconButton>

  <IconButton onClick={leaveCall} color="error">
    <CallEnd />
  </IconButton>
</Box>
  );
};
export default CallPanel;

