useEffect(() => {
    socket.on("callAccepted", (callData) => {
      window.location.href = `/video-call/${callData.callId}`;
    });
  
    return () => socket.off("callAccepted");
  }, []);
  