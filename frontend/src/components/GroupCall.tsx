import { useEffect, useRef, useState } from "react";
import { IconButton, Box, Typography, Button, Dialog } from "@mui/material";
import { Mic, MicOff, Videocam, VideocamOff, CallEnd, TimerOutlined } from "@mui/icons-material";
import Draggable from "react-draggable";

const GroupCall = ({ socket }) => {
  const localVideoRef = useRef(null);
  const [remoteVideos, setRemoteVideos] = useState({});
  const [isMuted, setIsMuted] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [incomingCall, setIncomingCall] = useState(false);
  const [caller, setCaller] = useState(null);
  const [inCall, setInCall] = useState(false);
  const [callTime, setCallTime] = useState(0);
  const [blurEffect, setBlurEffect] = useState(false);
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());


  useEffect(() => {
    socket.on("incomingCall", ({ callerName }) => {
      setIncomingCall(true);
      setCaller(callerName);
    });

    socket.on("userJoined", ({ userId }) => {
      setRemoteVideos((prev) => ({ ...prev, [userId]: { ref: useRef(null) } }));
    });

    let timer;
    if (inCall) {
      timer = setInterval(() => setCallTime((prev) => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [socket, inCall]);

  const startCall = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if (blurEffect) {
      applyBlurEffect(stream);
    }
    localVideoRef.current.srcObject = stream;
    socket.emit("joinCall");
    setIncomingCall(false);
    setInCall(true);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    localVideoRef.current.srcObject.getAudioTracks()[0].enabled = isMuted;
  };

  const toggleVideo = () => {
    setVideoEnabled(!videoEnabled);
    localVideoRef.current.srcObject.getVideoTracks()[0].enabled = videoEnabled;
  };

  const toggleBlur = async () => {
    setBlurEffect(!blurEffect);
    const stream = localVideoRef.current.srcObject;
    applyBlurEffect(stream);
  };

  const applyBlurEffect = (stream) => {
    const videoTrack = stream.getVideoTracks()[0];
    if ("requestVideoFrameCallback" in videoTrack) {
      const processor = new OffscreenCanvas(640, 480);
      const ctx = processor.getContext("2d");

      const applyEffect = () => {
        ctx.filter = blurEffect ? "blur(8px)" : "none";
        ctx.drawImage(localVideoRef.current, 0, 0, processor.width, processor.height);
        videoTrack.requestVideoFrameCallback(applyEffect);
      };
      videoTrack.requestVideoFrameCallback(applyEffect);
    }
  };

  return (
    <>
      {/* Incoming Call UI */}
      <Dialog open={incomingCall} onClose={() => setIncomingCall(false)}>
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h6">{caller} is calling...</Typography>
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" color="primary" onClick={startCall} sx={{ mr: 2 }}>
              Accept
            </Button>
            <Button variant="outlined" color="error" onClick={() => setIncomingCall(false)}>
              Decline
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* Draggable Video Box */}
      {inCall && (
        <Draggable>
          <Box
            sx={{
              position: "fixed",
              bottom: 20,
              right: 20,
              background: "#000",
              borderRadius: "12px",
              p: 2,
              boxShadow: "0px 4px 10px rgba(0,0,0,0.3)",
              cursor: "grab",
            }}
          >
            <Typography sx={{ color: "#fff", mb: 1 }}>
              <TimerOutlined /> {Math.floor(callTime / 60)}:{callTime % 60 < 10 ? "0" : ""}
              {callTime % 60}
            </Typography>
            <video ref={localVideoRef} autoPlay muted style={{ width: "200px", borderRadius: "8px" }} />
            {Object.keys(remoteVideos).map((userId) => (
              <video
                key={userId}
                ref={remoteVideos[userId].ref}
                autoPlay
                style={{ width: "200px", borderRadius: "8px", marginTop: "10px" }}
              />
            ))}

            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <IconButton onClick={toggleMute} sx={{ color: "#fff" }}>
                {isMuted ? <MicOff /> : <Mic />}
              </IconButton>
              <IconButton onClick={toggleVideo} sx={{ color: "#fff" }}>
                {videoEnabled ? <Videocam /> : <VideocamOff />}
              </IconButton>
              <IconButton onClick={toggleBlur} sx={{ color: "#fff" }}>
                {blurEffect ? "🔲" : "🔳"}
              </IconButton>
              <IconButton sx={{ color: "red" }} onClick={() => setInCall(false)}>
                <CallEnd />
              </IconButton>
            </Box>
          </Box>
        </Draggable>
      )}
    </>
  );
};

export default GroupCall;
