const peers: Record<string, RTCPeerConnection> = {};
const iceConfig = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

export function createPeerConnection(
  socketId: string,
  onTrack: (stream: MediaStream, fromId: string) => void,
) {
  const pc = new RTCPeerConnection(iceConfig);

  pc.onicecandidate = (e) => {
    if (e.candidate) {
      sendICECandidate(socketId, e.candidate);
    }
  };

  pc.ontrack = (e) => {
    onTrack(e.streams[0], socketId);
  };

  peers[socketId] = pc;
  return pc;
}

export function getPeer(socketId: string) {
  return peers[socketId];
}

export function removePeer(socketId: string) {
  peers[socketId]?.close();
  delete peers[socketId];
}
