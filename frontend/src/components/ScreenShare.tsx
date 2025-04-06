const startScreenShare = () => {
    navigator.mediaDevices.getDisplayMedia({ video: true }).then((stream) => {
      socket.emit("startScreenShare", { sessionId, stream });
    });
  };
  
  return <button onClick={startScreenShare}>Share Screen</button>;
  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const videoTrack = screenStream.getVideoTracks()[0];
  
      const sender = peerConnection.getSenders().find((s) => s.track.kind === "video");
      sender.replaceTrack(videoTrack);
  
      videoTrack.onended = () => {
        sender.replaceTrack(localStream.getVideoTracks()[0]);
      };
    } catch (error) {
      console.error("Screen share error:", error);
    }
  };
  
  return <button onClick={startScreenShare}>Share Screen</button>;
  