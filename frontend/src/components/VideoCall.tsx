
'use client';
import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import LocalVideo from './LocalVideo';
import RemoteVideo from './RemoteVideo';
import FileSender from './FileSender';
import CallControls from './CallControls';
import { Box, Typography } from '@mui/material';



const startCall = async () => {
    const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideoRef.current.srcObject = localStream;
  
    const peerConnection = new RTCPeerConnection();
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
  
    peerConnection.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };
  
    socket.emit("startCall", { offer: await peerConnection.createOffer() });
  };
  
  return (
    <div>
      <video ref={localVideoRef} autoPlay muted />
      <video ref={remoteVideoRef} autoPlay />
      <button onClick={startCall}>Start Video Call</button>
    </div>
  );
  


const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!); // from .env

export default function VideoCall({ roomId, user }) {
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const [callState, setCallState] = useState<'idle' | 'calling' | 'in-call'>('idle');

  useEffect(() => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });
    peerConnectionRef.current = pc;

    socket.emit('joinRoom', { roomId, user });

    socket.on('offer', async ({ sdp }) => {
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('answer', { sdp: answer, roomId });
    });

    socket.on('answer', async ({ sdp }) => {
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    });

    socket.on('ice-candidate', async ({ candidate }) => {
      try {
        await pc.addIceCandidate(candidate);
      } catch (e) {
        console.error('Error adding received ice candidate', e);
      }
    });

    pc.ontrack = (event) => {
      remoteStreamRef.current = event.streams[0];
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', { candidate: event.candidate, roomId });
      }
    };

    return () => {
      pc.close();
    };
  }, [roomId]);

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Typography variant="h5">NexaVid Call Room: {roomId}</Typography>
      <Box display="flex" justifyContent="space-around" width="100%">
        <LocalVideo stream={localStreamRef.current} />
        <RemoteVideo stream={remoteStreamRef.current} />
      </Box>
      <CallControls peerConnection={peerConnectionRef.current} streamRef={localStreamRef} />
      <FileSender socket={socket} roomId={roomId} />
    </Box>
  );
}
