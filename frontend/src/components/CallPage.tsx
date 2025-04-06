import {
    Tooltip,
    IconButton,
    Stack,
    Fab,
    Zoom,
    useTheme,
  } from "@mui/material";
  import {
    CallEnd,
    Mic,
    MicOff,
    Videocam,
    VideocamOff,
    ScreenShare,
    StopScreenShare,
    AttachFile,
    People,
  } from "@mui/icons-material";
  
  ...
  
  <Fab
    color="error"
    onClick={handleEndCall}
    sx={{ position: "absolute", bottom: 16, zIndex: 10 }}
  >
    <CallEnd />
  </Fab>
  
  <Stack
    direction="row"
    spacing={2}
    sx={{
      position: "absolute",
      bottom: 90,
      left: "50%",
      transform: "translateX(-50%)",
      background: "rgba(0,0,0,0.6)",
      borderRadius: 4,
      px: 3,
      py: 1,
      zIndex: 10,
    }}
  >
    <Tooltip title={isMuted ? "Unmute" : "Mute"}>
      <IconButton color="primary" onClick={toggleMic}>
        {isMuted ? <MicOff /> : <Mic />}
      </IconButton>
    </Tooltip>
  
    <Tooltip title={isVideoOff ? "Start Video" : "Stop Video"}>
      <IconButton color="primary" onClick={toggleVideo}>
        {isVideoOff ? <VideocamOff /> : <Videocam />}
      </IconButton>
    </Tooltip>
  
    <Tooltip title={isScreenSharing ? "Stop Share" : "Share Screen"}>
      <IconButton color="primary" onClick={toggleScreenShare}>
        {isScreenSharing ? <StopScreenShare /> : <ScreenShare />}
      </IconButton>
    </Tooltip>
  
    <Tooltip title="Send Media File">
      <IconButton color="primary" onClick={handleSendFile}>
        <AttachFile />
      </IconButton>
    </Tooltip>
  
    <Tooltip title="Participants">
      <IconButton color="primary" onClick={openParticipants}>
        <People />
      </IconButton>
    </Tooltip>
  </Stack>
  