import { io } from 'socket.io-client';
const socket = io('http://localhost:3000'); // adjust if hosted

// Send WebRTC Offer to backend → which writes to Firebase
export function sendOffer(receiverId: string, offer: RTCSessionDescriptionInit) {
  socket.emit('call:signal', {
    receiverId,
    type: 'offer',
    data: offer,
  });
}

export function sendAnswer(receiverId: string, answer: RTCSessionDescriptionInit) {
  socket.emit('call:signal', {
    receiverId,
    type: 'answer',
    data: answer,
  });
}

export function sendICECandidate(receiverId: string, candidate: RTCIceCandidateInit) {
  socket.emit('call:signal', {
    receiverId,
    type: 'ice-candidate',
    data: candidate,
  });
}

export function shareScreen(receiverId: string, streamId: string) {
  socket.emit('call:signal', {
    receiverId,
    type: 'screen-share',
    data: { streamId },
  });
}

export function sendMediaFile(receiverId: string, fileURL: string) {
  socket.emit('call:signal', {
    receiverId,
    type: 'media-file',
    data: { fileURL },
  });
}

export function endCall(receiverId: string) {
  socket.emit('call:signal', {
    receiverId,
    type: 'end',
    data: {},
  });
}
