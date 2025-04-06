const PeerVideoTile = ({ stream }: { stream: MediaStream }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
  
    useEffect(() => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    }, [stream]);
  
    return (
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{ width: '100%', borderRadius: 8 }}
      />
    );
  };
  