// LocalVideo.tsx
export default function LocalVideo({ stream }) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
  
    useEffect(() => {
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
      }
    }, [stream]);
  
    return <video ref={videoRef} autoPlay muted style={{ width: '45%' }} />;
  }
  
  // RemoteVideo.tsx is similar, just no muted
  