import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@mui/material";

const API_BASE_URL = "http://localhost:3001/timeline"; // Adjust based on your backend

const TimelineEditor = ({ projectId }) => {
  const [timelineData, setTimelineData] = useState([
    { name: "Intro.mp4", start: 0, end: 4 },
    { name: "CutScene.mp4", start: 4, end: 9 },
    { name: "Outro.mp4", start: 9, end: 12 },
  ]);
  

  // Load saved timeline from backend
  useEffect(() => {
    axios.get(`${API_BASE_URL}/${projectId}`).then((response) => {
      if (response.data) {
        setTimelineData(response.data.edits);
      }
    });
  }, [projectId]);

  // Save edits to backend
  const saveEdits = () => {
    axios.post(`${API_BASE_URL}/save`, {
      projectId,
      edits: timelineData,
    });
  };

  // Undo last edit
  const undoEdit = () => {
    axios.patch(`${API_BASE_URL}/undo/${projectId}`).then((response) => {
      setTimelineData(response.data.edits);
    });
  };

  // Redo last edit (coming soon)
  const redoEdit = () => {
    axios.patch(`${API_BASE_URL}/redo/${projectId}`).then((response) => {
      console.log(response.data.message); // Redo logic will be added later
    });
  };

  return (
    <div>
      <h2>Timeline Editor</h2>
      {/* Display Timeline Edits */}
      <div>
        {timelineData.map((edit, index) => (
          <p key={index}>{edit.action}</p>
        ))}
      </div>

      {/* Controls */}
      <Button variant="contained" color="primary" onClick={saveEdits}>
        Save
      </Button>
      <Button variant="outlined" color="secondary" onClick={undoEdit}>
        Undo
      </Button>
      <Button variant="outlined" onClick={redoEdit}>
        Redo
      </Button>
    </div>
  );
  <div style={{ display: 'flex', gap: 10 }}>
  <video id="localVideo" autoPlay muted style={{ width: 200, height: 150, background: '#000' }} />
  <video id="remoteVideo" autoPlay style={{ width: 200, height: 150, background: '#000' }} />
</div>

};

export default TimelineEditor;
import { IconButton, Tooltip } from '@mui/material';
import CallIcon from '@mui/icons-material/Call';
import VideocamIcon from '@mui/icons-material/Videocam';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import CancelIcon from '@mui/icons-material/Cancel';
import UploadFileIcon from '@mui/icons-material/UploadFile';



<Tooltip title="Start Audio Call">
  <IconButton onClick={handleStartAudioCall}>
    <CallIcon />
  </IconButton>
</Tooltip>

<Tooltip title="Start Video Call">
  <IconButton onClick={handleStartVideoCall}>
    <VideocamIcon />
  </IconButton>
</Tooltip>

<Tooltip title="Share Screen">
  <IconButton onClick={handleShareScreen}>
    <ScreenShareIcon />
  </IconButton>
</Tooltip>

<Tooltip title="Send Media File">
  <IconButton onClick={handleSendMedia}>
    <UploadFileIcon />
  </IconButton>
</Tooltip>

<Tooltip title="End Call">
  <IconButton onClick={handleEndCall}>
    <CancelIcon />
  </IconButton>
</Tooltip>


import { useCallManager } from '../../../backend/src/hooks/useCallManager';

const {
  localVideoRef,
  remoteVideoRef,
  handleStartAudioCall,
  handleStartVideoCall,
  handleShareScreen,
  handleSendMedia,
  handleEndCall
} = useCallManager();

// Attach video refs to DOM <video> elements
<video ref={localVideoRef} ... />
<video ref={remoteVideoRef} ... />


import { useCallReceiver } from '../../../backend/src/hooks/useCallReceiver';

const {
  incomingCall,
  localVideoRef,
  remoteVideoRef,
  answerCall,
  rejectCall,
} = useCallReceiver();

{incomingCall && (
  <div className="popup">
    <p>📞 Incoming call from {incomingCall.from}</p>
    <button onClick={() => answerCall(incomingCall.callId)}>Accept</button>
    <button onClick={() => rejectCall(incomingCall.callId)}>Reject</button>
  </div>
)}

<video ref={localVideoRef} autoPlay playsInline muted />
<video ref={remoteVideoRef} autoPlay playsInline />
import dynamic from 'next/dynamic';
const CallPanel = dynamic(() => import('@/components/CallPanel'), { ssr: false });

...

return (
  <>
    {/* ... Your Timeline Editor Layout ... */}
    <CallPanel />
  </>
);
