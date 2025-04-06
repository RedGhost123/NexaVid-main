const [incomingCall, setIncomingCall] = useState(null);

useEffect(() => {
  socket.on("incomingCall", (callData) => {
    setIncomingCall(callData);
    new Notification("Incoming Call", { body: `${callData.callerName} is calling...` });
  });

  return () => socket.off("incomingCall");
}, []);

const acceptCall = () => {
  socket.emit("acceptCall", { callId: incomingCall.callId });
  setIncomingCall(null);
};

return incomingCall ? (
  <div className="call-notification">
    <p>{incomingCall.callerName} is calling...</p>
    <button onClick={acceptCall}>Accept</button>
    <button onClick={() => setIncomingCall(null)}>Decline</button>
  </div>
) : null;
