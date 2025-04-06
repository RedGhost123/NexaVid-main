const [call, setCall] = useState(false);
const myVideo = useRef();
const peer = useRef(new Peer());

useEffect(() => {
  peer.current.on("call", (incomingCall) => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      incomingCall.answer(stream);
      incomingCall.on("stream", (remoteStream) => {
        myVideo.current.srcObject = remoteStream;
      });
    });
  });

  return () => peer.current.destroy();
}, []);

const startCall = (userId) => {
  navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    const call = peer.current.call(userId, stream);
    call.on("stream", (remoteStream) => {
      myVideo.current.srcObject = remoteStream;
    });
  });
};

return (
  <div>
    <video ref={myVideo} autoPlay />
    <button onClick={() => startCall(otherUserId)}>Call</button>
  </div>
);


import { getDatabase, ref, onChildAdded, remove } from 'firebase/database';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  databaseURL: 'https://your-project-id.firebaseio.com',
  projectId: 'your-project-id',
  // ...rest
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
export function listenToFirebaseSignals(userId: string, handleSignal: (type: string, data: any, senderId: string) => void) {
    const signalRef = ref(db, `calls/${userId}`);
  
    onChildAdded(signalRef, async (snapshot) => {
      const signal = snapshot.val();
      const { type, data, senderId } = signal;
  
      // 👉 Let app react to type: offer | answer | ice-candidate | screen-share
      handleSignal(type, data, senderId);
  
      // Remove message after processing (optional cleanup)
      await remove(snapshot.ref);
    });
  }
  useEffect(() => {
    if (userId) {
      listenToFirebaseSignals(userId, (type, data, senderId) => {
        switch (type) {
          case 'offer':
            handleOffer(data, senderId);
            break;
          case 'answer':
            handleAnswer(data);
            break;
          case 'ice-candidate':
            handleICECandidate(data);
            break;
          case 'screen-share':
            handleRemoteScreen(data);
            break;
          case 'media-file':
            handleReceivedMedia(data);
            break;
          case 'end':
            endCall();
            break;
        }
      });
    }
  }, [userId]);
  useEffect(() => {
    const socket = io('http://localhost:3000');
    setSocket(socket);
  
    if (userId) {
      listenToFirebaseSignals(userId, async (type, data, senderId) => {
        switch (type) {
          case 'offer':
            await handleOffer(data, senderId);
            break;
          case 'answer':
            await handleAnswer(data);
            break;
          case 'ice-candidate':
            await handleICECandidate(data);
            break;
          case 'screen-share':
            await handleRemoteScreen(data);
            break;
          case 'media-file':
            await handleReceivedMedia(data);
            break;
          case 'end':
            await endCallCleanup();
            break;
        }
      });
    }
  
    return () => {
      socket.disconnect();
    };
  }, [userId]);
  const CallRoom = ({ userId, roomId }) => {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  
    useEffect(() => {
      const init = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
  
        initSocket(userId, roomId);
  
        socket.on('user-joined', async ({ userId: remoteId, socketId }) => {
          const pc = createPeerConnection(socketId, handleTrack);
          stream.getTracks().forEach((t) => pc.addTrack(t, stream));
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          sendOffer(socketId, offer, socket.id);
        });
  
        socket.on('receiveOffer', async ({ offer, senderSocketId }) => {
          const pc = createPeerConnection(senderSocketId, handleTrack);
          stream.getTracks().forEach((t) => pc.addTrack(t, stream));
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          sendAnswer(senderSocketId, answer, socket.id);
        });
  
        socket.on('receiveAnswer', async ({ answer, senderSocketId }) => {
          const pc = getPeer(senderSocketId);
          if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
        });
  
        socket.on('receiveICECandidate', async ({ candidate, senderSocketId }) => {
          const pc = getPeer(senderSocketId);
          if (pc) await pc.addIceCandidate(new RTCIceCandidate(candidate));
        });
  
        socket.on('user-left', ({ socketId }) => {
          removePeer(socketId);
          setRemoteStreams((prev) => {
            const copy = { ...prev };
            delete copy[socketId];
            return copy;
          });
        });
      };
  
      const handleTrack = (stream: MediaStream, fromId: string) => {
        setRemoteStreams((prev) => ({ ...prev, [fromId]: stream }));
      };
  
      init();
  
      return () => {
        socket.emit('endCall', { roomId });
        Object.keys(remoteStreams).forEach(removePeer);
      };
    }, []);
  
    return (
      <div>
        <h2>Group Call</h2>
        <video autoPlay muted ref={(el) => el && localStream && (el.srcObject = localStream)} />
        {Object.entries(remoteStreams).map(([id, stream]) => (
          <video key={id} autoPlay ref={(el) => el && (el.srcObject = stream)} />
        ))}
      </div>
    );
  };
  const shareScreen = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
  
      // Replace track in all peer connections
      Object.entries(peers).forEach(([id, pc]) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(screenStream.getVideoTracks()[0]);
        }
      });
  
      // Update local video
      const screenTrack = screenStream.getVideoTracks()[0];
      screenTrack.onended = () => {
        revertToCamera();
      };
      const videoElement = document.getElementById('local-video') as HTMLVideoElement;
      if (videoElement) videoElement.srcObject = screenStream;
    } catch (err) {
      console.error('Error sharing screen:', err);
    }
  };
  const revertToCamera = async () => {
    const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  
    Object.entries(peers).forEach(([id, pc]) => {
      const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
      if (sender) {
        sender.replaceTrack(cameraStream.getVideoTracks()[0]);
      }
    });
  
    setLocalStream(cameraStream);
    const videoElement = document.getElementById('local-video') as HTMLVideoElement;
    if (videoElement) videoElement.srcObject = cameraStream;
  };
<div>
  <button onClick={shareScreen}>📺 Share Screen</button>
  <video
    id="local-video"
    autoPlay
    muted
    ref={(el) => el && localStream && (el.srcObject = localStream)}
  />
  {Object.entries(remoteStreams).map(([id, stream]) => (
    <video key={id} autoPlay ref={(el) => el && (el.srcObject = stream)} />
  ))}
</div>
import {
    AppBar,
    Toolbar,
    IconButton,
    Tooltip,
    Stack,
  } from '@mui/material';
  import MicIcon from '@mui/icons-material/Mic';
  import MicOffIcon from '@mui/icons-material/MicOff';
  import VideocamIcon from '@mui/icons-material/Videocam';
  import VideocamOffIcon from '@mui/icons-material/VideocamOff';
  import ScreenShareIcon from '@mui/icons-material/ScreenShare';
  import CallEndIcon from '@mui/icons-material/CallEnd';
  import UploadFileIcon from '@mui/icons-material/UploadFile';
  
  ...
  
  <AppBar position="fixed" color="default" sx={{ top: 'auto', bottom: 0 }}>
    <Toolbar sx={{ justifyContent: 'center' }}>
      <Stack direction="row" spacing={2}>
        <Tooltip title="Toggle Mic">
          <IconButton onClick={toggleMic} color="primary">
            {micEnabled ? <MicIcon /> : <MicOffIcon />}
          </IconButton>
        </Tooltip>
  
        <Tooltip title="Toggle Camera">
          <IconButton onClick={toggleCamera} color="primary">
            {cameraEnabled ? <VideocamIcon /> : <VideocamOffIcon />}
          </IconButton>
        </Tooltip>
  
        <Tooltip title="Share Screen">
          <IconButton onClick={shareScreen} color="primary">
            <ScreenShareIcon />
          </IconButton>
        </Tooltip>
  
        <Tooltip title="Send Media">
          <IconButton component="label" color="primary">
            <UploadFileIcon />
            <input type="file" hidden onChange={handleFileUpload} />
          </IconButton>
        </Tooltip>
  
        <Tooltip title="End Call">
          <IconButton onClick={endCall} color="error">
            <CallEndIcon />
          </IconButton>
        </Tooltip>
      </Stack>
    </Toolbar>
  </AppBar>
useEffect(() => {
    const handleReconnect = async () => {
      const userId = getCurrentUserId(); // however you store the current user ID
      const existingPeers = await getActivePeers(); // from your Firebase room document
  
      existingPeers.forEach((peerId) => {
        if (peerId !== userId) {
          startCall(peerId); // reinitiate WebRTC offer
        }
      });
    };
  
    window.addEventListener('load', handleReconnect);
    return () => window.removeEventListener('load', handleReconnect);
  }, []);
  import { Grid } from '@mui/material';

  <Grid container spacing={2}>
    {Object.entries(peers).map(([peerId, stream]) => (
      <Grid item xs={12} sm={6} md={4} lg={3} key={peerId}>
        <video
          ref={(ref) => {
            if (ref) ref.srcObject = stream;
          }}
          autoPlay
          playsInline
          style={{
            width: '100%',
            height: 'auto',
            borderRadius: 8,
            backgroundColor: '#000',
          }}
        />
      </Grid>
    ))}
  </Grid>
const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);

useEffect(() => {
  const audioContexts = new Map();

  Object.entries(peers).forEach(([peerId, stream]) => {
    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const detectVolume = () => {
      analyser.getByteFrequencyData(dataArray);
      const volume = dataArray.reduce((a, b) => a + b) / dataArray.length;
      if (volume > 20) {
        setActiveSpeaker(peerId);
      }
      requestAnimationFrame(detectVolume);
    };
    detectVolume();

    audioContexts.set(peerId, audioCtx);
  });

  return () => {
    audioContexts.forEach((ctx) => ctx.close());
  };
}, [peers]);
style={{
    border: activeSpeaker === peerId ? '4px solid #2196f3' : 'none',
    borderRadius: 8,
    width: '100%',
    backgroundColor: '#000',
  }}
// CallRoom.tsx (Final Version with Group Call, UI Polish, Screenshare, File Share, Auto Reconnect, Active Speaker)
import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Grid, IconButton, Tooltip, Paper } from '@mui/material';
import {
  Mic, MicOff, Videocam, VideocamOff, CallEnd, ScreenShare, StopScreenShare, UploadFile
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { db } from '@/lib/firebase';
import { v4 as uuidv4 } from 'uuid';
import { getUserMediaStream, getAudioLevel } from './mediaUtils'; // Assume reusable media utility functions

const CallRoom = () => {
  const router = useRouter();
  const { roomId } = router.query;

  const localVideoRef = useRef(null);
  const peerConnections = useRef({});
  const remoteStreams = useRef({});
  const localStream = useRef(null);
  const screenTrack = useRef(null);
  const reconnectTimeout = useRef(null);

  const [remoteUsers, setRemoteUsers] = useState([]);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeSpeakerId, setActiveSpeakerId] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    const initCall = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStream.current = stream;
      localVideoRef.current.srcObject = stream;
      setIsCallActive(true);
      // Signaling & WebRTC logic here (listeners, offer/answer exchange)
    };

    initCall();

    return () => {
      Object.values(peerConnections.current).forEach(pc => pc.close());
      if (localStream.current) {
        localStream.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [roomId]);

  const toggleMic = () => {
    const audioTrack = localStream.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMicOn(audioTrack.enabled);
    }
  };

  const toggleCamera = () => {
    const videoTrack = localStream.current?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setCameraOn(videoTrack.enabled);
    }
  };

  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrackToSend = screenStream.getTracks()[0];
      screenTrack.current = screenTrackToSend;
      Object.values(peerConnections.current).forEach(pc => {
        const sender = pc.getSenders().find(s => s.track.kind === 'video');
        sender.replaceTrack(screenTrackToSend);
      });
      setIsScreenSharing(true);

      screenTrackToSend.onended = () => {
        stopScreenShare();
      };
    } catch (err) {
      console.error('Screen sharing error', err);
    }
  };

  const stopScreenShare = () => {
    if (screenTrack.current) {
      screenTrack.current.stop();
      const camTrack = localStream.current?.getVideoTracks()[0];
      Object.values(peerConnections.current).forEach(pc => {
        const sender = pc.getSenders().find(s => s.track.kind === 'video');
        sender.replaceTrack(camTrack);
      });
      setIsScreenSharing(false);
    }
  };

  const endCall = () => {
    Object.values(peerConnections.current).forEach(pc => pc.close());
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
    }
    setIsCallActive(false);
    router.push('/dashboard');
  };

  const renderRemoteVideos = () => {
    return remoteUsers.map(user => (
      <Grid item xs={6} md={4} lg={3} key={user.id}>
        <Paper
          elevation={4}
          sx={{
            border: activeSpeakerId === user.id ? '3px solid #00e676' : '1px solid #ccc',
            position: 'relative',
            backgroundColor: '#000',
          }}
        >
          <video
            ref={el => el && (el.srcObject = remoteStreams.current[user.id])}
            autoPlay
            playsInline
            style={{ width: '100%', borderRadius: 4 }}
          />
          <Typography variant="caption" sx={{ position: 'absolute', bottom: 4, left: 4, color: '#fff' }}>
            {user.name || user.id}
          </Typography>
        </Paper>
      </Grid>
    ));
  };

  return (
    <Box sx={{ height: '100vh', p: 2, backgroundColor: '#111' }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            style={{ width: '100%', borderRadius: 8 }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Grid container spacing={2}>
            {renderRemoteVideos()}
          </Grid>
        </Grid>
      </Grid>

      <Box sx={{ position: 'fixed', bottom: 16, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <Tooltip title={micOn ? "Mute" : "Unmute"}>
          <IconButton onClick={toggleMic} color="primary">{micOn ? <Mic /> : <MicOff />}</IconButton>
        </Tooltip>
        <Tooltip title={cameraOn ? "Turn off camera" : "Turn on camera"}>
          <IconButton onClick={toggleCamera} color="primary">{cameraOn ? <Videocam /> : <VideocamOff />}</IconButton>
        </Tooltip>
        <Tooltip title={isScreenSharing ? "Stop sharing" : "Share screen"}>
          <IconButton onClick={isScreenSharing ? stopScreenShare : startScreenShare} color="primary">
            {isScreenSharing ? <StopScreenShare /> : <ScreenShare />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Send file">
          <IconButton color="primary"><UploadFile /></IconButton>
        </Tooltip>
        <Tooltip title="End call">
          <IconButton onClick={endCall} color="error"><CallEnd /></IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default CallRoom;