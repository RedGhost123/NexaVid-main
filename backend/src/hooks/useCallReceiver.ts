import { useEffect, useRef, useState } from 'react';
import { getDatabase, ref, onChildAdded, set, remove, onValue } from 'firebase/database';
import { getAuth } from 'firebase/auth';

export const useCallReceiver = () => {
  const [incomingCall, setIncomingCall] = useState<null | { callId: string; from: string }>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const db = getDatabase();
  const auth = getAuth();
  const user = auth.currentUser;

  const iceServers = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

  useEffect(() => {
    const callsRef = ref(db, 'calls');
    const unsubscribe = onChildAdded(callsRef, async (snap) => {
      const call = snap.val();
      const id = snap.key!;
      if (call.from !== user?.uid) {
        setIncomingCall({ callId: id, from: call.from });
      }
    });

    return () => unsubscribe();
  }, [user]);

  const answerCall = async (callId: string) => {
    const pc = new RTCPeerConnection(iceServers);
    peerConnectionRef.current = pc;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    localStreamRef.current = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    pc.ontrack = (e) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = e.streams[0];
      }
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        set(ref(db, `calls/${callId}/candidates/${user?.uid}`), {
          candidate: e.candidate.toJSON(),
          from: user?.uid,
        });
      }
    };

    // Fetch Offer
    const offerRef = ref(db, `calls/${callId}/offer`);
    onValue(offerRef, async (snap) => {
      const offer = snap.val();
      if (offer) {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        set(ref(db, `calls/${callId}/answer`), answer);
      }
    });

    // Handle Remote ICE
    onChildAdded(ref(db, `calls/${callId}/candidates`), async (snap) => {
      const data = snap.val();
      if (data.from !== user?.uid && data.candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    setIncomingCall(null); // Clear popup
  };

  const rejectCall = async (callId: string) => {
    await remove(ref(db, `calls/${callId}`));
    setIncomingCall(null);
  };

  return {
    incomingCall,
    localVideoRef,
    remoteVideoRef,
    answerCall,
    rejectCall,
  };
};


const toggleScreenShare = async (callId: string) => {
  const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
  const screenTrack = screenStream.getVideoTracks()[0];

  const sender = peerConnectionRef.current?.getSenders().find((s) => s.track?.kind === 'video');
  if (sender) {
    sender.replaceTrack(screenTrack);
  }

  // Inform other user
  const screenRef = ref(db, `calls/${callId}/screenShare`);
  set(screenRef, {
    from: user?.uid,
    active: true,
  });

  // Auto stop when screen sharing ends
  screenTrack.onended = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) sender?.replaceTrack(videoTrack);
    }

    set(screenRef, {
      from: user?.uid,
      active: false,
    });
  };
};

useEffect(() => {
  if (!callId) return;

  const screenRef = ref(db, `calls/${callId}/screenShare`);
  onValue(screenRef, (snap) => {
    const data = snap.val();
    if (data?.active && remoteVideoRef.current) {
      console.log("Screen sharing started by", data.from);
      // You can show a UI indicator here
    } else {
      console.log("Screen sharing ended.");
    }
  });
}, [callId]);
import { onChildAdded } from 'firebase/database';

useEffect(() => {
  if (!callId) return;

  const fileRef = ref(db, `calls/${callId}/files`);
  const unsubscribe = onChildAdded(fileRef, (snap) => {
    const file = snap.val();
    console.log("Received file:", file);
    // Optional: display file in UI
    alert(`📁 New file from ${file.sender}: ${file.name}`);
    // Or show a list in chat box
  });

  return () => unsubscribe();
}, [callId]);
<input
  type="file"
  onChange={(e) => {
    const file = e.target.files?.[0];
    if (file) {
      sendFile(file, callId, user?.uid);
    }
  }}
/>

const endCall = async () => {
  // Close peer connection
  peerConnectionRef.current?.close();
  peerConnectionRef.current = null;

  // Stop all local media tracks
  localStreamRef.current?.getTracks().forEach((track) => track.stop());
  remoteStreamRef.current?.getTracks().forEach((track) => track.stop());

  // Remove Firebase call path
  if (callId) {
    const callRef = ref(db, `calls/${callId}`);
    await remove(callRef);
  }

  // Redirect or reset UI
  router.push('/dashboard'); // or setCallActive(false);
};
const toggleMic = () => {
  const audioTrack = localStreamRef.current?.getAudioTracks()[0];
  if (audioTrack) audioTrack.enabled = !audioTrack.enabled;
};

const toggleCamera = () => {
  const videoTrack = localStreamRef.current?.getVideoTracks()[0];
  if (videoTrack) videoTrack.enabled = !videoTrack.enabled;
};

