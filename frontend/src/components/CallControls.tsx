import { Button, Stack } from '@mui/material';

export default function CallControls({ peerConnection, streamRef }) {
  const shareScreen = async () => {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    const screenTrack = screenStream.getVideoTracks()[0];
    const sender = peerConnection.getSenders().find(s => s.track?.kind === 'video');
    sender?.replaceTrack(screenTrack);

    screenTrack.onended = () => {
      const originalTrack = streamRef.current?.getVideoTracks()[0];
      sender?.replaceTrack(originalTrack!);
    };
  };

  return (
    <Stack direction="row" spacing={2} mt={2}>
      <Button variant="contained" onClick={shareScreen}>Share Screen</Button>
      <Button variant="outlined" color="error">End Call</Button>
    </Stack>
  );
}
