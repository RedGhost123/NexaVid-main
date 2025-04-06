import io from 'socket.io-client';
const socket = io('http://localhost:3001'); // or your backend URL

export function initSocket(userId: string, roomId: string) {
  socket.emit('joinCall', { userId, roomId });
}

export function sendOffer(targetId: string, offer: RTCSessionDescriptionInit, senderId: string) {
  socket.emit('sendOffer', { targetSocketId: targetId, offer, senderSocketId: senderId });
}

export function sendAnswer(targetId: string, answer: RTCSessionDescriptionInit, senderId: string) {
  socket.emit('sendAnswer', { targetSocketId: targetId, answer, senderSocketId: senderId });
}

export function sendICECandidate(targetId: string, candidate: RTCIceCandidateInit) {
  socket.emit('sendICECandidate', { targetSocketId: targetId, candidate });
}

export default socket;
