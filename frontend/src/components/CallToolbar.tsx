import React from 'react';
import { Box, IconButton, Tooltip, Stack } from '@mui/material';
import {
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Videocam as VideoIcon,
  VideocamOff as VideoOffIcon,
  ScreenShare as ScreenShareIcon,
  StopScreenShare as StopScreenShareIcon,
  CallEnd as EndCallIcon,
  AttachFile as FileShareIcon,
} from '@mui/icons-material';

type Props = {
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  onToggleMic: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onFileShare: () => void;
  onEndCall: () => void;
};

const CallToolbar: React.FC<Props> = ({
  isMuted,
  isVideoOff,
  isScreenSharing,
  onToggleMic,
  onToggleVideo,
  onToggleScreenShare,
  onFileShare,
  onEndCall,
}) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.6)',
        padding: '10px 20px',
        borderRadius: '30px',
        zIndex: 999,
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Tooltip title={isMuted ? 'Unmute' : 'Mute'}>
          <IconButton color="inherit" onClick={onToggleMic}>
            {isMuted ? <MicOffIcon /> : <MicIcon />}
          </IconButton>
        </Tooltip>

        <Tooltip title={isVideoOff ? 'Start Video' : 'Stop Video'}>
          <IconButton color="inherit" onClick={onToggleVideo}>
            {isVideoOff ? <VideoOffIcon /> : <VideoIcon />}
          </IconButton>
        </Tooltip>

        <Tooltip title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}>
          <IconButton color="inherit" onClick={onToggleScreenShare}>
            {isScreenSharing ? <StopScreenShareIcon /> : <ScreenShareIcon />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Send File">
          <IconButton color="inherit" component="label">
            <FileShareIcon />
            <input hidden type="file" onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                onFileShare();
              }
            }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="End Call">
          <IconButton color="error" onClick={onEndCall}>
            <EndCallIcon />
          </IconButton>
        </Tooltip>
      </Stack>
    </Box>
  );
};

export default CallToolbar;
