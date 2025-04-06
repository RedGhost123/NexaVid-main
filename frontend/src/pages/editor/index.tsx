import React from 'react';
import CallRoom from '../../components/CallRoom';

const VideoEditorPage = () => {
  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <h1>NexaVid AI Video Editor</h1>
      {/* Your Editor UI goes here */}
      <CallRoom />
    </div>
  );
};

export default VideoEditorPage;
