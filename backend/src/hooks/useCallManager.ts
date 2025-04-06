import { useEffect, useRef } from 'react';
import { getDatabase, ref, push, onChildAdded, set, remove } from 'firebase/database';
import { getAuth } from 'firebase/auth';

export const useCallManager = () => {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const callId = useRef<string | null>(null);
  const db = getDatabase();
  const auth = getAuth();
  const user = auth.currentUser;

  // ICE Servers: Use STUN server (can upgrade to TURN)
  const iceServers = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

  const createConnection = () => {
    const pc = new RTCPeerConnection(iceServers);
    pc.onicecandidate = (e) => {
      if (e.candidate && callId.current) {
        push(ref(db, `calls/${callId.current}/candidates`), {
          candidate: e.candidate.toJSON(),
          from: user?.uid,
        });
      }
    };
    pc.ontrack = (e) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = e.streams[0];
      }
    };
    peerConnectionRef.current = pc;
  };

  const setupLocalStream = async (constraints: MediaStreamConstraints) => {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    stream.getTracks().forEach((track) => {
      peerConnectionRef.current?.addTrack(track, stream);
    });
    localStreamRef.current = stream;
  };

  const handleStartCall = async (withVideo = false) => {
    createConnection();
    await setupLocalStream({ audio: true, video: withVideo });

    const callRef = push(ref(db, 'calls'));
    callId.current = callRef.key!;
    set(callRef, {
      from: user?.uid,
    });

    const offer = await peerConnectionRef.current!.createOffer();
    await peerConnectionRef.current!.setLocalDescription(offer);
    set(ref(db, `calls/${callId.current}/offer`), offer);

    // Listen for answer
    onChildAdded(ref(db, `calls/${callId.current}/answer`), async (snap) => {
      const answer = snap.val();
      if (answer) {
        await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    // Listen for ICE candidates
    onChildAdded(ref(db, `calls/${callId.current}/candidates`), async (snap) => {
      const data = snap.val();
      if (data.from !== user?.uid && data.candidate) {
        await peerConnectionRef.current?.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });
  };

  const handleShareScreen = async () => {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    const screenTrack = screenStream.getVideoTracks()[0];
    const sender = peerConnectionRef.current
      ?.getSenders()
      .find((s) => s.track?.kind === 'video');
    sender?.replaceTrack(screenTrack);
  };

  const handleSendMedia = async () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'video/*';
    fileInput.onchange = () => {
      const file = fileInput.files?.[0];
      if (file) {
        alert(`Pretend this is being sent: ${file.name}`); // Stub logic
        // In production, send file via signaling (Firebase/Firestore/Firestore Storage URL)
      }
    };
    fileInput.click();
  };

  const handleEndCall = async () => {
    if (callId.current) {
      await remove(ref(db, `calls/${callId.current}`));
    }
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  };

  return {
    localVideoRef,
    remoteVideoRef,
    handleStartAudioCall: () => handleStartCall(false),
    handleStartVideoCall: () => handleStartCall(true),
    handleShareScreen,
    handleSendMedia,
    handleEndCall,
  };
};
<CallToolbar
  onEndCall={endCall}
  onToggleMic={toggleMic}
  onToggleCamera={toggleCamera}
  onShareScreen={() => toggleScreenShare(callId)}
  onSendFile={(file) => sendFile(file, callId, user?.uid)}
/>
import { useEffect, useRef, useState } from 'react';
import { firestore } from '@/lib/firebase'; // your Firebase setup
import { v4 as uuid } from 'uuid';

export function useCallManager(localStream: MediaStream | null, roomId: string) {
  const [remoteStreams, setRemoteStreams] = useState<{ id: string; stream: MediaStream }[]>([]);
  const peersRef = useRef<{ [id: string]: RTCPeerConnection }>({});
  const currentUserId = useRef(uuid()); // unique ID per peer

  useEffect(() => {
    if (!localStream) return;
    const roomRef = firestore.collection('calls').doc(roomId);
    const candidatesRef = roomRef.collection('candidates');
    
    const setupConnection = async () => {
      roomRef.onSnapshot(async (doc) => {
        const data = doc.data();
        if (!data) return;

        for (const [peerId, offer] of Object.entries(data.offers || {})) {
          if (peerId === currentUserId.current || peersRef.current[peerId]) continue;

          const pc = createPeerConnection(peerId);
          peersRef.current[peerId] = pc;

          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          await roomRef.set(
            {
              answers: {
                [currentUserId.current]: answer.toJSON(),
              },
            },
            { merge: true }
          );
        }
      });

      candidatesRef.onSnapshot(snapshot => {
        snapshot.docChanges().forEach(async change => {
          const data = change.doc.data();
          const { from, candidate } = data;
          if (from === currentUserId.current) return;

          const pc = peersRef.current[from];
          if (pc) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          }
        });
      });
    };

    const createPeerConnection = (peerId: string) => {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });

      localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

      pc.ontrack = (event) => {
        const stream = event.streams[0];
        setRemoteStreams(prev => [...prev, { id: peerId, stream }]);
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          candidatesRef.add({
            from: currentUserId.current,
            to: peerId,
            candidate: event.candidate.toJSON(),
          });
        }
      };

      return pc;
    };

    setupConnection();

    return () => {
      Object.values(peersRef.current).forEach(pc => pc.close());
    };
  }, [localStream]);

  return {
    remoteStreams,
    currentUserId: currentUserId.current,
  };
}
function toggleScreenShare() {
  if (!localStream) return;
  
  navigator.mediaDevices.getDisplayMedia({ video: true }).then((screenStream) => {
    const screenTrack = screenStream.getVideoTracks()[0];

    for (const peerId in peersRef.current) {
      const sender = peersRef.current[peerId]
        .getSenders()
        .find((s) => s.track?.kind === 'video');
      if (sender) sender.replaceTrack(screenTrack);
    }

    screenTrack.onended = () => {
      // Revert back to camera
      const cameraTrack = localStream.getVideoTracks()[0];
      for (const peerId in peersRef.current) {
        const sender = peersRef.current[peerId]
          .getSenders()
          .find((s) => s.track?.kind === 'video');
        if (sender) sender.replaceTrack(cameraTrack);
      }
    };
  });

  const sendFile = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result;
      const fileRef = firestore.collection('calls').doc(roomId).collection('files');
      await fileRef.add({
        from: currentUserId.current,
        name: file.name,
        type: file.type,
        data: base64,
        timestamp: Date.now(),
      });
    };
    reader.readAsDataURL(file);
  };
  
  const [receivedFiles, setReceivedFiles] = useState<any[]>([]);
  
  useEffect(() => {
    const fileRef = firestore.collection('calls').doc(roomId).collection('files');
    fileRef.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          if (data.from !== currentUserId.current) {
            setReceivedFiles(prev => [...prev, data]);
          }
        }
      });
    });
  }, []);
  const [micOn, setMicOn] = useState(true);
const [cameraOn, setCameraOn] = useState(true);

const toggleMic = () => {
  localStream.getAudioTracks().forEach(track => {
    track.enabled = !track.enabled;
    setMicOn(track.enabled);
  });
};

const toggleCamera = () => {
  localStream.getVideoTracks().forEach(track => {
    track.enabled = !track.enabled;
    setCameraOn(track.enabled);
  });
};
const leaveCall = async () => {
  for (const peerId in peersRef.current) {
    peersRef.current[peerId].close();
  }

  setRemoteStreams({});
  localStream.getTracks().forEach((track) => track.stop());

  await firestore.collection('calls').doc(roomId).delete();
  router.push('/dashboard'); // or wherever you go post-call
};

}
